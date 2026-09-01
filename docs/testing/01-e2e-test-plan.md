# End-to-End (E2E) Integration Test Plan

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `01-e2e-test-plan.md`  
**Phase:** Phase 18 — End-to-End Integration Testing & Bug Fix  
**Status:** Approved for Execution  
**Date:** 2026-08-30  

---

## 1. Purpose & Scope
เอกสารฉบับนี้จัดทำขึ้นเพื่อกำหนดแผนการทดสอบแบบครบวงจร (End-to-End Integration Test Plan) สำหรับ **Online Library Management System** ครอบคลุมการทำงานร่วมกันของทุก Service ตั้งแต่ส่วนติดต่อผู้ใช้ (Frontend React 18 / MUI 5), ระบบให้บริการ API (Backend Node.js 20 / Express 4), ฐานข้อมูล (MySQL 8.0), ไปจนถึงการบังคับใช้กฎทางธุรกิจ (Business Rules: `BR-001` ถึง `BR-008`) และข้อกำหนดความต้องการ (`FR-001` ถึง `FR-034`)

---

## 2. Business Rules & Traceability Matrix

| Business Rule ID | ชื่อกฎทางธุรกิจ (Business Rule) | เงื่อนไขการตรวจสอบ (Validation Logic) | Test Journey |
|---|---|---|:---:|
| **BR-001** | **Active Member Check** | ผู้ยืม/ผู้จองต้องมีสถานะ `active` และไม่ถูกระงับสิทธิ์ (`suspended`) | Journey 3, 4 |
| **BR-002** | **Stock Check & Available > 0** | หนังสือจะยืมได้ต่อเมื่อมีสำเนาสถานะ `available` อยู่จริงเท่านั้น | Journey 2, 3 |
| **BR-003** | **Due Date Calculation** | กำหนดวันส่งคืนคำนวณจาก `borrow_date + default_borrow_days` (ค่าเริ่มต้น 14 วัน) | Journey 3 |
| **BR-004** | **Overdue Fine Calculation** | ส่งคืนเกิน Due Date คิดค่าปรับ `overdue_days * fine_rate_per_day` (ค่าเริ่มต้น 5 บาท/วัน) | Journey 3, 5 |
| **BR-005** | **Reservation when Stock = 0** | สมาชิกจองหนังสือได้เฉพาะเมื่อสำเนาพร้อมยืม (`available_copies`) เป็น 0 | Journey 4 |
| **BR-006** | **No Duplicate Reservation** | สมาชิกคนเดิมไม่สามารถสร้างคิวจองซ้ำซ้อนสำหรับหนังสือเล่มเดียวกันได้ | Journey 4 |
| **BR-007** | **Reservation Hold on Return** | เมื่อรับคืนหนังสือที่มีคิวจอง สำเนาจะถูกล็อคสถานะเป็น `reserved_hold` ให้คิวแรกทันที | Journey 3, 4 |
| **BR-008** | **Backend Source of Truth** | ทุกการคำนวณและธุรกรรมต้องประมวลผลและตัดสินใจที่ Backend เท่านั้น | All Journeys |

---

## 3. Test Journeys & Detailed Test Cases

### Journey 1: Authentication & Role-Based Access Control (RBAC)
- **TC-AUTH-01:** Login ด้วยบัญชี Member (`member1` / `password123`) ได้รับ JWT Token และสิทธิ์ Role `member`
- **TC-AUTH-02:** Login ด้วยบัญชี Librarian (`librarian1` / `password123`) เข้าถึงเมนู Staff ได้
- **TC-AUTH-03:** Login ด้วยบัญชี Admin (`admin` / `adminpassword123`) เข้าถึง Audit Logs และฟังก์ชัน Admin ได้
- **TC-AUTH-04:** ร้องขอ Protected Endpoint โดยไม่แนบ Token -> ได้รับ `401 Unauthorized`
- **TC-AUTH-05:** สมาชิกพยายามเข้าถึง Endpoint ของ Librarian/Admin -> ได้รับ `403 Forbidden`
- **TC-AUTH-06:** สมาชิกเปลี่ยนรหัสผ่านสำเร็จด้วย `PUT /auth/change-password`

### Journey 2: Book Catalog & Copy Stock Management
- **TC-CAT-01:** สืบค้นรายการหนังสือด้วยคำค้นหา (Title, Author, ISBN) และหมวดหมู่
- **TC-CAT-02:** ดูรายละเอียดหนังสือและจำนวนสำเนาแยกตามสถานะ (`available`, `borrowed`, `reserved_hold`)
- **TC-CAT-03:** เจ้าหน้าที่เพิ่มหนังสือใหม่ และเพิ่มสำเนาเล่มจริงพร้อมบาร์โค้ด -> ยอด `total_copies` และ `available_copies` เพิ่มขึ้นถูกต้อง

