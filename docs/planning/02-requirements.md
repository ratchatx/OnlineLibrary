# Requirements Specification: Online Library Management System

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `02-requirements.md`  
**Phase:** Phase 1 — Planning Only (Step 2: Requirements Analysis)  
**Status:** Under Review  
**Date:** 2026-08-28  

---

## 1. Purpose
เอกสารฉบับนี้จัดทำขึ้นเพื่อระบุและวิเคราะห์ข้อกำหนดความต้องการของระบบ (Requirements Specification) สำหรับ **Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)** ทั้งในส่วนของ Functional Requirements (FR), Non-functional Requirements (NFR), ข้อมูลที่ระบบต้องจัดเก็บและแสดงผล, กฎทางธุรกิจ (Business Rules), เงื่อนไขการตรวจสอบความถูกต้อง (Validation Rules), และการจัดการกรณีผิดพลาด (Error Handling) เพื่อใช้เป็นเกณฑ์มาตรฐานในการออกแบบสถาปัตยกรรม ฐานข้อมูล API และหน้าจอระบบในลำดับถัดไป

---

## 2. Reference Documents
เอกสารที่ใช้อ้างอิงร่วมในการจัดทำข้อกำหนดนี้ ได้แก่:
1. `docs/planning/01-system-overview.md` — ภาพรวมระบบ วัตถุประสงค์ และขอบเขตหลัก
2. `docs/planning/00-tech-stack-decision.md` — สถาปัตยกรรมและเทคโนโลยีที่ได้รับอนุมัติ
3. `docs/planning/00-ai-working-rules.md` — กติกาและข้อบังคับการทำงาน
4. `docs/planning/00-documentation-structure.md` — โครงสร้างและมาตรฐานเอกสาร

---

## 3. System Objectives
1. พัฒนาระบบจัดการห้องสมุดออนไลน์แบบรวมศูนย์ที่รองรับการใช้งานของ Member, Librarian และ Admin
2. สนับสนุนการทำธุรกรรมยืม-คืน-จองหนังสือผ่านระบบดิจิทัลที่ถูกต้อง รวดเร็ว และโปร่งใส
3. ลดความผิดพลาดในการติดตามสถานะหนังสือ การจัดการคิวการจอง และการคิดค่าปรับเมื่อส่งคืนล่าช้า
4. อำนวยความสะดวกในการสืบค้นข้อมูลหนังสือและรับการแจ้งเตือนเตือนสถานะต่างๆ แบบเรียลไทม์

---

## 4. Problems / Current Challenges
- **การค้นหาหนังสือล่าช้า:** สมาชิกไม่สามารถตรวจสอบสถานะหนังสือพร้อมยืมได้ล่วงหน้า
- **การบันทึกข้อมูลยืม-คืนไม่เป็นระบบ:** เสี่ยงต่อการบันทึกสถานะผิดพลาด ข้อมูลสต็อกไม่สอดคล้องกับความเป็นจริง
- **การติดตามหนังสือค้างส่งและคิดค่าปรับมีความผิดพลาด:** เกิดข้อโต้แย้งเรื่องวันที่ส่งคืนจริงและสูตรการคิดค่าปรับ
- **การจัดการคิวการจองไม่เป็นธรรม:** ขาดระบบแจ้งเตือนอัตโนมัติเมื่อหนังสือที่จองไว้พร้อมให้ยืม ทำให้สมาชิกเสียสิทธิ์

---

## 5. Goals of the New System
- จัดเตรียมระบบสืบค้นหนังสือ (Search & Discovery) ที่มีตัวกรองตามหมวดหมู่ ชื่อผู้แต่ง และสถานะความพร้อม
- มีระบบบริหารจัดการสต็อกหนังสือที่ไม่ยอมให้ยอดคงเหลือติดลบ และบันทึกประวัติการยืม-คืนอย่างสมบูรณ์
- มีกลไกคำนวณวันครบกำหนดส่ง (Due Date) และค่าปรับ (Fine) อัตโนมัติที่ Backend อย่างโปร่งใส
- มีระบบจัดการคิวการจอง (Reservation Queue) และแจ้งเตือนสมาชิกเมื่อถึงคิวรับหนังสือ

---

