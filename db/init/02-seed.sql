-- ============================================================
-- FILE: db/init/02-seed.sql
-- PHASE: Phase 2 — Database Schema & Seed Data
-- DESCRIPTION: DML Script สำหรับ Initial Master Data
--              Roles, Permissions, Role-Permissions,
--              Default Admin User, Book Categories,
--              Library Settings
--
-- NOTE: รัน หลังจาก 01-schema.sql เสร็จแล้วเท่านั้น
--       Admin password = "Admin@1234" (bcrypt hash รอ Phase 4)
-- ============================================================

USE library_db;

-- ============================================================
-- SECTION 1: ROLES (3 บทบาท)
-- ============================================================
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
  (1, 'member',    'สมาชิกห้องสมุดทั่วไป — ยืม/จอง/ดูประวัติส่วนตัว'),
  (2, 'librarian', 'เจ้าหน้าที่บรรณารักษ์ — จัดการแคตตาล็อก ยืม-คืน ค่าปรับ'),
  (3, 'admin',     'ผู้ดูแลระบบสูงสุด — จัดการผู้ใช้ สิทธิ์ ตั้งค่าระบบ')
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`);

-- ============================================================
-- SECTION 2: PERMISSIONS (36 สิทธิ์ ครอบคลุม 13 โดเมน)
-- อ้างอิง: 03-roles-permissions.md Section 5 & 6
-- ============================================================
INSERT INTO `permissions` (`code`, `name`, `module`) VALUES
  -- AUTH Domain (2)
  ('auth.login',                  'เข้าสู่ระบบ',                          'auth'),
  ('auth.change_password',        'เปลี่ยนรหัสผ่านของตนเอง',              'auth'),

  -- PROFILE Domain (2)
  ('profile.view_own',            'ดูโปรไฟล์ของตนเอง',                    'profile'),
  ('profile.update_own',          'แก้ไขข้อมูลติดต่อของตนเอง',            'profile'),

  -- MEMBER_MGMT Domain (3)
  ('members.view_list',           'ดูรายชื่อสมาชิกทั้งหมด',               'members'),
  ('members.view_any',            'ดูโปรไฟล์สมาชิกทุกคน',                 'members'),
  ('members.update_status',       'เปลี่ยนสถานะสมาชิก',                   'members'),

  -- BOOK_MGMT Domain (5)
  ('books.view',                  'ดูรายการและรายละเอียดหนังสือ',          'books'),
  ('books.create',                'เพิ่มหนังสือและสำเนาใหม่',              'books'),
  ('books.update',                'แก้ไขข้อมูลหนังสือ',                    'books'),
  ('books.delete',                'ลบหนังสือ (Soft Delete)',               'books'),
  ('categories.manage',           'จัดการหมวดหมู่หนังสือ',                 'books'),

  -- SEARCH Domain (1)
  ('books.search',                'ค้นหาและกรองหนังสือ',                   'search'),

  -- BORROW Domain (3)
  ('borrowings.view_own',         'ดูประวัติการยืมของตนเอง',               'borrowings'),
  ('borrowings.view_any',         'ดูประวัติการยืมของสมาชิกทุกคน',         'borrowings'),
  ('borrowings.process',          'บันทึกการยืมหนังสือ (เคาน์เตอร์)',       'borrowings'),

  -- RETURN Domain (2)
  ('returns.process',             'รับคืนหนังสือและบันทึกสถานะ',           'returns'),
  ('returns.view_any',            'ดูประวัติการคืนของสมาชิกทุกคน',         'returns'),

  -- RESERVE Domain (3)
  ('reservations.create',         'จองหนังสือ',                            'reservations'),
  ('reservations.cancel_own',     'ยกเลิกการจองของตนเอง',                  'reservations'),
  ('reservations.manage',         'จัดการคิวการจองและจัดสรรสำเนา',         'reservations'),

  -- FINE Domain (4)
  ('fines.view_own',              'ดูยอดค่าปรับของตนเอง',                  'fines'),
  ('fines.view_any',              'ดูรายการค่าปรับของสมาชิกทุกคน',         'fines'),
  ('fines.collect',               'บันทึกการรับชำระค่าปรับ',               'fines'),
  ('fines.waive',                 'ยกเว้นหรือปรับลดยอดค่าปรับ',           'fines'),

  -- NOTIF Domain (2)
  ('notifications.receive',       'รับข้อความแจ้งเตือน',                   'notifications'),
  ('notifications.manage_own',    'จัดการแจ้งเตือนของตนเอง (Mark as Read)', 'notifications'),

  -- DASHBOARD Domain (2)
  ('dashboard.member',            'ดูแดชบอร์ดสมาชิก',                     'dashboard'),
  ('dashboard.staff',             'ดูแดชบอร์ดเจ้าหน้าที่',                 'dashboard'),

  -- REPORT Domain (2)
  ('reports.view',                'ดูรายงานการดำเนินงาน',                  'reports'),
  ('reports.export',              'Export รายงานออกเป็นไฟล์',              'reports'),

  -- ADMIN Domain (5)
  ('admin.users.manage',          'จัดการบัญชีผู้ใช้และบทบาท',            'admin'),
  ('admin.settings.manage',       'จัดการค่าตั้งค่าระบบ',                 'admin'),
  ('admin.audit.view',            'ตรวจสอบ Audit Activity Log',           'admin'),
  ('admin.fines.waive',           'ยกเว้นค่าปรับระดับ Admin',             'admin'),
  ('admin.members.full',          'จัดการสมาชิกเต็มรูปแบบ',               'admin')

ON DUPLICATE KEY UPDATE
  `name`   = VALUES(`name`),
  `module` = VALUES(`module`);

-- ============================================================
-- SECTION 3: ROLE-PERMISSIONS MAPPING
-- อ้างอิง: 03-roles-permissions.md Section 6 (Permission Matrix)
-- ============================================================

-- ลบข้อมูลเดิมและ Insert ใหม่เพื่อความถูกต้อง
-- ใช้ INSERT IGNORE เพื่อรองรับการ re-run

-- ---[ ROLE: member (id=1) ]---
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `permissions` WHERE `code` IN (
  'auth.login',
  'auth.change_password',
  'profile.view_own',
  'profile.update_own',
  'books.view',
  'books.search',
  'borrowings.view_own',
  'reservations.create',
  'reservations.cancel_own',
  'fines.view_own',
  'notifications.receive',
  'notifications.manage_own',
  'dashboard.member'
);

-- ---[ ROLE: librarian (id=2) ]---
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, `id` FROM `permissions` WHERE `code` IN (
  'auth.login',
  'auth.change_password',
  'profile.view_own',
  'profile.update_own',
  'members.view_list',
  'members.view_any',
  'members.update_status',
  'books.view',
  'books.create',
  'books.update',
  'books.delete',
  'categories.manage',
  'books.search',
  'borrowings.view_own',
  'borrowings.view_any',
  'borrowings.process',
  'returns.process',
  'returns.view_any',
  'reservations.create',
  'reservations.cancel_own',
  'reservations.manage',
  'fines.view_own',
  'fines.view_any',
  'fines.collect',
  'notifications.receive',
  'notifications.manage_own',
  'dashboard.staff',
  'reports.view',
  'reports.export'
);

-- ---[ ROLE: admin (id=3) ]---
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, `id` FROM `permissions` WHERE `code` IN (
  'auth.login',
  'auth.change_password',
  'profile.view_own',
  'profile.update_own',
  'members.view_list',
  'members.view_any',
  'members.update_status',
  'books.view',
  'books.create',
  'books.update',
  'books.delete',
  'categories.manage',
  'books.search',
  'borrowings.view_own',
  'borrowings.view_any',
  'borrowings.process',
  'returns.process',
  'returns.view_any',
  'reservations.create',
  'reservations.cancel_own',
  'reservations.manage',
  'fines.view_own',
  'fines.view_any',
  'fines.collect',
  'fines.waive',
  'notifications.receive',
  'notifications.manage_own',
  'dashboard.member',
  'dashboard.staff',
  'reports.view',
  'reports.export',
  'admin.users.manage',
  'admin.settings.manage',
  'admin.audit.view',
  'admin.fines.waive',
  'admin.members.full'
);

-- ============================================================
-- SECTION 4: DEFAULT ADMIN USER
-- password_hash = bcrypt hash ของ "Admin@1234"
-- (bcrypt rounds=12, สร้างด้วย https://bcrypt.io/ หรือ bcryptjs)
-- Phase 4 จะใช้ bcryptjs ใน Backend เพื่อ hash จริง
-- ============================================================
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role_id`, `status`) VALUES
  (
    1,
    'admin',
    'admin@library.local',
    '$2a$12$QiTHj4VRaFz.zLOyO.uIn./e6qkTMaaur5OaL4TPWhplfDhJi8HK2',
    3,
    'active'
  )
