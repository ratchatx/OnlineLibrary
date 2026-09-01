-- ============================================================
-- FILE: db/init/01-schema.sql
-- PHASE: Phase 2 — Database Schema & Seed Data
-- DESCRIPTION: DDL Script สร้างโครงสร้างฐานข้อมูลทั้งหมด 15 ตาราง
--              สำหรับ Online Library Management System
--
-- ENGINE:      InnoDB (ACID Transactions, Row-level Lock, FK Support)
-- CHARSET:     utf8mb4
-- COLLATION:   utf8mb4_unicode_ci
-- ORDER:       Master → Core → Transaction → Log/History
--              (เรียงลำดับให้ FK dependency ไม่ขัดกัน)
-- ============================================================

-- ============================================================
-- STEP 0: เลือก Database
-- ============================================================
CREATE DATABASE IF NOT EXISTS library_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE library_db;

-- ปิด Foreign Key Check ชั่วคราวเพื่อรองรับการ re-run
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- GROUP 1: MASTER DATA TABLES (5 ตาราง)
-- ลำดับ: roles → permissions → role_permissions
--        → book_categories → library_settings
-- ============================================================

-- ------------------------------------------------------------
-- TABLE 1: roles
-- บทบาทผู้ใช้งาน (member, librarian, admin)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50)      NOT NULL COMMENT 'ชื่อบทบาท: member, librarian, admin',
  `description` VARCHAR(255)     NULL     DEFAULT NULL COMMENT 'คำอธิบายหน้าที่บทบาท',
  `created_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='บทบาทผู้ใช้งานระบบ RBAC';

-- ------------------------------------------------------------
-- TABLE 2: permissions
-- สิทธิ์การใช้งานระดับอะตอม (เช่น books.create, fines.waive)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `permissions` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `code`        VARCHAR(100)     NOT NULL COMMENT 'รหัสสิทธิ์ เช่น books.create, borrow.process',
  `name`        VARCHAR(100)     NOT NULL COMMENT 'ชื่อสิทธิ์ภาษาอ่านง่าย',
  `module`      VARCHAR(50)      NOT NULL COMMENT 'โมดูลที่เกี่ยวข้อง เช่น books, borrowings, fines',
  `created_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_code` (`code`),
  INDEX `idx_permissions_module` (`module`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='สิทธิ์การใช้งานระบบระดับอะตอม';

-- ------------------------------------------------------------
-- TABLE 3: role_permissions
-- ตารางเชื่อม Many-to-Many ระหว่าง Role กับ Permission
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id`        INT UNSIGNED NOT NULL COMMENT 'FK → roles(id)',
  `permission_id`  INT UNSIGNED NOT NULL COMMENT 'FK → permissions(id)',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_perm` (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role`
    FOREIGN KEY (`role_id`)       REFERENCES `roles`       (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_rp_permission`
    FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE  ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='ตารางเชื่อม Role-Permission (Many-to-Many)';

-- ------------------------------------------------------------
-- TABLE 4: book_categories
-- หมวดหมู่หนังสือ รองรับ Hierarchy ผ่าน parent_id (Self-ref)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `book_categories` (
  `id`          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100)     NOT NULL COMMENT 'ชื่อหมวดหมู่หนังสือ',
  `description` VARCHAR(255)     NULL     DEFAULT NULL COMMENT 'คำอธิบายหมวดหมู่',
  `parent_id`   INT UNSIGNED     NULL     DEFAULT NULL COMMENT 'หมวดหมู่หลัก (Self-reference FK)',
  `created_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at`  DATETIME         NULL     DEFAULT NULL COMMENT 'Soft Delete timestamp',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`),
  INDEX `idx_categories_parent` (`parent_id`),
  CONSTRAINT `fk_category_parent`
    FOREIGN KEY (`parent_id`) REFERENCES `book_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='หมวดหมู่หนังสือ รองรับโครงสร้าง Hierarchy';

-- ------------------------------------------------------------
-- TABLE 5: library_settings
-- ค่ากำหนดของระบบ (ระยะเวลายืม, อัตราค่าปรับ, etc.)
-- updated_by → users(id): ต้องสร้าง users ก่อน
-- แต่สร้าง table นี้ก่อนได้ แล้วเพิ่ม FK หลัง users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `library_settings` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `setting_key`   VARCHAR(100)  NOT NULL COMMENT 'ชื่อคีย์ เช่น default_borrow_days, fine_rate_per_day',
  `setting_value` VARCHAR(255)  NOT NULL COMMENT 'ค่าของคีย์การตั้งค่า',
  `description`   VARCHAR(255)  NULL     DEFAULT NULL COMMENT 'คำอธิบายการตั้งค่า',
  `updated_by`    BIGINT UNSIGNED NULL   DEFAULT NULL COMMENT 'FK → users(id) — เพิ่ม FK หลัง users ถูกสร้าง',
  `updated_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_settings_key` (`setting_key`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='ค่ากำหนดนโยบายระบบห้องสมุด';

-- ============================================================
-- GROUP 2: CORE ENTITY TABLES (4 ตาราง)
-- ลำดับ: users → members → books → book_copies
-- ============================================================

-- ------------------------------------------------------------
-- TABLE 6: users
-- บัญชีผู้ใช้สำหรับ Authentication และ RBAC
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)      NOT NULL COMMENT 'ชื่อบัญชีผู้ใช้งาน',
  `email`         VARCHAR(100)     NOT NULL COMMENT 'อีเมลผู้ใช้งาน',
  `password_hash` VARCHAR(255)     NOT NULL COMMENT 'รหัสผ่าน Hash ด้วย bcrypt',
  `role_id`       INT UNSIGNED     NOT NULL COMMENT 'FK → roles(id)',
  `status`        ENUM('active','suspended','inactive')
                                   NOT NULL DEFAULT 'active' COMMENT 'สถานะบัญชีผู้ใช้',
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`    DATETIME         NULL     DEFAULT NULL COMMENT 'Soft Delete timestamp',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email`    (`email`),
  INDEX `idx_users_role`   (`role_id`),
  INDEX `idx_users_status` (`status`),
  CONSTRAINT `fk_users_role`
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='บัญชีผู้ใช้งานระบบ Authentication & RBAC';

-- เพิ่ม FK ของ library_settings.updated_by ที่รอ users อยู่
ALTER TABLE `library_settings`
  ADD CONSTRAINT `fk_settings_updater`
    FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ------------------------------------------------------------
-- TABLE 7: members
-- โปรไฟล์สมาชิกห้องสมุด (One-to-One กับ users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `members` (
  `id`                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`           BIGINT UNSIGNED  NOT NULL COMMENT 'FK → users(id) — One-to-One',
  `member_code`       VARCHAR(30)      NOT NULL COMMENT 'รหัสประจำตัวสมาชิก เช่น MBR-2026-00001',
  `first_name`        VARCHAR(100)     NOT NULL COMMENT 'ชื่อจริง',
  `last_name`         VARCHAR(100)     NOT NULL COMMENT 'นามสกุล',
  `phone`             VARCHAR(20)      NULL     DEFAULT NULL COMMENT 'เบอร์โทรศัพท์',
  `address`           TEXT             NULL     DEFAULT NULL COMMENT 'ที่อยู่',
  `max_borrow_limit`  INT UNSIGNED     NOT NULL DEFAULT 5 COMMENT 'จำนวนหนังสือสูงสุดที่ยืมพร้อมกัน',
  `membership_status` ENUM('active','expired','suspended')
                                       NOT NULL DEFAULT 'active' COMMENT 'สถานะสมาชิก',
  `created_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_members_user_id`     (`user_id`),
  UNIQUE KEY `uk_members_member_code` (`member_code`),
  INDEX `idx_members_status` (`membership_status`),
  CONSTRAINT `fk_members_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='โปรไฟล์สมาชิกห้องสมุด (One-to-One กับ users)';

-- ------------------------------------------------------------
-- TABLE 8: books
-- ข้อมูลบรรณานุกรมหนังสือ (Bibliographic Level)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `books` (
  `id`               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `isbn`             VARCHAR(20)      NOT NULL COMMENT 'เลขมาตรฐาน ISBN-10/13',
  `title`            VARCHAR(255)     NOT NULL COMMENT 'ชื่อเรื่องหนังสือ',
  `author`           VARCHAR(255)     NOT NULL COMMENT 'ชื่อผู้แต่ง',
  `publisher`        VARCHAR(255)     NULL     DEFAULT NULL COMMENT 'สำนักพิมพ์',
  `publish_year`     YEAR             NULL     DEFAULT NULL COMMENT 'ปีที่พิมพ์ (YYYY)',
  `category_id`      INT UNSIGNED     NOT NULL COMMENT 'FK → book_categories(id)',
  `description`      TEXT             NULL     DEFAULT NULL COMMENT 'เรื่องย่อ/รายละเอียด',
  `cover_image_url`  VARCHAR(255)     NULL     DEFAULT NULL COMMENT 'URL รูปหน้าปก',
  `total_copies`     INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT 'จำนวนสำเนาทั้งหมด',
  `available_copies` INT UNSIGNED     NOT NULL DEFAULT 0 COMMENT 'จำนวนสำเนาพร้อมยืม',
  `created_at`       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`       DATETIME         NULL     DEFAULT NULL COMMENT 'Soft Delete timestamp',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_books_isbn` (`isbn`),
  INDEX `idx_books_title`       (`title`(100)),
  INDEX `idx_books_author`      (`author`(100)),
  INDEX `idx_books_category`    (`category_id`),
  INDEX `idx_books_deleted`     (`deleted_at`),
  CONSTRAINT `fk_books_category`
    FOREIGN KEY (`category_id`) REFERENCES `book_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_books_available_copies`
    CHECK (`available_copies` >= 0),
  CONSTRAINT `chk_books_total_copies`
    CHECK (`total_copies` >= 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='ข้อมูลบรรณานุกรมหนังสือ';

-- ------------------------------------------------------------
-- TABLE 9: book_copies
-- สำเนาหนังสือแต่ละเล่มจริง (Physical Copy)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `book_copies` (
  `id`          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `book_id`     BIGINT UNSIGNED  NOT NULL COMMENT 'FK → books(id)',
  `barcode`     VARCHAR(50)      NOT NULL COMMENT 'บาร์โค้ดประจำเล่ม',
  `copy_number` INT UNSIGNED     NOT NULL COMMENT 'ลำดับเล่มที่ของหนังสือ',
  `status`      ENUM('available','borrowed','reserved_hold','maintenance','lost')
                                 NOT NULL DEFAULT 'available' COMMENT 'สถานะสำเนา',
  `created_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_copies_barcode`      (`barcode`),
  INDEX `idx_copies_book_status`      (`book_id`, `status`),
  CONSTRAINT `fk_copies_book`
    FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='สำเนาหนังสือเล่มจริง (Physical Copy Level)';

-- ============================================================
-- GROUP 3: TRANSACTION TABLES (3 ตาราง)
-- ลำดับ: borrowings → reservations → fines
-- ============================================================

-- ------------------------------------------------------------
-- TABLE 10: borrowings
-- รายการยืมหนังสือ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `borrowings` (
  `id`                   BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `borrowing_code`       VARCHAR(30)      NOT NULL COMMENT 'รหัสอ้างอิง เช่น BRW-202608-0001',
  `member_id`            BIGINT UNSIGNED  NOT NULL COMMENT 'FK → members(id)',
  `book_copy_id`         BIGINT UNSIGNED  NOT NULL COMMENT 'FK → book_copies(id)',
  `borrow_date`          DATE             NOT NULL COMMENT 'วันที่ทำรายการยืม',
  `due_date`             DATE             NOT NULL COMMENT 'วันครบกำหนดส่งคืน',
  `return_date`          DATE             NULL     DEFAULT NULL COMMENT 'วันที่ส่งคืนจริง',
  `status`               ENUM('borrowed','overdue','returned')
                                          NOT NULL DEFAULT 'borrowed' COMMENT 'สถานะรายการ',
  `processed_by`         BIGINT UNSIGNED  NOT NULL COMMENT 'FK → users(id) — เจ้าหน้าที่ผู้ทำรายการ',
  `returned_to_user_id`  BIGINT UNSIGNED  NULL     DEFAULT NULL COMMENT 'FK → users(id) — เจ้าหน้าที่ผู้รับคืน',
  `notes`                TEXT             NULL     DEFAULT NULL COMMENT 'บันทึกเพิ่มเติม',
  `created_at`           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_borrowings_code`         (`borrowing_code`),
  INDEX `idx_borrowings_member_status`    (`member_id`, `status`),
  INDEX `idx_borrowings_due_status`       (`due_date`, `status`),
  INDEX `idx_borrowings_copy`             (`book_copy_id`),
  CONSTRAINT `fk_borrows_member`
    FOREIGN KEY (`member_id`)           REFERENCES `members`     (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_borrows_copy`
    FOREIGN KEY (`book_copy_id`)        REFERENCES `book_copies` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_borrows_processor`
    FOREIGN KEY (`processed_by`)        REFERENCES `users`       (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_borrows_receiver`
    FOREIGN KEY (`returned_to_user_id`) REFERENCES `users`       (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_borrows_due_date`
    CHECK (`due_date` >= `borrow_date`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='รายการยืมหนังสือ (Borrowing Transactions)';

-- ------------------------------------------------------------
-- TABLE 11: reservations
-- คิวการจองหนังสือ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reservations` (
  `id`                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `reservation_code`  VARCHAR(30)      NOT NULL COMMENT 'รหัสอ้างอิง เช่น RSV-202608-0001',
  `member_id`         BIGINT UNSIGNED  NOT NULL COMMENT 'FK → members(id)',
  `book_id`           BIGINT UNSIGNED  NOT NULL COMMENT 'FK → books(id)',
  `queue_number`      INT UNSIGNED     NOT NULL DEFAULT 1 COMMENT 'ลำดับคิวการจอง',
  `reservation_date`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันเวลาที่ทำการจอง',
  `status`            ENUM('pending','available','fulfilled','cancelled','expired')
                                       NOT NULL DEFAULT 'pending' COMMENT 'สถานะการจอง',
  `hold_until_date`   DATETIME         NULL     DEFAULT NULL COMMENT 'วันสิ้นสุดสิทธิ์รับหนังสือ',
  `allocated_copy_id` BIGINT UNSIGNED  NULL     DEFAULT NULL COMMENT 'FK → book_copies(id) — สำเนาที่ล็อคไว้',
  `created_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reservations_code`            (`reservation_code`),
  INDEX `idx_reservations_book_status_queue`   (`book_id`, `status`, `queue_number`),
  INDEX `idx_reservations_member_status`       (`member_id`, `status`),
  CONSTRAINT `fk_reservations_member`
    FOREIGN KEY (`member_id`)         REFERENCES `members`     (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_reservations_book`
    FOREIGN KEY (`book_id`)           REFERENCES `books`       (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_reservations_copy`
    FOREIGN KEY (`allocated_copy_id`) REFERENCES `book_copies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='คิวการจองหนังสือ (Reservation Queue)';

-- ------------------------------------------------------------
-- TABLE 12: fines
-- รายการค่าปรับจากการส่งคืนล่าช้า
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fines` (
  `id`            BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `fine_code`     VARCHAR(30)       NOT NULL COMMENT 'รหัสอ้างอิง เช่น FIN-202608-0001',
  `borrowing_id`  BIGINT UNSIGNED   NOT NULL COMMENT 'FK → borrowings(id)',
  `member_id`     BIGINT UNSIGNED   NOT NULL COMMENT 'FK → members(id)',
  `overdue_days`  INT UNSIGNED      NOT NULL DEFAULT 0 COMMENT 'จำนวนวันที่เกินกำหนด',
  `daily_rate`    DECIMAL(10,2)     NOT NULL DEFAULT 0.00 COMMENT 'อัตราค่าปรับต่อวัน ณ ขณะเกิดรายการ',
  `amount`        DECIMAL(10,2)     NOT NULL DEFAULT 0.00 COMMENT 'จำนวนเงินค่าปรับรวม',
  `status`        ENUM('unpaid','paid','waived')
                                    NOT NULL DEFAULT 'unpaid' COMMENT 'สถานะค่าปรับ',
  `paid_at`       DATETIME          NULL     DEFAULT NULL COMMENT 'วันเวลาที่ชำระเงิน',
  `collected_by`  BIGINT UNSIGNED   NULL     DEFAULT NULL COMMENT 'FK → users(id) — เจ้าหน้าที่รับเงิน',
  `waived_reason` VARCHAR(255)      NULL     DEFAULT NULL COMMENT 'เหตุผลการยกเว้นค่าปรับ',
  `created_at`    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fines_code`          (`fine_code`),
  UNIQUE KEY `uk_fines_borrowing`     (`borrowing_id`),
  INDEX `idx_fines_member_status`     (`member_id`, `status`),
  CONSTRAINT `fk_fines_borrowing`
    FOREIGN KEY (`borrowing_id`) REFERENCES `borrowings` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_fines_member`
    FOREIGN KEY (`member_id`)    REFERENCES `members`    (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_fines_collector`
    FOREIGN KEY (`collected_by`) REFERENCES `users`      (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_fines_amount`
    CHECK (`amount` >= 0),
  CONSTRAINT `chk_fines_daily_rate`
    CHECK (`daily_rate` >= 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='รายการค่าปรับการส่งคืนล่าช้า (Fine Transactions)';

-- ============================================================
-- GROUP 4: LOG & HISTORY TABLES (3 ตาราง)
-- ลำดับ: notifications → borrowing_status_history → audit_logs
-- ============================================================

-- ------------------------------------------------------------
-- TABLE 13: notifications
-- ข้อความแจ้งเตือนภายในแอปฯ (In-App Notifications)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`                  BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`             BIGINT UNSIGNED  NOT NULL COMMENT 'FK → users(id) — ผู้รับแจ้งเตือน',
  `type`                VARCHAR(50)      NOT NULL COMMENT 'ประเภท: borrow_success, due_reminder, overdue_alert, reservation_available, fine_issued, fine_paid',
  `title`               VARCHAR(255)     NOT NULL COMMENT 'หัวข้อข้อความ',
  `message`             TEXT             NOT NULL COMMENT 'เนื้อหาข้อความแจ้งเตือน',
  `is_read`             TINYINT(1)       NOT NULL DEFAULT 0 COMMENT '0=ยังไม่อ่าน, 1=อ่านแล้ว',
  `read_at`             DATETIME         NULL     DEFAULT NULL COMMENT 'วันเวลาที่เปิดอ่าน',
  `related_entity_type` VARCHAR(50)      NULL     DEFAULT NULL COMMENT 'ชื่อตาราง Entity ที่เกี่ยวข้อง',
  `related_entity_id`   BIGINT UNSIGNED  NULL     DEFAULT NULL COMMENT 'Primary Key ของ Entity',
  `created_at`          DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_notif_user_read`    (`user_id`, `is_read`),
  INDEX `idx_notif_created`      (`created_at`),
  CONSTRAINT `fk_notif_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='ข้อความแจ้งเตือนภายในแอปพลิเคชัน';

-- ------------------------------------------------------------
-- TABLE 14: borrowing_status_history
-- ประวัติการเปลี่ยนสถานะรายการยืม (Audit Trail)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `borrowing_status_history` (
  `id`            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `borrowing_id`  BIGINT UNSIGNED  NOT NULL COMMENT 'FK → borrowings(id)',
  `from_status`   VARCHAR(20)      NULL     DEFAULT NULL COMMENT 'สถานะเดิม',
  `to_status`     VARCHAR(20)      NOT NULL COMMENT 'สถานะใหม่',
  `changed_by`    BIGINT UNSIGNED  NULL     DEFAULT NULL COMMENT 'FK → users(id) — NULL หมายถึง System',
  `change_reason` VARCHAR(255)     NULL     DEFAULT NULL COMMENT 'เหตุผลในการเปลี่ยนสถานะ',
  `created_at`    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_bsh_borrowing`   (`borrowing_id`),
  INDEX `idx_bsh_changed_by`  (`changed_by`),
  CONSTRAINT `fk_bsh_borrowing`
    FOREIGN KEY (`borrowing_id`) REFERENCES `borrowings` (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `fk_bsh_changer`
    FOREIGN KEY (`changed_by`)   REFERENCES `users`      (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='ประวัติการเปลี่ยนสถานะรายการยืม';

-- ------------------------------------------------------------
-- TABLE 15: audit_logs
-- บันทึกกิจกรรมความปลอดภัยและการเปลี่ยนแปลงสำคัญ
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED  NULL     DEFAULT NULL COMMENT 'FK → users(id) — NULL หมายถึง System',
  `action`      VARCHAR(100)     NOT NULL COMMENT 'ชื่อกิจกรรม เช่น USER_ROLE_UPDATED, FINE_WAIVED',
  `entity_name` VARCHAR(50)      NOT NULL COMMENT 'ชื่อตารางที่ถูกเปลี่ยน',
  `entity_id`   BIGINT UNSIGNED  NULL     DEFAULT NULL COMMENT 'Primary Key ของ Entity',
  `old_values`  JSON             NULL     DEFAULT NULL COMMENT 'ข้อมูลเดิมก่อนการแก้ไข',
  `new_values`  JSON             NULL     DEFAULT NULL COMMENT 'ข้อมูลใหม่หลังการแก้ไข',
  `ip_address`  VARCHAR(45)      NULL     DEFAULT NULL COMMENT 'IP Address ของ Client',
  `user_agent`  VARCHAR(255)     NULL     DEFAULT NULL COMMENT 'ข้อมูล Browser/Device',
  `created_at`  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  INDEX `idx_audit_user`    (`user_id`),
  INDEX `idx_audit_action`  (`action`),
  INDEX `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='บันทึกกิจกรรมความปลอดภัยและการเปลี่ยนแปลงสำคัญ';

-- ============================================================
-- เปิด Foreign Key Check กลับมา
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Schema Summary: 15 Tables
-- Group 1 — Master:      roles, permissions, role_permissions, book_categories, library_settings
-- Group 2 — Core:        users, members, books, book_copies
-- Group 3 — Transaction: borrowings, reservations, fines
-- Group 4 — Log/History: notifications, borrowing_status_history, audit_logs
-- ============================================================