## 6. Functional Requirements

### 6.1 Authentication Module (`FR-01`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-001** | เข้าสู่ระบบด้วย Email/Username และ Password | All Roles | **Must** | มีบัญชีในระบบและสถานะ Active | ได้รับ Session/Token และเข้าถึงหน้าตาม Role | ป้องกัน Brute-force |
| **FR-002** | ออกจากระบบ (Logout) | All Roles | **Must** | เข้าสู่ระบบอยู่ | สิ้นสุด Session/Token ทันที | เคลียร์ Client State |
| **FR-003** | ตรวจสอบสิทธิ์การเข้าถึงทรัพยากร (RBAC) | All Roles | **Must** | มี Request ส่งมายังระบบ | อนุญาตเฉพาะ Role ที่มีสิทธิ์ตาม Matrix | ปฏิเสธด้วย 401/403 |
| **FR-004** | จัดการกรณี Login ไม่ถูกต้อง | All Roles | **Must** | ข้อมูลล็อกอินไม่ถูกต้อง | แสดงข้อความเตือนที่ปลอดภัย ไม่ระบุว่าผิดที่ User หรือ Password | ป้องกัน Enumeration |

---

### 6.2 Member Management Module (`FR-02`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-005** | ดูและแก้ไขข้อมูลโปรไฟล์ของตนเอง | Member | **Must** | เข้าสู่ระบบสำเร็จ | แสดงข้อมูลส่วนตัวและแก้ไขข้อมูลติดต่อได้ | แก้ไข Role เองไม่ได้ |
| **FR-006** | ดูประวัติการยืม-คืนของตนเอง | Member | **Must** | เข้าสู่ระบบสำเร็จ | แสดงรายการที่กำลังยืม ประวัติการคืน และยอดค่าปรับ | ดูของผู้อื่นไม่ได้ |
| **FR-007** | จัดการข้อมูลสมาชิก (ดูรายการ, แก้ไขสถานะ) | Librarian, Admin | **Must** | มีสิทธิ์ตาม Role | ค้นหา สมาชิก ดูประวัติ และระงับ/เปิดใช้งานสมาชิกได้ | Admin จัดการได้เต็ม |

---

### 6.3 Book Management Module (`FR-03`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-008** | เพิ่ม ลบ แก้ไข ข้อมูลบรรณานุกรมหนังสือ | Librarian, Admin | **Must** | มีสิทธิ์ตาม Role | บันทึกข้อมูล ชื่อเรื่อง, ผู้แต่ง, ISBN, หมวดหมู่, สำนักพิมพ์ | ตรวจสอบ ISBN ซ้ำ |
| **FR-009** | จัดการหมวดหมู่หนังสือ (Categories) | Librarian, Admin | **Must** | มีสิทธิ์ตาม Role | เพิ่ม แก้ไข ลบหมวดหมู่หนังสือ | ห้ามลบหากมีหนังสือผูกอยู่ |
| **FR-010** | ปรับปรุงสถานะและจำนวนสำเนาหนังสือ (Copies) | Librarian, Admin | **Must** | มีสิทธิ์ตาม Role | อัปเดตจำนวนทั้งหมดและจำนวนพร้อมยืม | สต็อกต้องไม่ติดลบ |

---

### 6.4 Book Search Module (`FR-04`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-011** | ค้นหาหนังสือด้วยคำสำคัญ (Keyword Search) | All Roles | **Must** | - | ค้นหาจากชื่อเรื่อง, ผู้แต่ง, ISBN หรือคำอธิบาย | คืนผลลัพธ์ที่ตรงเงื่อนไข |
| **FR-012** | กรองและจัดเรียงผลการค้นหา (Filter & Sort) | All Roles | **Should** | มีรายการหนังสือ | กรองตามหมวดหมู่ สถานะความพร้อม และเรียงตามชื่อ/วันที่ | UX ลื่นไหล |
| **FR-013** | แสดงรายละเอียดหนังสือและสถานะความพร้อม | All Roles | **Must** | เลือกหนังสือ | แสดงข้อมูลหนังสือ จำนวนเล่มคงเหลือ และปุ่มยืม/จอง | ปรับตามสถานะสต็อก |
| **FR-014** | แสดง Empty State เมื่อไม่พบผลลัพธ์ | All Roles | **Must** | ค้นหาไม่พบข้อมูล | แสดงข้อความแจ้งเตือนที่เข้าใจง่ายพร้อมปุ่มล้างตัวกรอง | UX Standard |

