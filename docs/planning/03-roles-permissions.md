# Roles & Permissions Specification: Online Library Management System

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `03-roles-permissions.md`  
**Phase:** Phase 1 — Planning Only (Step 3: Roles & Permissions)  
**Status:** Under Review  
**Date:** 2026-08-28  

---

## 1. Purpose
เอกสารฉบับนี้จัดทำขึ้นเพื่อกำหนดโครงสร้างบทบาทผู้ใช้งาน (User Roles), ขอบเขตสิทธิ์ในการเข้าถึงและดำเนินกิจกรรม (Permissions Matrix), ระดับการมองเห็นข้อมูล (Data Visibility), กฎการเป็นเจ้าของทรัพยากร (Resource Ownership), และสถาปัตยกรรมการควบคุมการเข้าถึง (Access Control Architecture) ของ **Online Library Management System** เพื่อใช้เป็นมาตรฐานอ้างอิงในการออกแบบ User Interface, RESTful API Authorization Middleware, และ Database Access Model ในลำดับถัดไป

---

## 2. Reference Documents
เอกสารที่ใช้อ้างอิงร่วมในการออกแบบ:
1. `docs/planning/01-system-overview.md` — วัตถุประสงค์ ขอบเขต และภาพรวมระบบ
2. `docs/planning/02-requirements.md` — ข้อกำหนดความต้องการ (FR-001 ถึง FR-034 และ NFR-001 ถึง NFR-010)
3. `docs/planning/00-tech-stack-decision.md` — สถาปัตยกรรมและเทคโนโลยีที่ได้รับอนุมัติ
4. `docs/planning/00-ai-working-rules.md` — กติกาและข้อบังคับการทำงาน

---

## 3. Role Overview
ระบบ Online Library Management System ใช้รูปแบบการควบคุมการเข้าถึงตามบทบาท (**Role-Based Access Control - RBAC**) โดยกำหนดบทบาทมาตรฐาน 3 ระดับเพื่อครอบคลุมทุกกระบวนการทำงานของห้องสมุดอย่างรัดกุมและปลอดภัย:

```text
[ ผู้ใช้งานทั้งหมด (All Users) ]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[ สมาชิกห้องสมุด (Member) ]       [ บุคลากรห้องสมุด (Staff) ]
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
               [ เจ้าหน้าที่ (Librarian) ]      [ ผู้ดูแลระบบ (Admin) ]
```

---

## 4. Role Definitions

### 4.1 Member (สมาชิกห้องสมุด)
- **นิยาม:** ผู้ใช้บริการห้องสมุดทั่วไป (นักเรียน, นักศึกษา, บุคลากร หรือประชาชน) ที่ลงทะเบียนและมีสถานะการเป็นสมาชิก Active
- **ขอบเขตอำนาจหน้าที่:**
  - สิทธิค้นหา ดูรายการและรายละเอียดหนังสือทั้งหมด
  - สิทธิทำธุรกรรมขอยืมและจองหนังสือด้วยตนเอง
  - สิทธิเข้าถึงและจัดการข้อมูลส่วนตัว (Profile), ประวัติการยืม-คืน, รายการจอง และข้อมูลค่าปรับของตนเองเท่านั้น
  - สิทธิรับข้อความแจ้งเตือนที่เกี่ยวข้องกับบัญชีของตนเอง

### 4.2 Librarian (เจ้าหน้าที่ห้องสมุด / บรรณารักษ์)
- **นิยาม:** เจ้าหน้าที่ผู้รับผิดชอบการปฏิบัติงานประจำวันของห้องสมุด (Library Operations)
- **ขอบเขตอำนาจหน้าที่:**
  - สิทธิดูแลแคตตาล็อกหนังสือ เพิ่ม ลบ แก้ไข ข้อมูลบรรณานุกรม และจัดการหมวดหมู่หนังสือ
  - สิทธิดำเนินการและตรวจสอบธุรกรรม ยืม-คืน-จอง หนังสือที่เคาน์เตอร์บริการ
  - สิทธิตรวจสอบหนังสือค้างส่ง (Overdue) และบันทึกการรับชำระค่าปรับ
  - สิทธิเข้าถึงข้อมูลสมาชิกในระดับการปฏิบัติงาน (Operational Member Data)
  - สิทธิดูแดชบอร์ดและรายงานสถิติการยืม-คืนของห้องสมุด

