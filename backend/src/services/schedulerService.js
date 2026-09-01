'use strict';

const db = require('../config/db');
const notificationModel = require('../models/notificationModel');

/**
 * Scheduler Service
 * Background job engine for:
 * 1. Automatic Overdue status transition & Overdue notifications
 * 2. Reservation hold expiry & Queue promotion or shelf release
 * 3. Upcoming due date reminder notifications
 */

let schedulerInterval = null;

/**
 * 1. Process Overdue Borrowings
 * Changes status 'borrowed' -> 'overdue' for past due items and sends alert
 */
const processOverdueBorrowings = async () => {
  try {
    const [overdueList] = await db.query(
      `SELECT b.id, b.borrowing_code, b.member_id, b.due_date, m.user_id, bk.title AS book_title,
              DATEDIFF(CURDATE(), b.due_date) AS days_late
       FROM borrowings b
       JOIN members m ON b.member_id = m.id
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       WHERE b.status = 'borrowed' AND b.due_date < CURDATE()`
    );

    let updatedCount = 0;

    for (const item of overdueList) {
      // 1. Update status to 'overdue'
      await db.query(
        `UPDATE borrowings SET status = 'overdue', updated_at = NOW() WHERE id = ?`,
        [item.id]
      );

      // 2. Record status history
      await db.query(
        `INSERT INTO borrowing_status_history (
           borrowing_id, from_status, to_status, changed_by, change_reason
         ) VALUES (?, 'borrowed', 'overdue', 1, 'Automated scheduler overdue detection')`,
        [item.id]
      );

      // 3. Send Notification (if not already notified today)
      const alreadySent = await notificationModel.existsDuplicateToday(
        item.user_id,
        'overdue_alert',
        'borrowings',
        item.id
      );

      if (!alreadySent) {
        await notificationModel.create({
          user_id: item.user_id,
          type: 'overdue_alert',
          title: 'หนังสือเกินกำหนดส่งคืน (Overdue Alert)',
          message: `หนังสือ "${item.book_title}" ของคุณเกินกำหนดส่งคืนมาแล้ว ${item.days_late} วัน กรุณานำส่งคืนที่ห้องสมุดโดยเร็ว เพื่อหลีกเลี่ยงค่าปรับสะสม`,
          related_entity_type: 'borrowings',
          related_entity_id: item.id,
        });
      }

      updatedCount++;
    }

    return { processed_overdues: updatedCount };
  } catch (error) {
    console.error('❌ Scheduler Error in processOverdueBorrowings:', error.message);
    throw error;
  }
};

/**
 * 2. Process Expired Reservations
 * Checks reservations with status 'available' past hold_until_date
 */
