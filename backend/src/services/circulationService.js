'use strict';

const db = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Circulation Service
 * Core business engine for Borrowing, Returning, and Reservation transactions with ACID support.
 */

// Helper to generate unique transaction codes
const generateCode = (prefix) => {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const randomStr = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${dateStr}-${randomStr}`;
};

// Helper to get system setting with fallback
const getSettingValue = async (key, fallback, connection = db) => {
  const [rows] = await connection.query(
    'SELECT setting_value FROM library_settings WHERE setting_key = ?',
    [key]
  );
  return rows.length > 0 ? rows[0].setting_value : fallback;
};

/**
 * -------------------------------------------------------------
 * 1. BORROW BOOK
 * -------------------------------------------------------------
 */
const borrowBook = async ({
  memberId,
  bookCopyId,
  barcode,
  bookId,
  processedByUserId,
  notes = null,
}) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Verify Member Profile & Status
    const [members] = await connection.query(
      `SELECT m.id, m.user_id, m.member_code, m.first_name, m.last_name, m.membership_status, m.max_borrow_limit 
       FROM members m 
       WHERE m.id = ? FOR UPDATE`,
      [memberId]
    );

    if (members.length === 0) {
      throw new AppError('Member not found.', 404);
    }

    const member = members[0];
    if (member.membership_status !== 'active') {
      throw new AppError(`Cannot borrow book: Member status is '${member.membership_status}'.`, 400);
    }

    // 2. Check Member Active Borrow Quota
    const [borrowCountResult] = await connection.query(
      `SELECT COUNT(*) AS active_count 
       FROM borrowings 
       WHERE member_id = ? AND status IN ('borrowed', 'overdue')`,
      [memberId]
    );

    const activeCount = borrowCountResult[0].active_count;
    if (activeCount >= member.max_borrow_limit) {
      throw new AppError(
        `Borrow quota exceeded. Member has ${activeCount} active borrowed books (Max limit: ${member.max_borrow_limit}).`,
        400
      );
    }

    // 3. Identify & Lock Physical Copy
    let copyQuery = `
      SELECT bc.id, bc.book_id, bc.barcode, bc.copy_number, bc.status, b.title, b.isbn, b.available_copies 
      FROM book_copies bc
      JOIN books b ON bc.book_id = b.id
      WHERE b.deleted_at IS NULL
    `;
    const copyParams = [];

    if (bookCopyId) {
      copyQuery += ` AND bc.id = ?`;
      copyParams.push(bookCopyId);
    } else if (barcode) {
      copyQuery += ` AND bc.barcode = ?`;
      copyParams.push(barcode.trim());
    } else if (bookId) {
      copyQuery += ` AND bc.book_id = ? AND bc.status = 'available' LIMIT 1`;
      copyParams.push(bookId);
    } else {
      throw new AppError('Either book_copy_id, barcode, or book_id is required.', 400);
    }

    copyQuery += ` FOR UPDATE`;

    const [copies] = await connection.query(copyQuery, copyParams);
    if (copies.length === 0) {
      throw new AppError('No available copy found for the specified book.', 400);
    }

    const copy = copies[0];

    // 4. Prevent duplicate borrowing of the same book
    const [duplicateBorrows] = await connection.query(
      `SELECT b.id FROM borrowings b
       JOIN book_copies bc ON b.book_copy_id = bc.id
       WHERE b.member_id = ? AND bc.book_id = ? AND b.status IN ('borrowed', 'overdue')`,
      [memberId, copy.book_id]
    );

    if (duplicateBorrows.length > 0) {
      throw new AppError(
        `Member already has an active borrowed copy of '${copy.title}'. Multiple copies of the same title are not allowed.`,
        400
      );
    }

    // 5. Handle Reservation Fulfillment
    // Check if this member has an active reservation for this book
    const [memberReservations] = await connection.query(
      `SELECT id, status, allocated_copy_id 
       FROM reservations 
       WHERE member_id = ? AND book_id = ? AND status IN ('pending', 'available') 
       ORDER BY reservation_date ASC LIMIT 1 FOR UPDATE`,
      [memberId, copy.book_id]
    );

    let fulfilledReservationId = null;

    if (copy.status === 'reserved_hold') {
      // If the copy is locked in hold status, verify it was locked for THIS member
      if (
        memberReservations.length > 0 &&
        memberReservations[0].status === 'available' &&
        memberReservations[0].allocated_copy_id === copy.id
      ) {
        fulfilledReservationId = memberReservations[0].id;
      } else {
        throw new AppError(
          'This book copy is currently reserved and held for another member.',
          400
        );
      }
    } else if (copy.status !== 'available') {
      throw new AppError(`Book copy is not available for borrowing (Current status: ${copy.status}).`, 400);
    } else {
      // Copy is available
      if (memberReservations.length > 0) {
        fulfilledReservationId = memberReservations[0].id;
      }
    }

    // 6. Calculate Due Date from Library Settings
    const borrowDaysStr = await getSettingValue('default_borrow_days', '14', connection);
    const borrowDays = parseInt(borrowDaysStr, 10) || 14;

    const [dateResult] = await connection.query(
      `SELECT CURDATE() AS borrow_date, DATE_ADD(CURDATE(), INTERVAL ? DAY) AS due_date`,
      [borrowDays]
    );
    const { borrow_date, due_date } = dateResult[0];

    // 7. Update Book Copy Status to 'borrowed'
    await connection.query(
      `UPDATE book_copies SET status = 'borrowed', updated_at = NOW() WHERE id = ?`,
      [copy.id]
    );

    // 8. Decrement Parent Book Available Copies
    await connection.query(
      `UPDATE books SET 
         available_copies = GREATEST(0, available_copies - 1),
         updated_at = NOW() 
       WHERE id = ?`,
      [copy.book_id]
    );

    // 9. Generate Borrowing Code and Create Record
    const borrowingCode = generateCode('BRW');
    const [insertResult] = await connection.query(
      `INSERT INTO borrowings (
         borrowing_code, member_id, book_copy_id, 
         borrow_date, due_date, status, processed_by, notes
       ) VALUES (?, ?, ?, ?, ?, 'borrowed', ?, ?)`,
      [borrowingCode, memberId, copy.id, borrow_date, due_date, processedByUserId, notes]
    );
    const borrowingId = insertResult.insertId;

    // 10. Record in borrowing_status_history
    await connection.query(
      `INSERT INTO borrowing_status_history (
         borrowing_id, from_status, to_status, changed_by, change_reason
       ) VALUES (?, NULL, 'borrowed', ?, 'Book checkout')`,
      [borrowingId, processedByUserId]
    );

    // 11. If this fulfilled a reservation, update reservation status to 'fulfilled'
    if (fulfilledReservationId) {
      await connection.query(
        `UPDATE reservations SET status = 'fulfilled', updated_at = NOW() WHERE id = ?`,
        [fulfilledReservationId]
      );
    }

    // 12. Create in-app notification for member
    await connection.query(
      `INSERT INTO notifications (
         user_id, type, title, message, related_entity_type, related_entity_id
       ) VALUES (?, 'borrow_success', 'ยืมหนังสือสำเร็จ', ?, 'borrowings', ?)`,
      [
        member.user_id,
        `คุณได้ยืมหนังสือ "${copy.title}" เรียบร้อยแล้ว กำหนดส่งคืนวันที่ ${new Date(due_date).toLocaleDateString('th-TH')}`,
        borrowingId,
      ]
    );

    await connection.commit();

    return {
      id: borrowingId,
      borrowing_code: borrowingCode,
      member_id: member.id,
      member_name: `${member.first_name} ${member.last_name}`,
      book_id: copy.book_id,
      book_title: copy.title,
      barcode: copy.barcode,
      borrow_date,
      due_date,
      status: 'borrowed',
      notes,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * -------------------------------------------------------------
 * 2. RETURN BOOK
 * -------------------------------------------------------------
 */
const returnBook = async ({ borrowingId, returnedToUserId, returnDate = null, notes = null }) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Lock and Fetch Borrowing Record
    const [borrowings] = await connection.query(
      `SELECT b.id, b.borrowing_code, b.member_id, b.book_copy_id, b.borrow_date, b.due_date, b.status,
              m.user_id AS member_user_id, m.first_name, m.last_name,
              bc.book_id, bc.barcode, bk.title AS book_title
       FROM borrowings b
       JOIN members m ON b.member_id = m.id
       JOIN book_copies bc ON b.book_copy_id = bc.id
       JOIN books bk ON bc.book_id = bk.id
       WHERE b.id = ? FOR UPDATE`,
      [borrowingId]
    );

    if (borrowings.length === 0) {
      throw new AppError('Borrowing record not found.', 404);
    }

    const borrowing = borrowings[0];

    if (borrowing.status === 'returned') {
      throw new AppError('This book has already been returned.', 400);
    }

    // 2. Determine actual return date
    const [dateRow] = await connection.query(
      `SELECT COALESCE(?, CURDATE()) AS actual_return_date`,
      [returnDate || null]
    );
    const actualReturnDate = dateRow[0].actual_return_date;

    // 3. Update Borrowing Status to 'returned'
    await connection.query(
      `UPDATE borrowings SET 
         status = 'returned',
         return_date = ?,
         returned_to_user_id = ?,
         notes = COALESCE(?, notes),
         updated_at = NOW()
       WHERE id = ?`,
      [actualReturnDate, returnedToUserId, notes, borrowingId]
    );

    // 4. Record Status History
    await connection.query(
      `INSERT INTO borrowing_status_history (
         borrowing_id, from_status, to_status, changed_by, change_reason
       ) VALUES (?, ?, 'returned', ?, 'Book return processed')`,
      [borrowingId, borrowing.status, returnedToUserId]
    );

    // 5. Check and Calculate Overdue Fine
    let fineIncurred = null;
    const [diffResult] = await connection.query(
      `SELECT DATEDIFF(?, ?) AS overdue_days`,
      [actualReturnDate, borrowing.due_date]
    );
    const overdueDays = diffResult[0].overdue_days;

    if (overdueDays > 0) {
      const fineRateStr = await getSettingValue('fine_rate_per_day', '5.00', connection);
      const fineRate = parseFloat(fineRateStr) || 5.0;
      const totalFine = (overdueDays * fineRate).toFixed(2);

      const fineCode = generateCode('FIN');

      const [fineInsert] = await connection.query(
        `INSERT INTO fines (
           fine_code, borrowing_id, member_id, overdue_days, daily_rate, amount, status
         ) VALUES (?, ?, ?, ?, ?, ?, 'unpaid')`,
        [fineCode, borrowingId, borrowing.member_id, overdueDays, fineRate, totalFine]
      );

      fineIncurred = {
        id: fineInsert.insertId,
        fine_code: fineCode,
        overdue_days: overdueDays,
        daily_rate: fineRate,
        amount: parseFloat(totalFine),
        status: 'unpaid',
      };

      // Notification about fine
      await connection.query(
        `INSERT INTO notifications (
           user_id, type, title, message, related_entity_type, related_entity_id
         ) VALUES (?, 'fine_issued', 'มีค่าปรับจากการส่งคืนล่าช้า', ?, 'fines', ?)`,
        [
          borrowing.member_user_id,
          `คุณส่งคืนหนังสือ "${borrowing.book_title}" ช้ากว่ากำหนด ${overdueDays} วัน ยอดค่าปรับ ${totalFine} บาท กรุณาติดต่อชำระที่เคาน์เตอร์`,
          fineInsert.insertId,
        ]
      );
    }

    // 6. Check Next Reservation in Queue (First-Come, First-Served)
    const [nextReservations] = await connection.query(
      `SELECT r.id, r.member_id, r.reservation_code, m.user_id AS res_user_id, m.first_name, m.last_name
       FROM reservations r
       JOIN members m ON r.member_id = m.id
       WHERE r.book_id = ? AND r.status = 'pending'
       ORDER BY r.queue_number ASC, r.reservation_date ASC
       LIMIT 1 FOR UPDATE`,
      [borrowing.book_id]
    );

    let nextReservation = null;

    if (nextReservations.length > 0) {
      const res = nextReservations[0];
      const holdDaysStr = await getSettingValue('reservation_hold_days', '3', connection);
      const holdDays = parseInt(holdDaysStr, 10) || 3;

      const [holdDateResult] = await connection.query(
        `SELECT DATE_ADD(NOW(), INTERVAL ? DAY) AS hold_until`,
        [holdDays]
      );
      const holdUntil = holdDateResult[0].hold_until;

      // Lock copy for the reservation holder
      await connection.query(
        `UPDATE book_copies SET status = 'reserved_hold', updated_at = NOW() WHERE id = ?`,
        [borrowing.book_copy_id]
      );

      // Update reservation to 'available'
      await connection.query(
        `UPDATE reservations SET 
           status = 'available',
           allocated_copy_id = ?,
           hold_until_date = ?,
           updated_at = NOW()
         WHERE id = ?`,
        [borrowing.book_copy_id, holdUntil, res.id]
      );

      // Notify the reservation holder
      await connection.query(
        `INSERT INTO notifications (
           user_id, type, title, message, related_entity_type, related_entity_id
         ) VALUES (?, 'reservation_available', 'หนังสือที่ท่านจองพร้อมรับแล้ว', ?, 'reservations', ?)`,
        [
          res.res_user_id,
          `หนังสือ "${borrowing.book_title}" ที่คุณจองไว้พร้อมให้รับแล้ว สิทธิ์ของคุณจะหมดลงในวันที่ ${new Date(holdUntil).toLocaleString('th-TH')}`,
          res.id,
        ]
      );

      nextReservation = {
        reservation_id: res.id,
        reservation_code: res.reservation_code,
        member_id: res.member_id,
        member_name: `${res.first_name} ${res.last_name}`,
        allocated_copy_id: borrowing.book_copy_id,
        hold_until: holdUntil,
      };
    } else {
      // No reservation -> copy becomes available for everyone
      await connection.query(
        `UPDATE book_copies SET status = 'available', updated_at = NOW() WHERE id = ?`,
        [borrowing.book_copy_id]
      );

      // Increment parent book available copies
      await connection.query(
        `UPDATE books SET 
           available_copies = available_copies + 1,
           updated_at = NOW() 
         WHERE id = ?`,
        [borrowing.book_id]
      );
    }

    await connection.commit();

    return {
      borrowing_id: borrowing.id,
      borrowing_code: borrowing.borrowing_code,
      book_title: borrowing.book_title,
      return_date: actualReturnDate,
      status: 'returned',
      fine_incurred: fineIncurred,
      next_reservation: nextReservation,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * -------------------------------------------------------------
 * 3. CREATE RESERVATION
 * -------------------------------------------------------------
 */
const createReservation = async ({ memberId, bookId }) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Check Member Status
    const [members] = await connection.query(
      `SELECT id, user_id, membership_status FROM members WHERE id = ? FOR UPDATE`,
      [memberId]
    );

    if (members.length === 0) {
      throw new AppError('Member profile not found.', 404);
    }

    const member = members[0];
    if (member.membership_status !== 'active') {
      throw new AppError(`Cannot place reservation: Membership status is '${member.membership_status}'.`, 400);
    }

    // 2. Check Book exists and available_copies === 0 (Requirement: จองได้เฉพาะเล่มที่สต็อก = 0)
    const [books] = await connection.query(
      `SELECT id, title, available_copies, total_copies FROM books WHERE id = ? AND deleted_at IS NULL FOR UPDATE`,
      [bookId]
    );

    if (books.length === 0) {
      throw new AppError('Book not found.', 404);
    }

    const book = books[0];

    if (book.available_copies > 0) {
      throw new AppError(
        `Cannot place reservation: Book '${book.title}' currently has ${book.available_copies} copy/copies available on the shelf. Please borrow directly.`,
        400
      );
    }

    // 3. Check for existing active reservation for this book by this member
    const [existingReservations] = await connection.query(
      `SELECT id, status FROM reservations 
       WHERE member_id = ? AND book_id = ? AND status IN ('pending', 'available')`,
      [memberId, bookId]
    );

    if (existingReservations.length > 0) {
      throw new AppError(
        `You already have an active reservation for '${book.title}' (Status: ${existingReservations[0].status}).`,
        409
      );
    }

    // 4. Check Member Active Reservation Limit
    const maxReservationsStr = await getSettingValue('max_reservations', '3', connection);
    const maxReservations = parseInt(maxReservationsStr, 10) || 3;

    const [activeResCount] = await connection.query(
      `SELECT COUNT(*) AS active_count FROM reservations WHERE member_id = ? AND status IN ('pending', 'available')`,
      [memberId]
    );

    if (activeResCount[0].active_count >= maxReservations) {
      throw new AppError(
        `Reservation limit exceeded. You currently have ${activeResCount[0].active_count} active reservations (Max allowed: ${maxReservations}).`,
        400
      );
    }

    // 5. Calculate Next Queue Number
    const [queueResult] = await connection.query(
      `SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_queue 
       FROM reservations 
       WHERE book_id = ? AND status = 'pending'`,
      [bookId]
    );
    const queueNumber = queueResult[0].next_queue;

    // 6. Generate Code & Insert
    const reservationCode = generateCode('RSV');
    const [insertResult] = await connection.query(
      `INSERT INTO reservations (
         reservation_code, member_id, book_id, queue_number, status
       ) VALUES (?, ?, ?, ?, 'pending')`,
      [reservationCode, memberId, bookId, queueNumber]
    );

    const reservationId = insertResult.insertId;

    // 7. Notification
    await connection.query(
      `INSERT INTO notifications (
         user_id, type, title, message, related_entity_type, related_entity_id
       ) VALUES (?, 'reservation_queued', 'จองหนังสือสำเร็จ', ?, 'reservations', ?)`,
      [
        member.user_id,
        `คุณได้เข้าคิวจองหนังสือ "${book.title}" ลำดับคิวที่ ${queueNumber} ระบบจะแจ้งเตือนเมื่อหนังสือพร้อมให้ยืม`,
        reservationId,
      ]
    );

    await connection.commit();

    return {
      id: reservationId,
      reservation_code: reservationCode,
      member_id: memberId,
      book_id: bookId,
      book_title: book.title,
      queue_number: queueNumber,
      status: 'pending',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * -------------------------------------------------------------
 * 4. CANCEL RESERVATION
 * -------------------------------------------------------------
 */
const cancelReservation = async ({ reservationId, reqUser }) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [reservations] = await connection.query(
      `SELECT r.id, r.reservation_code, r.member_id, r.book_id, r.queue_number, r.status, r.allocated_copy_id,
              m.user_id AS member_user_id, b.title AS book_title
       FROM reservations r
       JOIN members m ON r.member_id = m.id
       JOIN books b ON r.book_id = b.id
       WHERE r.id = ? FOR UPDATE`,
      [reservationId]
    );

    if (reservations.length === 0) {
      throw new AppError('Reservation not found.', 404);
    }

    const reservation = reservations[0];

    // IDOR check: members can only cancel their own reservations
    if (reqUser.role === 'member' && reservation.member_user_id !== reqUser.id) {
      throw new AppError('Forbidden: You can only cancel your own reservations.', 403);
    }

    if (!['pending', 'available'].includes(reservation.status)) {
      throw new AppError(`Cannot cancel reservation with status '${reservation.status}'.`, 400);
    }

    // 1. If it was in 'available' status with an allocated copy:
    if (reservation.status === 'available' && reservation.allocated_copy_id) {
      // Find next pending reservation in queue
      const [nextInQueue] = await connection.query(
        `SELECT r.id, r.member_id, m.user_id AS res_user_id 
         FROM reservations r
         JOIN members m ON r.member_id = m.id
         WHERE r.book_id = ? AND r.status = 'pending'
         ORDER BY r.queue_number ASC, r.reservation_date ASC
         LIMIT 1 FOR UPDATE`,
        [reservation.book_id]
      );

      if (nextInQueue.length > 0) {
        const nextRes = nextInQueue[0];
        const holdDaysStr = await getSettingValue('reservation_hold_days', '3', connection);
        const holdDays = parseInt(holdDaysStr, 10) || 3;

        const [holdDateResult] = await connection.query(
          `SELECT DATE_ADD(NOW(), INTERVAL ? DAY) AS hold_until`,
          [holdDays]
        );
        const holdUntil = holdDateResult[0].hold_until;

        // Transfer copy to next reservation
        await connection.query(
          `UPDATE reservations SET 
             status = 'available', 
             allocated_copy_id = ?, 
             hold_until_date = ?, 
             updated_at = NOW() 
           WHERE id = ?`,
          [reservation.allocated_copy_id, holdUntil, nextRes.id]
        );

        // Notify next member
        await connection.query(
          `INSERT INTO notifications (
             user_id, type, title, message, related_entity_type, related_entity_id
           ) VALUES (?, 'reservation_available', 'หนังสือที่ท่านจองพร้อมรับแล้ว', ?, 'reservations', ?)`,
          [
            nextRes.res_user_id,
            `หนังสือ "${reservation.book_title}" พร้อมให้คุณรับแล้ว สิทธิ์ของคุณจะหมดลงในวันที่ ${new Date(holdUntil).toLocaleString('th-TH')}`,
            nextRes.id,
          ]
        );
      } else {
        // No one else in queue -> release copy to 'available'
        await connection.query(
          `UPDATE book_copies SET status = 'available', updated_at = NOW() WHERE id = ?`,
          [reservation.allocated_copy_id]
        );

        // Increment book available copies
        await connection.query(
          `UPDATE books SET available_copies = available_copies + 1, updated_at = NOW() WHERE id = ?`,
          [reservation.book_id]
        );
      }
    }

    // 2. Mark this reservation as cancelled
    await connection.query(
      `UPDATE reservations SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [reservationId]
    );

    // 3. Shift queue numbers for subsequent pending reservations
    if (reservation.status === 'pending') {
      await connection.query(
        `UPDATE reservations SET queue_number = queue_number - 1 
         WHERE book_id = ? AND status = 'pending' AND queue_number > ?`,
        [reservation.book_id, reservation.queue_number]
      );
    }

    await connection.commit();

    return {
      id: reservation.id,
      reservation_code: reservation.reservation_code,
      status: 'cancelled',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * -------------------------------------------------------------
 * 5. QUERY BORROWINGS WITH PAGINATION & FILTERS
 * -------------------------------------------------------------
 */
const getBorrowings = async ({
  page = 1,
  limit = 10,
  status = null,
  memberId = null,
  overdueOnly = false,
  search = '',
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('b.status = ?');
    params.push(status);
  }

  if (memberId) {
    conditions.push('b.member_id = ?');
    params.push(memberId);
  }

  if (overdueOnly === true || overdueOnly === 'true' || overdueOnly === '1') {
    conditions.push("(b.status = 'overdue' OR (b.status = 'borrowed' AND b.due_date < CURDATE()))");
  }

  if (search && search.trim() !== '') {
    conditions.push('(b.borrowing_code LIKE ? OR m.member_code LIKE ? OR bk.title LIKE ? OR bc.barcode LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Total count
  const [countResult] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM borrowings b
     JOIN members m ON b.member_id = m.id
     JOIN book_copies bc ON b.book_copy_id = bc.id
     JOIN books bk ON bc.book_id = bk.id
     ${whereClause}`,
    params
  );
  const totalRecords = countResult[0].total;

  // Records
  const [rows] = await db.query(
    `SELECT 
       b.id,
       b.borrowing_code,
       b.member_id,
       m.member_code,
       m.first_name AS member_first_name,
       m.last_name AS member_last_name,
       b.book_copy_id,
       bc.barcode,
       bk.id AS book_id,
       bk.title AS book_title,
       bk.cover_image_url AS book_cover_image,
       b.borrow_date,
       b.due_date,
       b.return_date,
       b.status,
       b.notes,
       b.created_at,
       (CASE WHEN b.status IN ('borrowed', 'overdue') AND b.due_date < CURDATE() 
             THEN DATEDIFF(CURDATE(), b.due_date) ELSE 0 END) AS current_overdue_days
     FROM borrowings b
     JOIN members m ON b.member_id = m.id
     JOIN book_copies bc ON b.book_copy_id = bc.id
     JOIN books bk ON bc.book_id = bk.id
     ${whereClause}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  return {
    borrowings: rows,
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

/**
 * -------------------------------------------------------------
 * 6. QUERY RESERVATIONS WITH PAGINATION & FILTERS
 * -------------------------------------------------------------
 */
const getReservations = async ({
  page = 1,
  limit = 10,
  status = null,
  memberId = null,
  bookId = null,
  search = '',
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }

  if (memberId) {
    conditions.push('r.member_id = ?');
    params.push(memberId);
  }

  if (bookId) {
    conditions.push('r.book_id = ?');
    params.push(bookId);
  }

  if (search && search.trim() !== '') {
    conditions.push('(r.reservation_code LIKE ? OR m.member_code LIKE ? OR b.title LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Total count
  const [countResult] = await db.query(
    `SELECT COUNT(*) AS total 
     FROM reservations r
     JOIN members m ON r.member_id = m.id
     JOIN books b ON r.book_id = b.id
     ${whereClause}`,
    params
  );
  const totalRecords = countResult[0].total;

  // Records
  const [rows] = await db.query(
    `SELECT 
       r.id,
       r.reservation_code,
       r.member_id,
       m.member_code,
       m.first_name AS member_first_name,
       m.last_name AS member_last_name,
       r.book_id,
       b.title AS book_title,
       b.cover_image_url AS book_cover_image,
       r.queue_number,
       r.reservation_date,
       r.status,
       r.hold_until_date,
       r.allocated_copy_id,
       bc.barcode AS allocated_barcode,
       r.created_at
     FROM reservations r
     JOIN members m ON r.member_id = m.id
     JOIN books b ON r.book_id = b.id
     LEFT JOIN book_copies bc ON r.allocated_copy_id = bc.id
     ${whereClause}
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  return {
    reservations: rows,
    pagination: {
      totalRecords,
      currentPage: pageNum,
      limit: limitNum,
    },
  };
};

module.exports = {
  borrowBook,
  returnBook,
  createReservation,
  cancelReservation,
  getBorrowings,
  getReservations,
};