### 4.3 Admin (ผู้ดูแลระบบสูงสุด)
- **นิยาม:** ผู้ดูแลระบบที่มีสิทธิ์สูงสุดในการบริหารจัดการเทคโนโลยีและการกำหนดค่านโยบายของระบบ
- **ขอบเขตอำนาจหน้าที่:**
  - สิทธิบริหารจัดการบัญชีผู้ใช้งานทั้งหมด (เพิ่ม, แก้ไข, ระงับการใช้งาน, กำหนดบทบาท)
  - สิทธิกำหนดและปรับปรุงค่าพารามิเตอร์ของระบบ (System Configurations เช่น ระยะเวลายืม, อัตราค่าปรับ)
  - สิทธิเข้าถึงแดชบอร์ดภาพรวมและรายงานเชิงลึกทุกมิติ
  - สิทธิดูแลและตรวจสอบประวัติการทำกิจกรรมสำคัญ (Audit Activity Logs)

### 4.4 Additional Roles Analysis (การพิจารณาบทบาทเพิ่มเติม)
- **ผลการวิเคราะห์:** จากข้อกำหนดใน `01-system-overview.md` และ `02-requirements.md` ขอบเขตการทำงานของห้องสมุดสามารถบริหารจัดการได้อย่างมีประสิทธิภาพด้วย 3 Roles หลักดังกล่าว โดยไม่มีความจำเป็นต้องเพิ่ม Role พิเศษ (เช่น Guest หรือ Supervisor) ในระยะนี้ เพื่อคงความเรียบง่ายและปลอดภัยของระบบตามหลัก Minimal Architecture

---

## 5. Permission Domains
ระบบแบ่งกลุ่มสิทธิ์การใช้งานออกเป็น 13 โดเมนหลักตาม Functional Requirements:

1. **AUTH (Authentication & Session):** สิทธิ์ในการเข้าสู่ระบบ ออกจากระบบ และตรวจสอบสถานะตัวตน
2. **PROFILE (Member Profile Management):** สิทธิ์ในการดูและปรับปรุงข้อมูลโปรไฟล์ส่วนตัว
3. **MEMBER_MGMT (Member Account Management):** สิทธิ์ในการค้นหา ดูประวัติ และเปลี่ยนสถานะสมาชิก
4. **BOOK_MGMT (Book & Category Management):** สิทธิ์ในการสร้าง แก้ไข ลบ หนังสือ หมวดหมู่ และสต็อก
5. **SEARCH (Search & Discovery):** สิทธิ์ในการสืบค้น กรอง จัดเรียง และดูรายละเอียดหนังสือ
6. **BORROW (Borrowing Operations):** สิทธิ์ในการสร้าง ตรวจสอบ และประมวลผลการยืมหนังสือ
7. **RETURN (Returning Operations):** สิทธิ์ในการรับคืนหนังสือ ตรวจสอบ Due Date และบันทึกสถานะ
8. **RESERVE (Reservation Operations):** สิทธิ์ในการจอง ยกเลิกการจอง และจัดการคิวการจอง
9. **FINE (Fine & Payment Management):** สิทธิ์ในการคำนวณ ดูประวัติ และบันทึกการรับชำระค่าปรับ
10. **NOTIF (Notification Services):** สิทธิ์ในการรับ ดู และจัดการสถานะข้อความแจ้งเตือน
11. **DASHBOARD (Dashboard & Analytics):** สิทธิ์ในการเข้าถึงแดชบอร์ดและข้อมูลสรุปเชิงสถิติ
12. **REPORT (Reporting Services):** สิทธิ์ในการดูและจัดทำรายงานสรุปข้อมูลห้องสมุด
13. **ADMIN (System & Access Control):** สิทธิ์ในการจัดการผู้ใช้ กำหนดบทบาท และตรวจสอบ Audit Log