const processExpiredReservations = async () => {
  try {
    const [expiredList] = await db.query(
      `SELECT r.id, r.book_id, r.allocated_copy_id, r.member_id, m.user_id, bk.title AS book_title
       FROM reservations r
       JOIN members m ON r.member_id = m.id
       JOIN books bk ON r.book_id = bk.id
       WHERE r.status = 'available' AND r.hold_until_date < NOW()`
    );

    let expiredCount = 0;

    for (const res of expiredList) {
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // 1. Mark this reservation as expired
        await connection.query(
          `UPDATE reservations SET status = 'expired', updated_at = NOW() WHERE id = ?`,
          [res.id]
        );

        // 2. Notify member that their reservation hold expired
        await connection.query(
          `INSERT INTO notifications (
             user_id, type, title, message, related_entity_type, related_entity_id
           ) VALUES (?, 'reservation_expired', 'สิทธิ์การจองหนังสือหมดอายุ', ?, 'reservations', ?)`,
          [
            res.user_id,
            `สิทธิ์การรับหนังสือ "${res.book_title}" ของคุณหมดอายุแล้ว เนื่องจากไม่มารับภายในเวลาที่กำหนด`,
            res.id,
          ]
        );

        // 3. Check next pending reservation in queue
        const [nextInQueue] = await connection.query(
          `SELECT r.id, r.member_id, m.user_id AS res_user_id 
           FROM reservations r
           JOIN members m ON r.member_id = m.id
           WHERE r.book_id = ? AND r.status = 'pending'
           ORDER BY r.queue_number ASC, r.reservation_date ASC
           LIMIT 1 FOR UPDATE`,
          [res.book_id]
        );

        if (nextInQueue.length > 0) {
          const nextRes = nextInQueue[0];
          // Get hold days setting (default 3)
          const [settings] = await connection.query(
            `SELECT setting_value FROM library_settings WHERE setting_key = 'reservation_hold_days'`
          );
          const holdDays = settings.length > 0 ? parseInt(settings[0].setting_value, 10) || 3 : 3;

          const [holdDateResult] = await connection.query(
            `SELECT DATE_ADD(NOW(), INTERVAL ? DAY) AS hold_until`,
            [holdDays]
          );
          const holdUntil = holdDateResult[0].hold_until;

          // Transfer allocated copy to next reservation
          await connection.query(
            `UPDATE reservations SET 
               status = 'available', 
               allocated_copy_id = ?, 
               hold_until_date = ?, 
               updated_at = NOW() 
             WHERE id = ?`,
            [res.allocated_copy_id, holdUntil, nextRes.id]
          );

          // Shift queue numbers down
          await connection.query(
            `UPDATE reservations SET queue_number = queue_number - 1 
             WHERE book_id = ? AND status = 'pending'`,
            [res.book_id]
          );

          // Notify promoted member
          await connection.query(
            `INSERT INTO notifications (
               user_id, type, title, message, related_entity_type, related_entity_id
             ) VALUES (?, 'reservation_available', 'หนังสือที่ท่านจองพร้อมรับแล้ว', ?, 'reservations', ?)`,
            [
              nextRes.res_user_id,
              `หนังสือ "${res.book_title}" พร้อมให้คุณรับแล้ว สิทธิ์ของคุณจะหมดลงในวันที่ ${new Date(holdUntil).toLocaleString('th-TH')}`,
              nextRes.id,
            ]
          );
        } else {
          // No one else in queue -> release copy back to shelf
          if (res.allocated_copy_id) {
            await connection.query(
              `UPDATE book_copies SET status = 'available', updated_at = NOW() WHERE id = ?`,
              [res.allocated_copy_id]
            );

            await connection.query(
              `UPDATE books SET available_copies = available_copies + 1, updated_at = NOW() WHERE id = ?`,
              [res.book_id]
            );
          }
        }

        await connection.commit();
        expiredCount++;
      } catch (err) {
        await connection.rollback();
        console.error('Error processing single reservation expiry:', err);
      } finally {
        connection.release();
      }
    }

    return { processed_expired_reservations: expiredCount };
  } catch (error) {
    console.error('❌ Scheduler Error in processExpiredReservations:', error.message);
    throw error;
  }
};

/**
 * 3. Send Upcoming Due Date Reminders
 * Sends notification for books due tomorrow
 */
const sendUpcomingDueReminders = async () => {
  try {
    const [upcomingList] = await db.query(
      `SELECT b.id, b.borrowing_code, b.member_id, b.due_date, m.user_id, bk.title AS book_title
       FROM borrowings b
       JOIN members m ON b.member_id = m.id
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       WHERE b.status = 'borrowed' AND b.due_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)`
    );

    let sentCount = 0;

    for (const item of upcomingList) {
      const alreadySent = await notificationModel.existsDuplicateToday(
        item.user_id,
        'due_date_reminder',
        'borrowings',
        item.id
      );

      if (!alreadySent) {
        await notificationModel.create({
          user_id: item.user_id,
          type: 'due_date_reminder',
          title: 'เตือนความจำ: กำหนดส่งคืนหนังสือวันพรุ่งนี้',
          message: `หนังสือ "${item.book_title}" มีกำหนดส่งคืนในวันพรุ่งนี้ (${new Date(item.due_date).toLocaleDateString('th-TH')}) กรุณาเตรียมส่งคืนเพื่อหลีกเลี่ยงค่าปรับ`,
          related_entity_type: 'borrowings',
          related_entity_id: item.id,
        });
        sentCount++;
      }
    }

    return { sent_reminders: sentCount };
  } catch (error) {
    console.error('❌ Scheduler Error in sendUpcomingDueReminders:', error.message);
    throw error;
  }
};

/**
 * Run all scheduled tasks once
 */
const runAllScheduledTasks = async () => {
  const overdues = await processOverdueBorrowings();
  const reservations = await processExpiredReservations();
  const reminders = await sendUpcomingDueReminders();
  return { ...overdues, ...reservations, ...reminders };
};

/**
 * Start background scheduler runner (runs every 60 minutes)
 */
const startScheduler = (intervalMinutes = 60) => {
  if (schedulerInterval) return;

  const ms = intervalMinutes * 60 * 1000;
  schedulerInterval = setInterval(async () => {
    try {
      await runAllScheduledTasks();
    } catch (err) {
      console.error('Scheduler periodic execution error:', err.message);
    }
  }, ms);
};

/**
 * Stop background scheduler runner
 */
const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};

module.exports = {
  processOverdueBorrowings,
  processExpiredReservations,
  sendUpcomingDueReminders,
  runAllScheduledTasks,
  startScheduler,
  stopScheduler,
};