---

### 6.5 Borrowing Module (`FR-05`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-015** | ยืมหนังสือที่มีสถานะพร้อมยืม | Member, Librarian | **Must** | สมาชิก Active, หนังสือว่าง > 0 | บันทึกรายการยืม ตัดสต็อก 1 เล่ม คำนวณ Due Date | ใช้ Transaction |
| **FR-016** | ตรวจสอบสิทธิ์และโควตายืมของสมาชิก | System | **Must** | มีการขอทำรายการยืม | ตรวจสอบว่าไม่เกินจำนวนสูงสุดและไม่มียอดค้างส่งเกินเกณฑ์ | ปฏิเสธหากผิดเงื่อนไข |
| **FR-017** | บันทึกวันครบกำหนดส่ง (Due Date) | System | **Must** | สร้างรายการยืมสำเร็จ | คำนวณวัน Due Date ตามระยะเวลาที่ระบบกำหนด | Backend กำหนด |

---

### 6.6 Returning Module (`FR-06`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-018** | บันทึกการรับคืนหนังสือ | Librarian, Member | **Must** | มีรายการยืมที่ยัง Active | บันทึกวันที่คืนจริง คืนสต็อกหนังสือ ปรับสถานะเป็น Returned | อัปเดตคิวจองอัตโนมัติ |
| **FR-019** | ตรวจสอบการส่งคืนล่าช้า (Overdue Detection) | System | **Must** | คืนหนังสือ | เปรียบเทียบวันที่คืนจริงกับ Due Date | หากเกินส่งต่อไปยังโมดูลค่าปรับ |

---

### 6.7 Reservation Module (`FR-07`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-020** | จองหนังสือเมื่อไม่มีสำเนาพร้อมยืม | Member | **Must** | หนังสือว่าง = 0, ยังไม่เคยจองเล่มนี้ | บันทึกคิวการจอง (First-Come First-Served) | ป้องกันการจองซ้ำ |
| **FR-021** | ยกเลิกรายการจองหนังสือ | Member, Librarian | **Should** | รายการจองสถานะ Pending/Waiting | ยกเลิกลำดับคิว และปรับสถานะเป็น Cancelled | สละสิทธิ์ให้คิวถัดไป |
| **FR-022** | ปรับสถานะการจองเมื่อหนังสือถูกคืน | System | **Must** | มีการคืนหนังสือที่มีคิวจอง | ล็อคหนังสือให้คิวแรก และแจ้งเตือนสมาชิก | กำหนดเวลาถือครองสิทธิ์ |

---

### 6.8 Fine Management Module (`FR-08`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-023** | คำนวณค่าปรับอัตโนมัติเมื่อคืนเกินกำหนด | System | **Must** | วันที่คืนจริง > Due Date | คำนวณยอดเงินตามสูตร (จำนวนวันเกิน x อัตราต่อวัน) | Backend Source of Truth |
| **FR-024** | บันทึกการรับชำระค่าปรับ | Librarian, Admin | **Must** | มียอดค่าปรับค้างชำระ (Unpaid) | ปรับสถานะค่าปรับเป็น Paid พร้อมบันทึกประวัติ | ปลดล็อคสิทธิ์สมาชิก |
| **FR-025** | ดูประวัติและยอดค่าปรับคงค้าง | Member, Librarian, Admin | **Must** | เข้าสู่ระบบสำเร็จ | แสดงรายการค่าปรับ วันที่ รายละเอียด และสถานะ | สมาชิกดูได้เฉพาะตนเอง |

---