---

## 6. Role Permission Matrix

> **สัญลักษณ์:**
> - `✓` = ได้รับอนุญาตโดยสมบูรณ์ (Allowed)
> - `✗` = ไม่อนุญาตให้เข้าถึง (Denied)
> - `Limited` = อนุญาตเฉพาะข้อมูลที่เป็นของตนเอง หรือมีเงื่อนไขจำกัด (Restricted Scope)
> - `N/A` = ไม่เกี่ยวข้องกับหน้าที่ (Not Applicable)

| โดเมนสิทธิ์ (Domain) | สิทธิ์การดำเนินการ (Permission Action) | Member | Librarian | Admin | เงื่อนไขและข้อจำกัด (Notes & Restrictions) |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Authentication** | Login / Logout | `✓` | `✓` | `✓` | ทุกบัญชีที่สถานะ Active |
| | Change Own Password | `✓` | `✓` | `✓` | แก้ไขได้เฉพาะรหัสผ่านตนเอง |
| **Profile** | View Own Profile | `✓` | `✓` | `✓` | สมาชิกดูได้เฉพาะข้อมูลตนเอง |
| | Update Own Profile | `✓` | `✓` | `✓` | แก้ไขข้อมูลติดต่อได้ ไม่สามารถแก้ Role/Status ได้ |
| **Member Management** | View Member List | `✗` | `✓` | `✓` | เจ้าหน้าที่และแอดมินดูรายชื่อเพื่อบริการ |
| | View Member History | `Limited` | `✓` | `✓` | Member ดูได้เฉพาะของตนเอง, เจ้าหน้าที่ดูเพื่อตรวจสอบ |
| | Update Member Status | `✗` | `Limited` | `✓` | Librarian ระงับสิทธิ์ชั่วคราวได้, Admin จัดการได้เต็ม |
| **Book Management** | View Book Catalog | `✓` | `✓` | `✓` | ข้อมูลสาธารณะสำหรับผู้ใช้ทุกคน |
| | Create Book / Copy | `✗` | `✓` | `✓` | เจ้าหน้าที่บันทึกหนังสือเข้าใหม่ |
| | Update Book Info | `✗` | `✓` | `✓` | แก้ไขบรรณานุกรมและจำนวนสต็อก |
| | Delete / Archive Book | `✗` | `Limited` | `✓` | Librarian ปรับสถานะชำรุด/สูญหาย, Admin ลบถาวร |
| | Manage Categories | `✗` | `✓` | `✓` | เพิ่ม/แก้ไขหมวดหมู่หนังสือ |
| **Search & Browse** | Search & Filter Books | `✓` | `✓` | `✓` | ค้นหาได้อิสระตาม Keyword และตัวกรอง |
| | View Book Availability | `✓` | `✓` | `✓` | แสดงจำนวนพร้อมยืมแบบ Realtime |
| **Borrowing** | Request Borrow (Self) | `✓` | `✓` | `✓` | สมาชิกกดขอยืมด้วยตนเอง (หากเปิดใช้) |
| | Process Borrow (Counter) | `✗` | `✓` | `✓` | เจ้าหน้าที่บันทึกการตัดจ่ายหนังสือหน้าเคาน์เตอร์ |
| | View Borrow History | `Limited` | `✓` | `✓` | Member ดูเฉพาะของตนเอง, เจ้าหน้าที่ดูทั้งหมด |
| **Returning** | Process Return | `✗` | `✓` | `✓` | เจ้าหน้าที่ตรวจสอบสภาพและบันทึกรับคืน |
| | View Return History | `Limited` | `✓` | `✓` | Member ดูเฉพาะของตนเอง, เจ้าหน้าที่ดูทั้งหมด |
| **Reservation** | Create Reservation | `✓` | `✓` | `✓` | จองได้เฉพาะเล่มที่ไม่มีสำเนาว่าง |
| | Cancel Own Reservation | `✓` | `✓` | `✓` | สมาชิกยกเลิกคิวตนเองได้ |
| | Manage Queue / Fulfill | `✗` | `✓` | `✓` | เจ้าหน้าที่จัดสรรหนังสือให้คิวถัดไป |
| **Fine Management** | View Fine Details | `Limited` | `✓` | `✓` | Member ดูเฉพาะยอดตนเอง, เจ้าหน้าที่ดูทั้งหมด |
| | Record Fine Payment | `✗` | `✓` | `✓` | เจ้าหน้าที่บันทึกการรับชำระค่าปรับ |
| | Waive / Adjust Fine | `✗` | `✗` | `✓` | Admin เท่านั้นที่มีสิทธิ์ยกเว้นหรือปรับลดยอดค่าปรับ |
| **Notification** | Receive In-App Alerts | `✓` | `✓` | `✓` | ได้รับข้อความแจ้งเตือนตามกิจกรรม |
| | Manage Own Notifications| `✓` | `✓` | `✓` | ปรับสถานะเป็นอ่านแล้ว (Mark as Read) |
| **Dashboard** | View Member Dashboard | `✓` | `N/A` | `N/A` | แสดงสรุปรายการยืม จอง ค่าปรับของตนเอง |
| | View Staff Dashboard | `✗` | `✓` | `✓` | แสดงสถิติงานบริการภาพรวมห้องสมุด |
| **Reports** | View Operational Reports| `✗` | `✓` | `✓` | รายงานการยืม-คืน หนังสือเกินกำหนด และค่าปรับ |
| | Export Summary Reports | `✗` | `Limited` | `✓` | ตามข้อกำหนดนโยบายห้องสมุด |
| **System Admin** | Manage Users & Roles | `✗` | `✗` | `✓` | สร้างบัญชี ปรับบทบาท และรีเซ็ตรหัสผ่าน |
| | System Configurations | `✗` | `✗` | `✓` | ปรับอัตราค่าปรับและระยะเวลาการยืม |
| | View Audit Activity | `✗` | `✗` | `✓` | ตรวจสอบบันทึกความปลอดภัยของระบบ |