ON DUPLICATE KEY UPDATE
  `email`         = VALUES(`email`),
  `password_hash` = VALUES(`password_hash`),
  `role_id`       = VALUES(`role_id`),
  `status`        = VALUES(`status`);

-- ============================================================
-- SECTION 5: BOOK CATEGORIES (10 หมวดหมู่เริ่มต้น)
-- อ้างอิง: 05-database-design.md Section 10
-- ============================================================
INSERT INTO `book_categories` (`id`, `name`, `description`, `parent_id`) VALUES
  (1,  'วิทยาศาสตร์และเทคโนโลยี',  'หนังสือด้านวิทยาศาสตร์ คณิตศาสตร์ และเทคโนโลยี',            NULL),
  (2,  'คอมพิวเตอร์และไอที',        'หนังสือด้านการเขียนโปรแกรม เครือข่าย และระบบสารสนเทศ',    1),
  (3,  'วรรณกรรมและนิยาย',          'นวนิยาย เรื่องสั้น และวรรณกรรมสร้างสรรค์',                  NULL),
  (4,  'ประวัติศาสตร์และสังคมศาสตร์','หนังสือประวัติศาสตร์ สังคมวิทยา และมานุษยวิทยา',          NULL),
  (5,  'บริหารธุรกิจและเศรษฐศาสตร์', 'หนังสือด้านการบริหาร การตลาด และเศรษฐศาสตร์',             NULL),
  (6,  'ศิลปะและการออกแบบ',          'หนังสือด้านศิลปกรรม สถาปัตยกรรม และการออกแบบ',            NULL),
  (7,  'ภาษาและการสื่อสาร',          'หนังสือภาษาไทย ภาษาอังกฤษ และทักษะการสื่อสาร',            NULL),
  (8,  'สุขภาพและการแพทย์',          'หนังสือด้านสาธารณสุข โภชนาการ และการดูแลสุขภาพ',           NULL),
  (9,  'เด็กและเยาวชน',              'หนังสือนิทาน หนังสือภาพ และสื่อการเรียนรู้สำหรับเด็ก',     NULL),
  (10, 'ทั่วไปและสารคดี',            'หนังสือสารคดี บทความ และเรื่องราวเชิงความรู้ทั่วไป',        NULL)
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`),
  `parent_id`   = VALUES(`parent_id`);

-- ============================================================
-- SECTION 6: LIBRARY SETTINGS (ค่ากำหนดระบบ)
-- อ้างอิง: 03-roles-permissions.md + 04-library-workflow.md
-- ============================================================
INSERT INTO `library_settings` (`setting_key`, `setting_value`, `description`) VALUES
  ('default_borrow_days',     '14',    'จำนวนวันยืมมาตรฐาน (วัน)'),
  ('max_borrow_per_member',   '5',     'จำนวนหนังสือสูงสุดที่สมาชิกยืมพร้อมกันได้'),
  ('fine_rate_per_day',       '5.00',  'อัตราค่าปรับต่อวันต่อเล่ม (บาท)'),
  ('reservation_hold_days',   '3',     'จำนวนวันที่สมาชิกมีสิทธิ์รับหนังสือที่จองแล้วว่าง (วัน)'),
  ('max_reservations',        '3',     'จำนวนรายการจองสูงสุดของสมาชิก 1 คน'),
  ('allow_self_borrow',       'true',  'อนุญาตให้สมาชิกขอยืมผ่านระบบออนไลน์ได้'),
  ('overdue_notify_days',     '1',     'แจ้งเตือนก่อนครบกำหนดกี่วัน'),
  ('system_name',             'Online Library Management System', 'ชื่อระบบห้องสมุด'),
  ('system_email',            'library@library.local', 'อีเมลระบบสำหรับส่งแจ้งเตือน')
ON DUPLICATE KEY UPDATE
  `setting_value` = VALUES(`setting_value`),
  `description`   = VALUES(`description`);

-- ============================================================
-- SECTION 7: DEFAULT LIBRARIAN USER (สำหรับทดสอบ)
-- password_hash = bcrypt hash ของ "Lib@1234"
-- ============================================================
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role_id`, `status`) VALUES
  (
    2,
    'librarian01',
    'librarian01@library.local',
    '$2a$12$uUyjRphCAbeSPVEU/6Vc4exJ1uV08UxobjAhaotVi5b0RYsXG9SeS',
    2,
    'active'
  )