### 6.9 Notification Module (`FR-09`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-026** | แจ้งเตือนก่อนครบกำหนดส่ง (Due Date Reminder) | System -> Member | **Should** | ถึงกำหนดก่อน Due Date ตามเกณฑ์ | สร้างข้อความแจ้งเตือน In-app ให้สมาชิกทราบ | Scheduler Trigger |
| **FR-027** | แจ้งเตือนหนังสือเกินกำหนดส่ง (Overdue Alert) | System -> Member | **Must** | พ้น Due Date และยังไม่คืน | สร้างข้อความแจ้งเตือนเตือนสถานะ Overdue | แจ้งเตือนต่อเนื่อง |
| **FR-028** | แจ้งเตือนเมื่อหนังสือจองพร้อมให้ยืม | System -> Member | **Must** | หนังสือที่จองถูกส่งคืนและถึงคิว | แจ้งเตือนให้สมาชิกมารับหนังสือภายในเวลาที่กำหนด | มีกำหนดหมดเวลา |

---

### 6.10 Dashboard Module (`FR-10`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-029** | แสดงแดชบอร์ดภาพรวมสำหรับเจ้าหน้าที่และผู้ดูแล | Librarian, Admin | **Must** | เข้าสู่ระบบด้วย Role เจ้าหน้าที่ | แสดงตัวเลขสถิติ: จำนวนหนังสือ, ยอดกำลังยืม, ยืมเกินกำหนด, ยอดจอง | ข้อมูลสรุปแบบ Realtime |
| **FR-030** | แสดงแดชบอร์ดสรุปกิจกรรมสำหรับสมาชิก | Member | **Should** | สมาชิกเข้าสู่ระบบ | แสดงสรุปหนังสือที่กำลังยืม, วันครบกำหนดที่ใกล้ที่สุด, รายการจอง | Personalized View |

---

### 6.11 Reports Module (`FR-11`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-031** | สรุปรายงานสถิติการยืม-คืน (Borrow/Return Report) | Librarian, Admin | **Should** | มีประวัติธุรกรรมในระบบ | แสดงรายงานสรุปยอดการยืม-คืนตามช่วงเวลาและหมวดหมู่ | กรองตามวันที่ได้ |
| **FR-032** | สรุปรายงานรายการค้างส่งและค่าปรับ (Overdue & Fine Report) | Librarian, Admin | **Should** | มียอดค้างส่งหรือค่าปรับ | แสดงรายชื่อสมาชิกและหนังสือที่ค้างส่งพร้อมยอดค่าปรับรวม | ใช้ติดตามทรัพย์สิน |

---

### 6.12 Role & Permission Management Module (`FR-12`)

| ID | Requirement | Actor | Priority | Preconditions | Expected Result | Notes |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FR-033** | จัดการบัญชีผู้ใช้งานและกำหนด Role | Admin | **Must** | สิทธิ์ Admin เท่านั้น | เพิ่ม แก้ไข ปรับ Role (Member, Librarian, Admin) และรีเซ็ตรหัสผ่าน | ป้องกันการลบ Admin ตนเอง |
| **FR-034** | ตรวจสอบและบันทึก Audit Activity พื้นฐาน | System | **Should** | มีการทำธุรกรรมสำคัญ | บันทึก User ID, Action, Timestamp เมื่อมีการเปลี่ยนสถานะสำคัญ | ปลอดภัยและตรวจสอบได้ |

---

## 7. Non-functional Requirements (NFR)

| ID | Category | Requirement Description | Priority |
| :--- | :--- | :--- | :---: |
| **NFR-001** | **Performance** | ระบบค้นหาหนังสือต้องแสดงผลลัพธ์ภายใน 2 วินาทีภายใต้การใช้งานปกติ | **Must** |
| **NFR-002** | **Security** | รหัสผ่านต้องถูกเข้ารหัสด้วย `bcrypt` หรือเทียบเท่า และห้ามส่งรหัสผ่านใน Response | **Must** |
| **NFR-003** | **Security** | ทุก Endpoint ที่เข้าถึงข้อมูลต้องผ่านการตรวจสอบ Authentication และ Authorization (RBAC) | **Must** |
| **NFR-004** | **Data Integrity** | การทำธุรกรรมยืม-คืน-จองต้องทำงานภายใต้ Database Transaction เพื่อป้องกัน Concurrency Error | **Must** |
| **NFR-005** | **Availability** | ระบบต้องมี Error Handling ครอบคลุมทั้ง Frontend/Backend ไม่ให้หน้าจอค้างหรือ Crash | **Must** |
| **NFR-006** | **Usability** | หน้าจอต้องเป็น Responsive Web Design รองรับการใช้งานทั้งบน Desktop, Tablet และ Mobile ผ่าน MUI 5 | **Must** |
| **NFR-007** | **Usability** | ทุกจุดที่มีการโหลดข้อมูลต้องมี Loading State และกรณีไม่มีข้อมูลต้องแสดง Empty State ชัดเจน | **Must** |
| **NFR-008** | **Maintainability**| โครงสร้างโค้ดต้องแยก Layer ชัดเจน (Route, Controller, Service, Component) ตามมาตรฐาน `SKILL.md` | **Must** |
| **NFR-009** | **Localization** | ระบบต้องรองรับชุดอักขระภาษาไทยอย่างสมบูรณ์ (`utf8mb4`) รวมถึงรูปแบบวันที่และตัวเลขที่คุ้นเคย | **Must** |
| **NFR-010** | **Deployment** | รองรับการรันผ่าน Docker Compose ใน Development และ Single-container Multi-stage บน Railway | **Must** |