---

## 7. Role Capability Comparison

| ขีดความสามารถของระบบ (Capability) | Member | Librarian | Admin |
| :--- | :---: | :---: | :---: |
| ค้นหาและดูรายละเอียดหนังสือ (Search & View Catalog) | `✓` | `✓` | `✓` |
| ยืมหนังสือและจองหนังสือ (Borrow & Reserve Book) | `✓` | `✓` | `✓` |
| ดูประวัติและค่าปรับส่วนตัว (View Own History & Fines) | `✓` | `✓` | `✓` |
| จัดการแคตตาล็อกหนังสือและหมวดหมู่ (Manage Catalog) | `✗` | `✓` | `✓` |
| บันทึกการรับคืนหนังสือและรับชำระค่าปรับ (Process Return/Fine) | `✗` | `✓` | `✓` |
| จัดการคิวการจองและติดตามค้างส่ง (Manage Reservations/Overdue) | `✗` | `✓` | `✓` |
| ดูข้อมูลสมาชิกในระบบ (View All Members Data) | `✗` | `✓` | `✓` |
| ดูรายงานการดำเนินงานและสถิติห้องสมุด (View Reports) | `✗` | `✓` | `✓` |
| จัดการผู้ใช้งานและกำหนด Role (User & Role Management) | `✗` | `✗` | `✓` |
| กำหนดค่านโยบายระบบและอัตราค่าปรับ (System Configuration) | `✗` | `✗` | `✓` |
| ปรับลดยอดหรือยกเว้นค่าปรับ (Waive Fine) | `✗` | `✗` | `✓` |
| ตรวจสอบบันทึกความปลอดภัย (View Audit Activity) | `✗` | `✗` | `✓` |

---

## 8. Screen Access Matrix (แผนผังสิทธิ์การเข้าถึงหน้าจอ)