### Journey 3: Circulation Desk: Borrowing & Returning
- **TC-CIRC-01:** สมาชิกที่มีสถานะปกติยืมหนังสือที่ว่างอยู่ -> สร้างรายการยืม สถานะสำเนาเปลี่ยนเป็น `borrowed`, `available_copies` ลดลง 1
- **TC-CIRC-02:** สมาชิกที่ถูกระงับสิทธิ์ (`suspended`) พยายามยืมหนังสือ -> Backend ปฏิเสธตาม `BR-001`
- **TC-CIRC-03:** เจ้าหน้าที่บันทึกรับคืนหนังสือตรงเวลา -> สถานะยืมเป็น `returned`, สำเนากลับเป็น `available`, ไม่มีค่าปรับ
- **TC-CIRC-04:** เจ้าหน้าที่บันทึกรับคืนหนังสือล่าช้ากว่า Due Date -> เกิดรายการค่าปรับในตาราง `fines` คำนวณถูกต้องตาม `BR-004`

### Journey 4: Reservation & Queue Hold Lifecycle
- **TC-RSV-01:** สมาชิกจองหนังสือที่ไม่มีเล่มว่าง -> ได้รับคิวหมายเลข 1 (`queue_number = 1`, `status = pending`)
- **TC-RSV-02:** สมาชิกคนเดิมพยายามจองหนังสือซ้ำ -> Backend ปฏิเสธตาม `BR-006` (409 Conflict)
- **TC-RSV-03:** สมาชิกคนที่สองจองหนังสือเล่มเดียวกัน -> ได้รับคิวหมายเลข 2
- **TC-RSV-04:** เมื่อมีการคืนหนังสือเล่มที่ถูกจอง -> Backend ปรับสถานะการจองคิว 1 เป็น `available`, ล็อคสำเนาเป็น `reserved_hold` ตาม `BR-007`

### Journey 5: Overdue Fines, Payment & Admin Waiving
- **TC-FINE-01:** สมาชิกตรวจสอบรายการค่าปรับของตนเองผ่าน `GET /fines/my-fines`
- **TC-FINE-02:** เจ้าหน้าที่บันทึกรับชำระเงินค่าปรับผ่าน `POST /fines/:id/pay` -> สถานะเปลี่ยนเป็น `paid`
- **TC-FINE-03:** ผู้ดูแลระบบ (Admin) ทำการยกเว้นค่าปรับผ่าน `POST /fines/:id/waive` พร้อมระบุเหตุผล -> สถานะเปลี่ยนเป็น `waived`

### Journey 6: In-App Notification Lifecycle
- **TC-NOTIF-01:** ตรวจสอบการสร้าง Notification เมื่อเกิดธุรกรรม (ยืมสำเร็จ, คิวจองพร้อมรับ, แจ้งค่าปรับ)
- **TC-NOTIF-02:** สมาชิกเรียกดูรายการแจ้งเตือน `GET /notifications` -> แสดง `unread_count` ถูกต้อง
- **TC-NOTIF-03:** สมาชิกเปิดอ่านข้อความ `PATCH /notifications/:id/read` -> `is_read = 1`, `unread_count` ลดลง
- **TC-NOTIF-04:** สมาชิกกด `PATCH /notifications/read-all` -> ข้อความทั้งหมดเป็น `is_read = 1`

### Journey 7: Dashboard Summary & Operational Reports
- **TC-DASH-01:** เจ้าหน้าที่เปิด Staff Dashboard `GET /dashboard/staff-summary` -> ตัวเลขสถิติสอดคล้องกับข้อมูลจริงใน Database
- **TC-DASH-02:** สมาชิกเปิด Member Dashboard `GET /dashboard/member-summary` -> แสดงจำนวนยืมและยอดค่าปรับตรงตามจริง
- **TC-RPT-01:** ดึงรายงานการยืม-คืนตามช่วงวันที่ `GET /reports/borrow-return`
- **TC-AUDIT-01:** ตรวจสอบตาราง `audit_logs` มีการบันทึกประวัติการกระทำสำคัญของระบบ

---

## 4. Execution & Acceptance Criteria
- **เกณฑ์ผ่าน:** ทุก Test Case ผ่าน 100% (Zero Critical / Zero High Severity Bugs)
- **เครื่องมือทดสอบ:** Node.js Automated Integration Suite (`scripts/e2e-test-suite.js`)