---

## 8. Data Requirements (ระดับ Business Entities)

1. **Member Data:** ข้อมูลระบุตัวตน (Username, Email, Password Hash, Firstname, Lastname, Phone), สถานะสมาชิก (Active, Suspended), วันที่สมัคร
2. **Book & Catalog Data:** ข้อมูลบรรณานุกรม (Title, Author, ISBN, Publisher, Publish Year, Description, Category ID), จำนวนสำเนาทั้งหมด (Total Copies), จำนวนพร้อมยืม (Available Copies)
3. **Borrowing Transaction Data:** รหัสรายการยืม, รหัสสมาชิก, รหัสหนังสือ, วันที่ยืม, วันครบกำหนดส่ง (Due Date), วันที่ส่งคืนจริง (Return Date), สถานะการยืม (Borrowed, Returned, Overdue)
4. **Reservation Data:** รหัสการจอง, รหัสสมาชิก, รหัสหนังสือ, วันที่ทำการจอง, ลำดับคิว (Queue Number), วันที่แจ้งพร้อมรับ, วันที่หมดสิทธิ์รับ, สถานะการจอง (Pending, Available, Fulfilled, Cancelled, Expired)
5. **Fine Data:** รหัสค่าปรับ, รหัสรายการยืม, จำนวนเงินค่าปรับ, จำนวนวันที่เกินกำหนด, สถานะการชำระ (Unpaid, Paid, Waived), วันที่ชำระ
6. **Notification Data:** รหัสการแจ้งเตือน, รหัสผู้รับ, หัวข้อข้อความ, รายละเอียด, ประเภทการแจ้งเตือน, สถานะการอ่าน (Unread, Read), วันเวลาที่ส่ง
7. **User Access Data:** รหัสผู้ใช้งาน, บทบาท (Member, Librarian, Admin), สถานะการใช้งาน

---

## 9. Display Requirements

### 9.1 Member Views
- หน้าหลักสืบค้นหนังสือ (Search Bar, Filter by Category, Status Chip)
- หน้ารายละเอียดหนังสือ (รูปปก, ข้อมูลหนังสือ, ปุ่มยืม/จอง ที่ปรับตามสถานะสต็อก)
- หน้าจัดการธุรกรรมของฉัน (แท็บรายการกำลังยืมพร้อมเวลานับถอยหลัง, แท็บประวัติการคืน, แท็บรายการจอง)
- หน้าการแจ้งเตือนและยอดค่าปรับคงค้าง (Alert Bar และตารางสรุป)

### 9.2 Librarian Views
- หน้าเคาน์เตอร์ยืม-คืน (Fast Checkout / Return Search by Member & Book)
- หน้าจัดการแคตตาล็อกหนังสือ (ตารางรายการ, ปุ่มเพิ่ม/แก้ไข/ลบ, ตัวนับสต็อก)
- หน้าจัดการคิวการจองและตรวจสอบรายการค้างส่ง (Overdue Tracker)
- หน้าจัดการและบันทึกการรับชำระค่าปรับ