```text
[ Public Routes - ทุกคนเข้าถึงได้ ]
├── /login (หน้าเข้าสู่ระบบ)
├── /catalog (หน้าสืบค้นรายการหนังสือ)
└── /catalog/:id (หน้ารายละเอียดหนังสือ)

[ Member Protected Routes - สมาชิก ]
├── /member/dashboard (แดชบอร์ดสรุปกิจกรรมของสมาชิก)
├── /member/profile (หน้าข้อมูลส่วนตัว)
├── /member/my-borrows (หน้าติดตามรายการกำลังยืมและประวัติการคืน)
├── /member/my-reservations (หน้ารายการจองและสถานะคิว)
├── /member/my-fines (หน้ายอดค่าปรับและประวัติการชำระ)
└── /member/notifications (หน้ากล่องข้อความแจ้งเตือน)

[ Librarian Protected Routes - เจ้าหน้าที่ ]
├── /librarian/dashboard (แดชบอร์ดงานบริการห้องสมุด)
├── /librarian/books (หน้าจัดการรายการหนังสือและสต็อก)
├── /librarian/categories (หน้าจัดการหมวดหมู่หนังสือ)
├── /librarian/circulation (หน้าเคาน์เตอร์บริการยืม-คืน)
├── /librarian/reservations (หน้าจัดการคิวการจอง)
├── /librarian/overdue (หน้าติดตามหนังสือค้างส่ง)
├── /librarian/fines (หน้าบันทึกการรับชำระค่าปรับ)
├── /librarian/members (หน้าค้นหาและตรวจสอบข้อมูลสมาชิก)
└── /librarian/reports (หน้ารายงานสถิติการดำเนินงาน)

[ Admin Protected Routes - ผู้ดูแลระบบ ]
├── /admin/dashboard (แดชบอร์ดภาพรวมเชิงบริหาร)
├── /admin/users (หน้าจัดการบัญชีผู้ใช้และสิทธิ์)
├── /admin/settings (หน้าตั้งค่าระบบ นโยบาย และอัตราค่าปรับ)
├── /admin/reports (หน้ารายงานสรุปเชิงสถิติขั้นสูง)
└── /admin/audit-logs (หน้าตรวจสอบประวัติกิจกรรมความปลอดภัย)
```

---

## 9. Data Visibility Matrix (ระดับการมองเห็นข้อมูล)

| ข้อมูลธุรกิจ (Data Entity) | Member | Librarian | Admin | รายละเอียดการจำกัดสิทธิ์ (Visibility Rule) |
| :--- | :--- | :--- | :--- | :--- |
| **Own Profile / Credentials** | **Full** | **Full** | **Full** | เจ้าของดูได้เต็มที่, เจ้าหน้าที่ดูข้อมูลติดต่อได้, Admin จัดการได้ |
| **Other Member Profile** | **Hidden** | **Operational**| **Full** | สมาชิกมองไม่เห็นข้อมูลผู้อื่น, เจ้าหน้าที่เห็นเพื่อยืนยันตัวตน |
| **Book & Category Catalog** | **Public** | **Full** | **Full** | ข้อมูลหนังสือเป็นสาธารณะ |
| **Borrowing Transactions** | **Own Only** | **Library-wide**| **Full** | สมาชิกเห็นเฉพาะของตนเอง, เจ้าหน้าที่เห็นของสมาชิกทุกคน |
| **Reservation Queue** | **Own Only** | **Library-wide**| **Full** | สมาชิกเห็นเฉพาะคิวตนเอง, เจ้าหน้าที่เห็นลำดับคิวทั้งหมด |
| **Fine & Payment Records** | **Own Only** | **Library-wide**| **Full** | สมาชิกเห็นยอดตนเอง, เจ้าหน้าที่บันทึกรับเงินได้ |
| **User Roles & Permissions**| **Hidden** | **Hidden** | **Full** | ข้อมูลโครงสร้างสิทธิ์เข้าถึงได้เฉพาะ Admin เท่านั้น |
| **System Settings & Audit** | **Hidden** | **Hidden** | **Full** | ข้อมูลการตั้งค่าระบบและ Audit Log เป็นความลับระดับ Admin |

---

## 10. Resource Ownership & Access Control Principles