ON DUPLICATE KEY UPDATE
  `email`         = VALUES(`email`),
  `password_hash` = VALUES(`password_hash`),
  `role_id`       = VALUES(`role_id`),
  `status`        = VALUES(`status`);

-- Admin member profile
INSERT INTO `members` (`user_id`, `member_code`, `first_name`, `last_name`, `max_borrow_limit`, `membership_status`) VALUES
  (1, 'ADM-0001', 'System', 'Admin',  5, 'active'),
  (2, 'LIB-0001', 'Library', 'Staff', 5, 'active')
ON DUPLICATE KEY UPDATE
  `first_name`        = VALUES(`first_name`),
  `last_name`         = VALUES(`last_name`),
  `membership_status` = VALUES(`membership_status`);

-- ============================================================
-- SECTION 8: SAMPLE MEMBER USER (สำหรับทดสอบ Phase 3+)
-- password_hash = bcrypt hash ของ "Member@1234"
-- ============================================================
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role_id`, `status`) VALUES
  (
    3,
    'member01',
    'member01@library.local',
    '$2a$12$B5A4DKU55Xy180uksMFpSOUB86Lnj/K7KP66y9SZDWvNZGvrHyKoa',
    1,
    'active'
  )
ON DUPLICATE KEY UPDATE
  `email`         = VALUES(`email`),
  `password_hash` = VALUES(`password_hash`),
  `role_id`       = VALUES(`role_id`),
  `status`        = VALUES(`status`);

INSERT INTO `members` (`user_id`, `member_code`, `first_name`, `last_name`, `phone`, `max_borrow_limit`, `membership_status`) VALUES
  (3, 'MBR-2026-00001', 'สมชาย', 'ใจดี', '081-234-5678', 5, 'active')
ON DUPLICATE KEY UPDATE
  `first_name`        = VALUES(`first_name`),
  `last_name`         = VALUES(`last_name`),
  `phone`             = VALUES(`phone`),
  `membership_status` = VALUES(`membership_status`);

-- ============================================================
-- SECTION 9: SAMPLE BOOKS (5 เล่ม สำหรับทดสอบ Phase 3+)
-- ============================================================
INSERT INTO `books` (`isbn`, `title`, `author`, `publisher`, `publish_year`, `category_id`, `description`, `total_copies`, `available_copies`) VALUES
  ('9780132350884', 'Clean Code: A Handbook of Agile Software Craftsmanship',
   'Robert C. Martin', 'Prentice Hall', 2008, 2,
   'คู่มือการเขียนโค้ดที่สะอาดและบำรุงรักษาได้ง่าย สำหรับนักพัฒนาซอฟต์แวร์ทุกระดับ',
   3, 3),
  ('9780201633610', 'Design Patterns: Elements of Reusable Object-Oriented Software',
   'Gang of Four (GoF)', 'Addison-Wesley', 1994, 2,
   'หนังสือคลาสสิกด้าน Software Design Patterns ที่นักพัฒนาต้องอ่าน',
   2, 2),
  ('9780131101630', 'The C Programming Language',
   'Brian W. Kernighan, Dennis M. Ritchie', 'Prentice Hall', 1988, 2,
   'ตำราภาษา C ต้นฉบับโดยผู้สร้างภาษา C',
   2, 2),
  ('9784048913027', 'ลูกไม้หล่นไม่ไกลต้น',
   'สุวรรณา สถาอานันท์', 'สำนักพิมพ์อมรินทร์', 2020, 3,
   'นวนิยายไทยร่วมสมัยที่ได้รับรางวัล',
   4, 4),
  ('9781491950357', 'Learning Python, 5th Edition',
   'Mark Lutz', "O'Reilly Media", 2013, 2,
   'คู่มือเรียนรู้ภาษา Python ฉบับสมบูรณ์ สำหรับผู้เริ่มต้นและระดับกลาง',
   3, 3)
ON DUPLICATE KEY UPDATE
  `title`             = VALUES(`title`),
  `author`            = VALUES(`author`),
  `total_copies`      = VALUES(`total_copies`),
  `available_copies`  = VALUES(`available_copies`);

-- Sample book_copies for first book (Clean Code — 3 copies)
INSERT INTO `book_copies` (`book_id`, `barcode`, `copy_number`, `status`)
SELECT b.id, CONCAT('BC-CC-00', seq.n), seq.n, 'available'
FROM `books` b,
     (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3) AS seq
WHERE b.isbn = '9780132350884'
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Sample book_copies for Design Patterns (2 copies)
INSERT INTO `book_copies` (`book_id`, `barcode`, `copy_number`, `status`)
SELECT b.id, CONCAT('BC-DP-00', seq.n), seq.n, 'available'
FROM `books` b,
     (SELECT 1 AS n UNION ALL SELECT 2) AS seq
WHERE b.isbn = '9780201633610'
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Sample book_copies for The C Programming Language (2 copies)
INSERT INTO `book_copies` (`book_id`, `barcode`, `copy_number`, `status`)
SELECT b.id, CONCAT('BC-CP-00', seq.n), seq.n, 'available'
FROM `books` b,
     (SELECT 1 AS n UNION ALL SELECT 2) AS seq
WHERE b.isbn = '9780131101630'
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Sample book_copies for ลูกไม้หล่นไม่ไกลต้น (4 copies)
INSERT INTO `book_copies` (`book_id`, `barcode`, `copy_number`, `status`)
SELECT b.id, CONCAT('BC-TH-00', seq.n), seq.n, 'available'
FROM `books` b,
     (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) AS seq
WHERE b.isbn = '9784048913027'
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Sample book_copies for Learning Python (3 copies)
INSERT INTO `book_copies` (`book_id`, `barcode`, `copy_number`, `status`)
SELECT b.id, CONCAT('BC-PY-00', seq.n), seq.n, 'available'
FROM `books` b,
     (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3) AS seq
WHERE b.isbn = '9781491950357'
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- ============================================================
-- SEED COMPLETE
-- Summary:
--   Roles:             3 (member, librarian, admin)
--   Permissions:      36 (ครอบคลุม 13 โดเมน)
--   Role-Permissions:  member=13, librarian=28, admin=36
--   Users:             3 (admin, librarian01, member01)
--   Members:           3 profiles
--   Book Categories:  10
--   Books:             5 (sample)
--   Book Copies:      14 (sample)
--   Library Settings:  9
-- ============================================================