### 9.3 Admin Views
- แดชบอร์ดสรุปสถิติภาพรวมห้องสมุด (Total Books, Active Borrows, Overdue Count, Total Fines)
- หน้าจัดการผู้ใช้งานและสิทธิ์ (User List, Role Assignment, Account Activation)
- หน้ารายงานสรุปเชิงสถิติ (Exportable / Printable Views)

---

## 10. Business Rules (กฎทางธุรกิจ)

| Rule ID | กฎทางธุรกิจ (Business Rule Description) | หมายเหตุ |
| :--- | :--- | :--- |
| **BR-001** | สมาชิกต้องมีสถานะ `Active` และไม่มีประวัติถูกระงับสิทธิ์ จึงจะสามารถทำรายการยืมหรือจองหนังสือได้ | กฎพื้นฐาน |
| **BR-002** | หนังสือจะสามารถยืมได้ก็ต่อเมื่อมีจำนวนสำเนาพร้อมยืมมากกว่าศูนย์ (`Available Copies > 0`) เท่านั้น | ป้องกันสต็อกติดลบ |
| **BR-003** | การยืมหนังสือแต่ละครั้งจะต้องได้รับการคำนวณและบันทึกวันครบกำหนดส่ง (`Due Date`) ทันทีที่ทำรายการสำเร็จ | กำหนดที่ Backend |
| **BR-004** | หากส่งคืนหนังสือหลังพ้น `Due Date` ระบบจะต้องคิดค่าปรับตามจำนวนวันที่เกินกำหนดโดยอัตโนมัติ | อัตราค่าปรับต้องยืนยัน |
| **BR-005** | หนังสือที่ไม่มีสำเนาพร้อมยืม (`Available Copies = 0`) สมาชิกสามารถทำการจองได้ตามลำดับคิว | First-Come First-Served |
| **BR-006** | สมาชิกหนึ่งคนไม่สามารถจองหนังสือเล่มเดียวกันซ้ำได้ หากยังมีรายการจองหนังสือเล่มนั้นที่อยู่ในสถานะใช้งาน | ป้องกันกักตุนคิว |
| **BR-007** | เมื่อหนังสือที่มีคิวจองถูกส่งคืน ระบบจะต้องล็อคสิทธิ์หนังสือให้แก่สมาชิกคิวแรก และเริ่มนับเวลาถือครองสิทธิ์ | Hold Expiry Time |
| **BR-008** | การคำนวณค่าปรับ วันครบกำหนด และการตัดสต็อก ต้องประมวลผลที่ Backend เป็น Single Source of Truth เสมอ | ห้ามคำนวณที่ UI |

---

## 11. Validation Requirements
1. **Member Validation:** ตรวจสอบความถูกต้องของ Email, รูปแบบรหัสผ่าน, ความยาวชื่อ-นามสกุล และความซ้ำซ้อนของ Username/Email
2. **Book Validation:** ตรวจสอบความครบถ้วนของชื่อเรื่อง, ผู้แต่ง, หมวดหมู่, และความถูกต้องของรูปแบบ ISBN (10 หรือ 13 หลัก)
3. **Borrow Validation:** ตรวจสอบว่าสมาชิกไม่มียอดหนี้ค่าปรับเกินเกณฑ์ และไม่มียอดหนังสือค้างส่งเกินกำหนด
4. **Reservation Validation:** ตรวจสอบว่าหนังสือเล่มนั้นถูกยืมหมดจริง และสมาชิกยังไม่เคยจองหนังสือเล่มนี้ค้างไว้
5. **Return Validation:** ตรวจสอบว่ารายการยืมมีอยู่จริง และยังไม่ได้ถูกบันทึกว่าคืนไปแล้วก่อนหน้า

---

## 12. Error / Exception Requirements