### 10.1 กฎการเป็นเจ้าของทรัพยากร (Resource Ownership Rules)
- **Member Ownership:** ข้อมูลธุรกรรมการยืม การจอง และค่าปรับที่มี `user_id` ผูกอยู่ ถือเป็นสิทธิ์เฉพาะตัวของสมาชิกคนนั้น ผู้ใช้อื่นที่เป็น Role Member จะไม่สามารถเรียกดู แก้ไข หรือลบข้อมูลนี้ได้ในทุกกรณี
- **Librarian Ownership:** เจ้าหน้าที่ทำหน้าที่เป็นผู้ดำเนินการ (Operator) ในนามของห้องสมุด สามารถเข้าถึงและปรับปรุงสถานะธุรกรรมของสมาชิกทุกคนได้เพื่อการบริการ แต่ไม่สามารถเข้าถึงรหัสผ่านหรือข้อมูลส่วนตัวที่ไม่เกี่ยวข้อง
- **Admin Ownership:** ผู้ดูแลระบบมีสิทธิ์ในการเข้าถึงและจัดการทรัพยากรทั้งหมดในระดับโครงสร้างระบบ

### 10.2 การป้องกันการละเมิดสิทธิ์ (Access Violations Handling)
1. **Horizontal Privilege Escalation (การเข้าถึงข้อมูลผู้ใช้อื่นในระดับเดียวกัน):**
   - เช่น Member A พยายามเรียกดู URL `/api/borrows/999` ซึ่งเป็นของ Member B
   - *มาตรการ:* Backend Middleware ต้องตรวจสอบ `req.user.id === resource.user_id` เสมอ หากไม่ตรงกันให้ปฏิเสธด้วย `HTTP 403 Forbidden`
2. **Vertical Privilege Escalation (การยกระดับสิทธิ์ข้ามบทบาท):**
   - เช่น Member พยายามส่ง Request ไปยัง Endpoint `/api/admin/users` หรือ `/api/librarian/books`
   - *มาตรการ:* ตรวจสอบ Role ของ Token ผ่าน Role Guard Middleware หาก Role ไม่มีสิทธิ์ ให้ปฏิเสธด้วย `HTTP 403 Forbidden` ทันที

---

## 11. Authorization Rules (กฎสถาปัตยกรรมการตรวจสอบสิทธิ์)

1. **Authentication First:** ทุก Request ที่เข้าสู่ Protected Resource ต้องมี Token ที่ถูกต้องและยังไม่หมดอายุ มิฉะนั้นจะถูกปฏิเสธด้วย `HTTP 401 Unauthorized`
2. **Dual-Layer Validation (Backend Is Source of Truth):**
   - **Frontend Guard:** ทำหน้าที่ควบคุมการแสดงผล UI ซ่อนปุ่ม และป้องกันการเปลี่ยน Route ในหน้าจอเบราว์เซอร์ เพื่อประสบการณ์การใช้งานที่ดี (User Experience)
   - **Backend Guard:** ทำหน้าที่ตรวจสอบ Token, Role และ Resource Ownership ในทุก API Request เพื่อความปลอดภัยสูงสุด (ห้ามเชื่อถือการตรวจสอบจาก Frontend เพียงอย่างเดียว)
3. **No Implicit Grant:** ไม่อนุญาตให้มีการอนุญาตสิทธิ์โดยปริยาย ทุก Endpoint ต้องระบุสิทธิ์ที่ต้องการอย่างชัดเจน
4. **Least Privilege Principle:** ผู้ใช้งานแต่ละ Role จะได้รับสิทธิ์เท่าที่จำเป็นต่อการปฏิบัติงานเท่านั้น

---

## 12. Permission Inheritance Analysis
- **การตัดสินใจ:** ในโปรเจกต์ Online Library Management System ระยะนี้ **ไม่ใช้ระบบสืบทอดสิทธิ์ (No Permission Inheritance)** ที่ซับซ้อน
- **เหตุผล:** บทบาททั้ง 3 (Member, Librarian, Admin) มีหน้าที่และขอบเขตความรับผิดชอบที่แยกจากกันอย่างชัดเจน (Distinct Separation) การกำหนดสิทธิ์แบบ Explicit Role-based Matrix จะช่วยให้โค้ดใน Middleware เรียบง่าย ตรวจสอบง่าย และลดความเสี่ยงจากการรั่วไหลของสิทธิ์

---

## 13. Separation of Duties (การแบ่งแยกหน้าที่ความรับผิดชอบ)

| งานที่ต้องแบ่งแยก (Task Domain) | Librarian (เจ้าหน้าที่บริการ) | Admin (ผู้ดูแลระบบ) | เหตุผลในการแบ่งแยกหน้าที่ |
| :--- | :---: | :---: | :--- |
| **การจัดการหนังสือและสต็อก** | รับผิดชอบหลัก (`✓`) | ดูแลภาพรวม (`✓`) | ให้เจ้าหน้าที่หน้างานจัดการงานประจำวัน |
| **การบริการยืม-คืน-จอง** | รับผิดชอบหลัก (`✓`) | ดำเนินการได้ (`✓`) | หน้าที่บริการเคาน์เตอร์ |
| **การสร้าง/กำหนดสิทธิ์ผู้ใช้** | **ไม่มีสิทธิ์ (`✗`)** | **รับผิดชอบหลัก (`✓`)** | ป้องกันเจ้าหน้าที่สร้างสิทธิ์ Admin เอง |
| **การยกเว้น/ลดยอดค่าปรับ** | **ไม่มีสิทธิ์ (`✗`)** | **รับผิดชอบหลัก (`✓`)** | ป้องกันการทุจริตหรือผลประโยชน์ทับซ้อน |
| **การตั้งค่านโยบายและค่าปรับ**| **ไม่มีสิทธิ์ (`✗`)** | **รับผิดชอบหลัก (`✓`)** | การกำหนดนโยบายต้องผ่านการตัดสินใจระดับบริหาร |

---

## 14. Security Considerations

1. **Token Security:** ใช้ JWT หรือ Secure Session สำหรับการระบุตัวตน โดยต้องเก็บรักษา Secret อย่างปลอดภัยใน Environment Variables และไม่ส่งข้อมูลอ่อนไหว (เช่น Password Hash) ใน Payload
2. **Protection Against Insecure Direct Object References (IDOR):** ทุกครั้งที่มีการอ้างอิง `id` ของรายการยืม คืน หรือจอง ใน Parameter Backend ต้องตรวจสอบสิทธิ์ความเป็นเจ้าของของ `id` นั้นเสมอ
3. **Admin Account Protection:** ป้องกันไม่ให้ Admin ลบหรือระงับบัญชีของตนเอง เพื่อป้องกันไม่ให้เกิดภาวะระบบขาดผู้ดูแล (Lockout Prevention)
4. **Auditability:** กิจกรรมที่มีผลต่อความปลอดภัยและการเงิน (เช่น การเปลี่ยน Role, การยกเว้นค่าปรับ, การระงับสมาชิก) ต้องถูกบันทึกใน Audit Log

---

## 15. Requirement Traceability Matrix

| โดเมนสิทธิ์ (Permission Group) | Requirements ที่เกี่ยวข้อง | Role ที่มีสิทธิ์ใช้งาน |
| :--- | :--- | :--- |
| **Authentication & Profile** | `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-005` | Member, Librarian, Admin |
| **Member Management** | `FR-006`, `FR-007` | Member (Own), Librarian, Admin |
| **Book & Category Management** | `FR-008`, `FR-009`, `FR-010` | Librarian, Admin |
| **Search & Discovery** | `FR-011`, `FR-012`, `FR-013`, `FR-014` | Member, Librarian, Admin, Public |
| **Borrowing Operations** | `FR-015`, `FR-016`, `FR-017` | Member (Self/Own), Librarian, Admin |
| **Returning Operations** | `FR-018`, `FR-019` | Librarian, Admin, Member (History) |
| **Reservation Operations** | `FR-020`, `FR-021`, `FR-022` | Member (Own), Librarian, Admin |
| **Fine & Payment Management** | `FR-023`, `FR-024`, `FR-025` | Member (Own), Librarian (Pay), Admin (Full) |
| **Notification Services** | `FR-026`, `FR-027`, `FR-028` | Member, Librarian, Admin |
| **Dashboard & Analytics** | `FR-029`, `FR-030` | Member (Personal), Librarian, Admin (Staff) |
| **Reporting Services** | `FR-031`, `FR-032` | Librarian, Admin |
| **System & Access Control** | `FR-033`, `FR-034` | Admin เท่านั้น |