| Exception Scenario | Expected System Behavior | Response / UI Handling |
| :--- | :--- | :--- |
| **Login ล้มเหลว** | บันทึกความพยายาม และแจ้งเตือนข้อผิดพลาด | แสดงข้อความ *"อีเมลหรือรหัสผ่านไม่ถูกต้อง"* (HTTP 401) |
| **เข้าถึงข้อมูลข้ามสิทธิ์** | ปฏิเสธการเข้าถึง และไม่เปิดเผยข้อมูล | แสดงหน้า Unauthorized หรือกลับสู่หน้าหลัก (HTTP 403) |
| **ยืมหนังสือที่ไม่มีสำเนาว่าง** | ยกเลิก Transaction และแจ้งเตือนสถานะ | แสดงข้อความ *"ขออภัย หนังสือเล่มนี้ไม่มีสำเนาว่างสำหรับการยืม"* (HTTP 400/409) |
| **จองหนังสือซ้ำ** | ปฏิเสธคำขอจอง | แสดงข้อความ *"ท่านได้ทำรายการจองหนังสือเล่มนี้ไว้แล้ว"* (HTTP 400) |
| **คืนหนังสือที่บันทึกคืนแล้ว** | ปฏิเสธการคืนซ้ำ | แสดงข้อความ *"รายการยืมนี้ได้รับการบันทึกคืนเรียบร้อยแล้ว"* (HTTP 400) |
| **ระบบแจ้งเตือนมีปัญหา** | บันทึก Log และดำเนินการธุรกรรมหลักต่อไป | ธุรกรรมยืม-คืนยังคงสำเร็จ โดยระบบจะลองส่ง Notification ใหม่อีกครั้ง |

---

## 13. Requirement Priority Matrix

```text
[ Must Have - จำเป็นสูงสุดสำหรับ MVP ]
├── FR-001 ถึง FR-004 : Authentication & RBAC
├── FR-005 ถึง FR-007 : Member Profile & Basic Management
├── FR-008 ถึง FR-010 : Book Management & Stock Tracking
├── FR-011, FR-013, FR-014 : Book Search & Details
├── FR-015 ถึง FR-017 : Borrowing Transaction & Due Date
├── FR-018 ถึง FR-019 : Returning Transaction & Overdue Detection
├── FR-020, FR-022 : Book Reservation & Queue Assignment
├── FR-023 ถึง FR-025 : Fine Calculation & Status
├── FR-027, FR-028 : Overdue & Reservation Available Notification
├── FR-029 : Staff Dashboard Overview
└── FR-033 : User & Role Management by Admin

[ Should Have - สำคัญและควรมีในระบบที่สมบูรณ์ ]
├── FR-012 : Advanced Search Filter & Sorting
├── FR-021 : Cancel Reservation
├── FR-026 : Due Date Reminder Notification
├── FR-030 : Member Personal Dashboard
├── FR-031, FR-032 : Statistical Borrow/Return & Fine Reports
└── FR-034 : Basic Audit Activity Tracking

[ Could Have - ฟังก์ชันเสริมที่พัฒนาต่อยอดได้ในอนาคต ]
└── การส่งออกรายงานเป็น Excel/PDF รูปแบบพิเศษ หรือฟิลเตอร์สถิติขั้นสูง
```

---

## 14. Requirement Traceability Matrix

| Requirement Group | Planning Document ปลายทางที่นำไปออกแบบต่อ |
| :--- | :--- |
| **FR-01, FR-12 (Auth & Roles)** | `03-roles-permissions.md`, `06-api-contract.md` |
| **FR-05, FR-06, FR-07 (Workflows)** | `04-library-workflow.md`, `05-database-design.md` |
| **FR-03, FR-04, Data Requirements** | `05-database-design.md`, `06-api-contract.md` |
| **FR-08, FR-09 (Fines & Notifications)** | `04-library-workflow.md`, `08-dashboard-report-notification.md` |
| **FR-10, FR-11, Display Requirements** | `07-frontend-pages.md`, `08-dashboard-report-notification.md` |
| **NFRs, Security, Deployment** | `09-project-docker-architecture.md`, `10-implementation-plan.md` |

---

## 15. Constraints
- **Business Constraints:** สมาชิกต้องปฏิบัติตามกฎเกณฑ์การยืม การคืน และการจองที่ห้องสมุดกำหนด
- **Technical Constraints:** พัฒนาด้วย React 18, Node.js 20, MySQL 8 และ Docker โดยไม่มี Framework อื่นนอกเหนือจากที่อนุมัติ
- **Security Constraints:** ข้อมูลรหัสผ่านต้องถูกเข้ารหัส สิทธิ์การเข้าถึงข้อมูลต้องผ่าน Middleware ตรวจสอบอย่างเข้มงวด
- **Data Constraints:** สต็อกหนังสือต้องไม่ติดลบ ประวัติธุรกรรมต้องถูกบันทึกเพื่อตรวจสอบย้อนหลังได้