---

## 16. Open Questions (ประเด็นสิทธิ์ที่ต้องการการยืนยัน)

| ID | ประเด็นคำถามด้านสิทธิ์ | ผลกระทบ | ลำดับความสำคัญ | การตัดสินใจที่ต้องการ |
| :--- | :--- | :---: | :---: | :--- |
| **OQ-SEC-001** | ผู้ใช้งานที่เป็น Librarian หรือ Admin สามารถใช้บัญชีของตนเองยืมหนังสือเพื่อการอ่านส่วนบุคคลได้หรือไม่ หรือต้องสมัครบัญชี Member แยกต่างหาก? | Low | Medium | ยืนยันสิทธิ์ Self-borrowing ของบุคลากร |
| **OQ-SEC-002** | เจ้าหน้าที่ Librarian มีสิทธิ์ระงับการใช้งานสมาชิก (Suspend Member) ได้ชั่วคราวหรือไม่ หรือต้องให้ Admin เป็นผู้อนุมัติเท่านั้น? | Medium | Medium | กำหนดขอบเขตสิทธิ์ Member Management ของ Librarian |
| **OQ-SEC-003** | ในกรณีที่ต้องการยกเว้นหรือปรับลดค่าปรับ (Waive Fine) เนื่องจากเหตุสุดวิสัย ให้สิทธิ์เฉพาะ Admin เท่านั้น หรืออนุญาตให้ Senior Librarian ดำเนินการได้? | Medium | High | ยืนยันสิทธิ์ทางการเงินเพื่อป้องกัน Separation of Duties Violation |
| **OQ-SEC-004** | การดูรายงานสถิติ (Reports) อนุญาตให้ Librarian ทำการ Export ข้อมูลออกมาเป็นไฟล์ (เช่น CSV/PDF) ได้หรือไม่? | Low | Low | กำหนดขอบเขตสิทธิ์ Data Export |

---

## 17. Assumptions
1. ผู้ใช้งานทุกคนที่ล็อกอินเข้าสู่ระบบจะมีบทบาทหลัก (Primary Role) 1 บทบาทอย่างชัดเจน
2. ระบบจะไม่มีการให้สิทธิ์ผู้ใช้ทั่วไปแก้ไขข้อมูลของผู้อื่น ไม่ว่าในกรณีใดๆ
3. การเข้าถึงหน้าเว็บของระบบในส่วนที่เป็นข้อมูลสาธารณะ (เช่น การค้นหาหนังสือ) อนุญาตให้ผู้ที่ยังไม่ได้ล็อกอินสามารถเข้าชมได้ในฐานะ Guest (Read-only)

---

## 18. Summary
เอกสาร **Roles & Permissions Specification** ฉบับนี้ได้กำหนดโครงสร้างการควบคุมการเข้าถึง 3 บทบาทหลัก (Member, Librarian, Admin) ครอบคลุม 13 โดเมนสิทธิ์ พร้อมสร้างตาราง Permission Matrix, แผนผังสิทธิ์การเข้าถึงหน้าจอ (Screen Access Matrix), ระดับการมองเห็นข้อมูล (Data Visibility Matrix), และกฎการป้องกันการละเมิดสิทธิ์ (IDOR / Privilege Escalation) ไว้อย่างครบถ้วนตามข้อกำหนดใน Requirements Specification เอกสารนี้พร้อมนำไปใช้เป็นรากฐานสำหรับ **Planning Step 4: Library Workflow (`04-library-workflow.md`)** ต่อไป