---

## 16. Assumptions
1. สมาชิกแต่ละคนมีบัญชีผู้ใช้งานเพียง 1 บัญชีในระบบ
2. อัตราค่าปรับและระยะเวลาการยืมเริ่มต้นจะใช้ค่ามาตรฐานที่กำหนดในระบบ จนกว่า Admin จะมีการเปลี่ยนแปลงนโยบาย
3. การรับหนังสือที่จองไว้และการคืนหนังสือที่มีค่าปรับจะดำเนินการผ่านเจ้าหน้าที่ ณ จุดบริการห้องสมุด

---

## 17. Open Questions (ประเด็นข้อกำหนดที่ต้องการการยืนยัน)

| ID | คำถาม / ข้อกำหนดที่ต้องยืนยัน | Requirements ที่เกี่ยวข้อง | ผลกระทบ | ลำดับความสำคัญ |
| :--- | :--- | :---: | :---: | :---: |
| **OQ-REQ-001** | ระยะเวลายืมมาตรฐานกำหนดเป็นกี่วัน (เช่น 7 วัน, 14 วัน) และสามารถขยายเวลายืม (Renew) ได้หรือไม่? | FR-015, FR-017, BR-003 | High | High |
| **OQ-REQ-002** | อัตราค่าปรับคิดวันละกี่บาท (เช่น 5 บาท/วัน, 10 บาท/วัน) และมีเพดานค่าปรับสูงสุดต่อเล่มหรือไม่? | FR-023, BR-004 | High | High |
| **OQ-REQ-003** | สมาชิกหนึ่งคนสามารถยืมหนังสือพร้อมกันได้สูงสุดกี่เล่ม (เช่น 3 เล่ม, 5 เล่ม)? | FR-016, BR-001 | Medium | High |
| **OQ-REQ-004** | ระยะเวลาที่ล็อคหนังสือให้ผู้จองมารับ (Hold Period) กำหนดเป็นกี่วันก่อนสิทธิ์จะตกเป็นของคิวถัดไป (เช่น 3 วัน)? | FR-022, BR-007 | Medium | Medium |
| **OQ-REQ-005** | หากสมาชิกมียอดค่าปรับค้างชำระ (Unpaid Fines) เกินจำนวนเท่าใด จึงจะถูกระงับสิทธิ์การยืมหนังสือใหม่ชั่วคราว? | FR-016, BR-001 | Medium | Medium |

---

## 18. Risks
- **Concurrency ในการยืมเล่มสุดท้าย:** มีโอกาสที่สมาชิกสองคนกดกดยืมหนังสือเล่มสุดท้ายพร้อมกัน จึงจำเป็นต้องใช้ Database Transaction ควบคุม
- **ความคลาดเคลื่อนของการคำนวณค่าปรับ:** หากมีการเปลี่ยนอัตราค่าปรับ ต้องมั่นใจว่ารายการเก่าที่เกิดขึ้นแล้วจะไม่ได้รับผลกระทบย้อนหลัง
- **Deadlock ในคิวการจอง:** หากระบบไม่จัดการยกเลิกคิวที่หมดอายุ หนังสืออาจถูกล็อคค้างและไม่ถูกนำกลับมาให้บริการ

---

## 19. Summary
เอกสาร **Requirements Specification** ฉบับนี้ได้รวบรวมและแจกแจง Functional Requirements ทั้งหมด 34 ข้อ, Non-functional Requirements 10 ข้อ, กฎทางธุรกิจ 8 ข้อ พร้อมทั้งกำหนด Data & Display Requirements ไว้อย่างชัดเจน โดยประเด็นที่ต้องอาศัยการตัดสินใจเชิงตัวเลขได้รับการบันทึกเป็น Open Questions อย่างเป็นระบบ เอกสารนี้มีความพร้อมสมบูรณ์สำหรับการนำไปจัดทำเอกสาร **Roles & Permissions Specification (`03-roles-permissions.md`)** ต่อไป
