# Frontend Page Structure & UI Specification: Online Library Management System

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `07-frontend-pages.md`  
**Phase:** Phase 1 — Planning Only (Step 7: Frontend Pages)  
**Status:** Under Review  
**Date:** 2026-08-28  

---

## 1. Purpose
เอกสารฉบับนี้จัดทำขึ้นเพื่อออกแบบสถาปัตยกรรมโครงสร้างหน้าจอ (Frontend Information Architecture), ผังเส้นทาง (Routing Structure), โครงร่างการจัดวาง (Layout Structure), ข้อกำหนดของตารางและฟอร์ม (Table & Form Specifications), การควบคุมการแสดงผลตามสิทธิ์ (Role-Based UI), และการเชื่อมโยงหน้าจอกับ RESTful API Contract สำหรับ **Online Library Management System** โดยใช้เทคโนโลยี **React 18 + Vite 5 + MUI 5** เพื่อเป็นพิมพ์เขียวสำหรับการพัฒนาหน้าจอในระดับ Implementation

---

## 2. Reference Documents
เอกสารที่ใช้อ้างอิงร่วมในการออกแบบโครงสร้างหน้าจอ:
1. `docs/planning/01-system-overview.md` — ภาพรวมระบบและขอบเขตผู้ใช้งาน
2. `docs/planning/02-requirements.md` — ข้อกำหนดความต้องการ (`FR-001` ถึง `FR-034`, `NFR-001` ถึง `NFR-010`)
3. `docs/planning/03-roles-permissions.md` — บทบาท สิทธิ์ และ Screen Access Matrix
4. `docs/planning/04-library-workflow.md` — ผังกระบวนการทำงานและวงจรสถานะ
5. `docs/planning/05-database-design.md` — โครงสร้างข้อมูลและ Data Entities
6. `docs/planning/06-api-contract.md` — สัญญา REST API 16 โมดูล 42 Endpoints
7. `docs/planning/00-tech-stack-decision.md` — การตัดสินใจเลือก React 18, Vite 5, MUI 5 (Port `5173`)

---

## 3. Frontend Architecture Overview
- **Core Framework:** React 18 (Single Page Application - SPA)
- **Build Tool:** Vite 5
- **UI & Component Library:** Material-UI (MUI v5) พร้อม Emotion Styling Engine
- **Routing Engine:** React Router (v6) รองรับ Nested Routes และ Protected Route Guards
- **State Management:** React Context API + Custom Hooks สำหรับ Auth State และ Notifications
- **HTTP Client Strategy:** Axios / Fetch API พร้อม Interceptor ดักจับ Token (`Bearer JWT`) และจัดการ Error Response กลาง
- **Responsive Layout:** MUI Grid System (Breakpoints: `xs`, `sm`, `md`, `lg`, `xl`)

---

## 4. User Groups & View Perspectives
ระบบจัดมุมมองหน้าจอออกเป็น 4 กลุ่มตามบทบาทและสิทธิ์:
1. **Public / Guest:** ผู้เยี่ยมชมทั่วไป เข้าถึงการค้นหาหนังสือ ดูรายละเอียด และหน้า Login
2. **Member Perspective:** สมาชิกห้องสมุด เน้นการค้นหา จัดการรายการยืม-คืน ประวัติการจอง ค่าปรับ และการแจ้งเตือน
3. **Librarian Perspective:** เจ้าหน้าที่บริการ เน้นเคาน์เตอร์ยืม-คืน จัดการหนังสือ คลังสำเนา คิวจอง และบันทึกค่าปรับ
4. **Admin Perspective:** ผู้ดูแลระบบ เน้นการจัดการผู้ใช้ กำหนดบทบาท ตั้งค่านโยบาย แดชบอร์ดภาพรวม และ Audit Logs

---

## 5. Information Architecture (IA)

```text
[ Online Library Web Application ]
  │
  ├── 1. Public & Discovery
  │    ├── Login Page (/login)
  │    ├── Book Catalog & Search (/catalog)
  │    └── Book Details View (/catalog/:id)
  │
  ├── 2. Member Portal (My Library)
  │    ├── Member Dashboard (/member/dashboard)
  │    ├── My Borrowings (/member/my-borrows)
  │    ├── My Reservations (/member/my-reservations)
  │    ├── My Fines (/member/my-fines)
  │    ├── Notification Center (/member/notifications)
  │    └── Profile Settings (/member/profile)
  │
  ├── 3. Librarian Portal (Operations)
  │    ├── Librarian Dashboard (/librarian/dashboard)
  │    ├── Circulation Desk (/librarian/circulation)
  │    ├── Book Catalog Management (/librarian/books)
  │    ├── Book Copy Management (/librarian/books/:id/copies)
  │    ├── Category Management (/librarian/categories)
  │    ├── Reservation Management (/librarian/reservations)
  │    ├── Overdue & Fine Management (/librarian/fines)
  │    ├── Member Directory (/librarian/members)
  │    └── Operational Reports (/librarian/reports)
  │
  └── 4. Admin Portal (Administration)
       ├── Admin Dashboard (/admin/dashboard)
       ├── User Management (/admin/users)
       ├── System Settings (/admin/settings)
       ├── Advanced Reports (/admin/reports)
       └── Audit Log Viewer (/admin/audit-logs)
```

---

## 6. Layout Structure

### 6.1 Public Layout (`PublicLayout`)
- **Header / App Bar:** โลโก้ห้องสมุด, เมนูค้นหาหนังสือ, ปุ่มเข้าสู่ระบบ (`Login`)
- **Main Container:** เนื้อหาหน้าสืบค้นแคตตาล็อก หรือกล่องฟอร์ม Login ตรงกลางหน้าจอ
- **Footer:** ข้อมูลติดต่อห้องสมุด และเวลาเปิด-ปิดทำการ

### 6.2 Member Layout (`MemberLayout`)
- **Topbar:** โลโก้, แถบค้นหาด่วน, กระดิ่งแจ้งเตือน (พร้อม Unread Badge), เมนูโปรไฟล์ผู้ใช้
- **Sidebar (Collapsible):** แดชบอร์ด, ค้นหาหนังสือ, รายการกำลังยืม, รายการจอง, ยอดค่าปรับ, ข้อความแจ้งเตือน
- **Content Area:** แสดงข้อมูลตาม Route

### 6.3 Staff & Admin Layout (`StaffLayout`)
- **Topbar:** Staff Portal Header, สลับโหมดสี, การแจ้งเตือนระบบ, ข้อมูลเจ้าหน้าที่
- **Sidebar (Fixed on Desktop, Drawer on Mobile):** จัดกลุ่มเมนูงานบริการ (Circulation, Books, Members, Reports) และเมนูผู้ดูแลระบบ (Users, Settings, Logs) ตาม Role
- **Content Area:** ตารางข้อมูลขนาดใหญ่ (Data Tables) และฟอร์มบันทึกข้อมูล

---

## 7. Routing Structure & Route Guards

```text
/ (Root) ──────────────────────────► Redirect ไป /catalog หรือ /member/dashboard ตามสถานะ Login

[ Public Routes ]
├── /login                         (Guest Only / Redirect ถ้า Login แล้ว)
├── /catalog                       (Public View)
└── /catalog/:id                   (Public View)

[ Protected Routes - Member Role ]
├── /member/dashboard              (Requires Member Role)
├── /member/my-borrows             (Requires Member Role)
├── /member/my-reservations        (Requires Member Role)
├── /member/my-fines               (Requires Member Role)
├── /member/notifications          (Requires Member Role)
└── /member/profile                (Requires Member Role)

[ Protected Routes - Librarian Role ]
├── /librarian/dashboard           (Requires Librarian / Admin)
├── /librarian/circulation         (Requires Librarian / Admin)
├── /librarian/books               (Requires Librarian / Admin)
├── /librarian/books/new           (Requires Librarian / Admin)
├── /librarian/books/:id/edit      (Requires Librarian / Admin)
├── /librarian/books/:id/copies    (Requires Librarian / Admin)
├── /librarian/categories          (Requires Librarian / Admin)
├── /librarian/reservations        (Requires Librarian / Admin)
├── /librarian/overdue             (Requires Librarian / Admin)
├── /librarian/fines               (Requires Librarian / Admin)
├── /librarian/members             (Requires Librarian / Admin)
├── /librarian/members/:id         (Requires Librarian / Admin)
└── /librarian/reports             (Requires Librarian / Admin)

[ Protected Routes - Admin Role Only ]
├── /admin/dashboard               (Requires Admin)
├── /admin/users                   (Requires Admin)
├── /admin/users/new               (Requires Admin)
├── /admin/users/:id/edit          (Requires Admin)
├── /admin/settings                (Requires Admin)
├── /admin/reports                 (Requires Admin)
└── /admin/audit-logs              (Requires Admin)

[ Error Routes ]
├── /unauthorized (403)            (แสดงเมื่อไม่มีสิทธิ์เข้าถึง)
└── * (404)                        (แสดงเมื่อไม่พบหน้า)
```

---

## 8. Public Pages
1. **Login Page (`/login`):** กล่อง Card ตรงกลางหน้าจอ ให้กรอก Username/Email และ Password พร้อมปุ่มจำกัดสถานะ Loading
2. **Public Catalog Page (`/catalog`):** Grid Card แสดงรายการหนังสือ, ช่องค้นหาขนาดใหญ่, แถบตัวกรองหมวดหมู่ และ Badge แสดงสถานะพร้อมยืม
3. **Public Book Details Page (`/catalog/:id`):** แสดงรูปปก, บรรณานุกรม, เรื่องย่อ, จำนวนสำเนาคงเหลือ และปุ่ม Action (กดแล้วนำทางสู่การ Login หากยังไม่ได้เข้าระบบ)

---

## 9. Member Pages
1. **Member Dashboard (`/member/dashboard`):** แสดง Summary Cards (กำลังยืม, ค้างส่ง, รอรับหนังสือจอง, ค่าปรับ) และแถบแจ้งเตือนด่วน
2. **My Borrowings Page (`/member/my-borrows`):** ตารางรายการหนังสือที่กำลังยืม พร้อมเวลานับถอยหลังสู่วัน Due Date และแท็บประวัติการคืนในอดีต
3. **My Reservations Page (`/member/my-reservations`):** แสดงรายการที่จอง ลำดับคิว (`Queue #`) สถานะพร้อมรับหนังสือ และปุ่มกดยกเลิกการจอง
4. **My Fines Page (`/member/my-fines`):** แสดงตารางสรุปค่าปรับ ยอดค้างชำระ ยอดที่ชำระแล้ว และคำแนะนำการชำระเงินที่เคาน์เตอร์
5. **Notification Center (`/member/notifications`):** รายการกล่องข้อความแจ้งเตือน พร้อมปุ่ม "อ่านแล้วทั้งหมด" และปุ่มกรองเฉพาะที่ยังไม่ได้อ่าน
6. **Member Profile (`/member/profile`):** หน้าดูข้อมูลส่วนตัว แก้ไขเบอร์โทรศัพท์/ที่อยู่ และฟอร์มเปลี่ยนรหัสผ่าน

---

## 10. Librarian Pages
1. **Librarian Dashboard (`/librarian/dashboard`):** แดชบอร์ดสรุปงานประจำวัน (ยอดกำลังยืม, ยืมเกินกำหนด, สต็อกคงเหลือ, คิวจองรอจัดสรร)
2. **Circulation Counter (`/librarian/circulation`):** หน้าทำงานหลักเคาน์เตอร์ยืม-คืน (Fast Barcode Scan สำหรับรหัสสมาชิก และ Barcode หนังสือ)
3. **Book Management (`/librarian/books`):** ตารางแคตตาล็อกหนังสือ ปุ่มเพิ่มหนังสือใหม่ ปุ่มแก้ไข และปุ่มนำทางสู่การจัดการเล่มจริง (`copies`)
4. **Book Copy Management (`/librarian/books/:id/copies`):** ตารางสำเนาเล่มจริงของหนังสือแต่ละเรื่อง เพิ่มสำเนา พิมพ์บาร์โค้ด และปรับสถานะชำรุด/สูญหาย
5. **Category Management (`/librarian/categories`):** ตารางและ Modal จัดการหมวดหมู่หนังสือ
6. **Reservation Management (`/librarian/reservations`):** ตารางจัดการคิวจองหนังสือ และการยืนยันการจัดสรรเล่มเมื่อมีผู้คืน
7. **Fine Management (`/librarian/fines`):** ค้นหารายการค่าปรับ และบันทึกการรับชำระเงินพร้อมออกใบเสร็จย่อ
8. **Member Directory (`/librarian/members`):** ค้นหาสมาชิก ตรวจสอบประวัติการยืม-คืน เพื่อยืนยันตัวตนหน้าเคาน์เตอร์
9. **Librarian Reports (`/librarian/reports`):** รายงานการยืม-คืนตามช่วงเวลา และรายงานหนังสือค้างส่ง

---

## 11. Admin Pages
1. **Admin Dashboard (`/admin/dashboard`):** สถิติระดับบริหาร (สถิติการใช้งานห้องสมุด, สัดส่วนหมวดหมู่หนังสือยอดนิยม, ยอดค่าปรับรวม)
2. **User Management (`/admin/users`):** ตารางรายชื่อผู้ใช้งานทั้งหมด ปุ่มสร้างบัญชี ปรับบทบาท (Member, Librarian, Admin) และปุ่มระงับการใช้งาน
3. **System Settings (`/admin/settings`):** ฟอร์มตั้งค่าพารามิเตอร์ของระบบ (ระยะเวลายืมมาตรฐาน, อัตราค่าปรับต่อวัน, โควตายืมสูงสุด)
4. **Audit Log Viewer (`/admin/audit-logs`):** ตารางตรวจสอบประวัติกิจกรรมความปลอดภัย ค้นหาตาม User, Action, ช่วงวันที่ พร้อมแสดงค่า Before/After JSON

---

## 12. Book & Circulation Detail Pages
- **Book Details Page:** ประกอบด้วย 3 ส่วนย่อย (1) ข้อมูลบรรณานุกรมทั่วไป (2) ตารางสำเนาเล่มจริงและสถานะประจำเล่ม (3) คิวการจองปัจจุบัน
- **Borrowing Detail Modal/Page:** แสดงข้อมูลสมาชิกผู้ยืม, สำเนาเล่มที่ยืม, วันที่ยืม, วันกำหนดส่ง, ประวัติการเปลี่ยนสถานะ, และรายการค่าปรับที่ผูกอยู่

---

## 13. Notification UI Components
- **Topbar Notification Dropdown:** แสดง 5 รายการแจ้งเตือนล่าสุด พร้อมไอคอนแยกตามประเภท (`เตือนส่งคืน`, `หนังสือจองพร้อมรับ`, `ค่าปรับ`) และปุ่มนำทางสู่หน้าศูนย์การแจ้งเตือนเต็มรูปแบบ
- **In-App Toast Notification:** แจ้งเตือนแบบ Pop-up (Alert Snackbar) เมื่อเกิด Action สำเร็จหรือมี Error เกิดขึ้น

---

## 14. Navigation Matrix

| เมนู / หน้าจอ (Page Name) | URL Route | Public | Member | Librarian | Admin | ตำแหน่งการแสดงผล (Nav Location) |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Login** | `/login` | `✓` | `✗` | `✗` | `✗` | Topbar / Direct URL |
| **Book Catalog** | `/catalog` | `✓` | `✓` | `✓` | `✓` | Main Nav / Sidebar |
| **Member Dashboard** | `/member/dashboard` | `✗` | `✓` | `✗` | `✗` | Member Sidebar |
| **My Borrows** | `/member/my-borrows` | `✗` | `✓` | `✗` | `✗` | Member Sidebar |
| **My Reservations** | `/member/my-reservations`| `✗` | `✓` | `✗` | `✗` | Member Sidebar |
| **My Fines** | `/member/my-fines` | `✗` | `✓` | `✗` | `✗` | Member Sidebar |
| **Member Profile** | `/member/profile` | `✗` | `✓` | `✓` | `✓` | Topbar User Menu |
| **Staff Dashboard** | `/librarian/dashboard` | `✗` | `✗` | `✓` | `✓` | Staff Sidebar |
| **Circulation Desk** | `/librarian/circulation`| `✗` | `✗` | `✓` | `✓` | Staff Sidebar |
| **Book Management** | `/librarian/books` | `✗` | `✗` | `✓` | `✓` | Staff Sidebar |
| **Category Management** | `/librarian/categories` | `✗` | `✗` | `✓` | `✓` | Staff Sidebar |
| **Reservation Queue** | `/librarian/reservations`| `✗` | `✗` | `✓` | `✓` | Staff Sidebar |
| **Fine Collection** | `/librarian/fines` | `✗` | `✗` | `✓` | `✓` | Staff Sidebar |
| **Member Directory** | `/librarian/members` | `✗` | `✗` | `✓` | `✓` | Staff Sidebar |
| **Staff Reports** | `/librarian/reports` | `✗` | `✗` | `✓` | `✓` | Staff Sidebar |
| **Admin Dashboard** | `/admin/dashboard` | `✗` | `✗` | `✗` | `✓` | Admin Sidebar |
| **User Management** | `/admin/users` | `✗` | `✗` | `✗` | `✓` | Admin Sidebar |
| **System Settings** | `/admin/settings` | `✗` | `✗` | `✗` | `✓` | Admin Sidebar |
| **Audit Logs** | `/admin/audit-logs` | `✗` | `✗` | `✗` | `✓` | Admin Sidebar |

---

## 15. Page Structure Inventory Table

| Group | Page Name | Route URL | Role | Layout | Main Actions & Components | API Endpoint ที่ใช้ |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Public** | Login | `/login` | Public | `PublicLayout` | ฟอร์มกรอก Login, ปุ่ม Submit | `POST /auth/login` |
| **Public** | Book Catalog | `/catalog` | Public/All | `PublicLayout` | Search Bar, Filter Grid, Book Cards | `GET /books`, `GET /categories` |
| **Public** | Book Details | `/catalog/:id` | Public/All | `PublicLayout` | รูปปก, ข้อมูลหนังสือ, ปุ่มยืม/จอง | `GET /books/:id` |
| **Member** | Dashboard | `/member/dashboard`| Member | `MemberLayout` | Summary Cards, Quick Alert Box | `GET /dashboard/member-summary` |
| **Member** | My Borrows | `/member/my-borrows`| Member | `MemberLayout` | Active Borrows Table, Return History | `GET /borrowings/my-borrows` |
| **Member** | My Reservations | `/member/my-reservations`| Member | `MemberLayout` | Queue Cards, ปุ่มยกเลิกการจอง | `GET /reservations/my-reservations`, `POST /reservations/:id/cancel` |
| **Member** | My Fines | `/member/my-fines` | Member | `MemberLayout` | Fine Summary Table, Status Badges | `GET /fines/my-fines` |
| **Member** | Notifications | `/member/notifications`| Member | `MemberLayout` | Notification List, ปุ่ม Mark Read | `GET /notifications`, `PATCH /notifications/:id/read` |
| **Member** | Profile | `/member/profile` | Member | `MemberLayout` | Profile Form, Password Change Form | `GET /auth/me`, `PUT /members/:id`, `PUT /auth/change-password` |
| **Staff** | Dashboard | `/librarian/dashboard`| Librarian/Admin | `StaffLayout` | Daily Metric Cards, Overdue Tracker | `GET /dashboard/staff-summary` |
| **Staff** | Circulation Desk | `/librarian/circulation`| Librarian/Admin | `StaffLayout` | Member Lookup, Barcode Input, Checkout/Return Table | `POST /borrowings`, `POST /borrowings/:id/return`, `GET /copies/barcode/:barcode` |
| **Staff** | Book List | `/librarian/books` | Librarian/Admin | `StaffLayout` | Data Table, Filter, Add/Edit Button | `GET /books`, `DELETE /books/:id` |
| **Staff** | Book Form (Add/Edit)| `/librarian/books/new` | Librarian/Admin | `StaffLayout` | Form (Title, Author, ISBN, Category) | `POST /books`, `PUT /books/:id` |
| **Staff** | Copy Management | `/librarian/books/:id/copies`| Librarian/Admin | `StaffLayout` | Copies Table, Add Copy Modal | `GET/POST /books/:id/copies`, `PATCH /copies/:id/status` |
| **Staff** | Category List | `/librarian/categories`| Librarian/Admin | `StaffLayout` | Category Table, Add/Edit Modal | `GET/POST/PUT/DELETE /categories` |
| **Staff** | Reservations | `/librarian/reservations`| Librarian/Admin | `StaffLayout` | Queue Management Table | `GET /reservations`, `POST /reservations/:id/cancel` |
| **Staff** | Fines Collection | `/librarian/fines` | Librarian/Admin | `StaffLayout` | Unpaid Fines Table, Pay Modal | `GET /fines`, `POST /fines/:id/pay` |
| **Staff** | Member List | `/librarian/members` | Librarian/Admin | `StaffLayout` | Member Directory Table, View Profile | `GET /members`, `GET /members/:id` |
| **Staff** | Staff Reports | `/librarian/reports` | Librarian/Admin | `StaffLayout` | Date Filter, Report Charts/Tables | `GET /reports/borrow-return`, `GET /reports/overdue-fines` |
| **Admin** | Admin Dashboard | `/admin/dashboard` | Admin | `StaffLayout` | Executive Metrics, System Health | `GET /dashboard/staff-summary` |
| **Admin** | User List | `/admin/users` | Admin | `StaffLayout` | Users Data Table, Role Filter | `GET /users`, `DELETE /users/:id` |
| **Admin** | User Form | `/admin/users/new` | Admin | `StaffLayout` | User Create Form (Role Assignment) | `POST /users`, `PUT /users/:id` |
| **Admin** | System Settings | `/admin/settings` | Admin | `StaffLayout` | Policy Parameters Form | `GET /library_settings`, `PUT /library_settings` |
| **Admin** | Audit Logs | `/admin/audit-logs` | Admin | `StaffLayout` | Security Logs Table, JSON Viewer | `GET /audit-logs` |

---

## 16. Form Specifications

### 16.1 Book Create / Edit Form
- **Fields:**
  - `title` (Text Field, Required, Max 255)
  - `author` (Text Field, Required, Max 255)
  - `isbn` (Text Field, Required, Pattern 10-13 digits)
  - `category_id` (Select Dropdown, Required)
  - `publisher` (Text Field, Optional)
  - `publish_year` (Number Field, Optional, 1900-Current Year)
  - `description` (Multiline Text, Optional)
  - `cover_image_url` (Text URL, Optional)
- **Validation:** แสดงข้อความ Error สีแดงใต้ Field หากกรอกไม่ครบตามเงื่อนไข
- **Success Action:** แสดง Toast Notification "บันทึกข้อมูลหนังสือสำเร็จ" และนำทางกลับสู่ตารางหนังสือ

### 16.2 Circulation Checkout Form (Counter)
- **Fields:**
  - `member_barcode_or_id` (Text Input + Auto Focus / Enter to Submit)
  - `book_copy_barcode` (Text Input + Auto Focus)
- **Behavior:** เมื่อยิงบาร์โค้ด จะแสดง Card ยืนยันข้อมูลสมาชิก (พร้อมสถานะค่าปรับค้างชำระ) และดึงข้อมูลหนังสือเข้าตารางยืมอัตโนมัติ

---

## 17. Table / List Specifications
- **MUI DataGrid / Table Components:**
  - รองรับการจัดเรียงคอลัมน์ (Column Sorting)
  - รองรับการแบ่งหน้า (Pagination: 10, 25, 50 รายการต่อหน้า)
  - มีช่อง Search Box ค้นหาแบบ Realtime
  - มีปุ่ม Filter Drawer สำหรับคัดกรองตามหมวดหมู่/สถานะ
- **Action Buttons ต่อแถว (Row Actions):** แสดงเป็นปุ่มไอคอน (Icon Buttons เช่น `Edit`, `Delete`, `View Details`)
- **Status Chips:** ใช้สีมาตรฐาน MUI (`success` = Available/Paid, `warning` = Pending/Due Soon, `error` = Overdue/Unpaid/Suspended, `info` = Borrowed)

---

## 18. Workflow-to-Page Mapping

| กระบวนการทำงาน (Workflow Step) | หน้าจอที่รองรับ (Page) | บทบาทผู้ใช้งาน | Action ที่เกิดขึ้น |
| :--- | :--- | :--- | :--- |
| **1. ค้นหาและดูหนังสือ** | `/catalog`, `/catalog/:id` | All Users | ค้นหา กรอง ดูรายละเอียดสต็อก |
| **2. ทำรายการยืมหนังสือ** | `/catalog/:id` (Self) หรือ `/librarian/circulation` | Member / Librarian | กดยืม หรือ ยิงบาร์โค้ดยืมที่เคาน์เตอร์ |
| **3. ติดตามวันส่งคืน** | `/member/my-borrows` | Member | ดูวัน Due Date และเวลานับถอยหลัง |
| **4. ทำรายการคืนหนังสือ** | `/librarian/circulation` | Librarian | ยิงบาร์โค้ดรับคืนหนังสือและประเมินค่าปรับ |
| **5. จองหนังสือที่สต็อกหมด** | `/catalog/:id` | Member | กดปุ่ม "จองหนังสือ" เมื่อสต็อกเป็น 0 |
| **6. ติดตามและยกเลิกการจอง** | `/member/my-reservations` | Member | ดูลำดับคิว หรือกดยกเลิกสิทธิ์ |
| **7. รับชำระค่าปรับ** | `/librarian/fines` | Librarian | ค้นหาหนี้และกดยืนยันการรับชำระเงิน |
| **8. เปิดดูข้อความแจ้งเตือน** | Topbar Dropdown / `/member/notifications` | Member | กดเปิดอ่านข้อความเตือนครบกำหนด |

---

## 19. API-to-Page Mapping Matrix

| API Endpoint | หน้าจอ Frontend ที่เรียกใช้งาน (Page) | Trigger Event / UI Action |
| :--- | :--- | :--- |
| `POST /auth/login` | `/login` | กดปุ่ม "เข้าสู่ระบบ" |
| `GET /books` | `/catalog`, `/librarian/books` | โหลดหน้าจอ, เปลี่ยนหน้า Pagination, พิมพ์ค้นหา |
| `GET /books/:id` | `/catalog/:id`, `/librarian/books/:id/edit` | เปิดหน้ารายละเอียดหนังสือ |
| `POST /borrowings` | `/librarian/circulation` | กดยืนยันการยืมหนังสือ |
| `POST /borrowings/:id/return` | `/librarian/circulation` | กดยืนยันการรับคืนหนังสือ |
| `POST /reservations` | `/catalog/:id` | กดปุ่ม "จองหนังสือ" |
| `POST /reservations/:id/cancel` | `/member/my-reservations` | กดยืนยันการยกเลิกคิวจอง |
| `POST /fines/:id/pay` | `/librarian/fines` | กดยืนยันการรับเงินค่าปรับ |
| `GET /notifications` | Topbar & `/member/notifications` | โหลดหน้าจอ หรือกดไอคอนกระดิ่ง |
| `GET /dashboard/staff-summary`| `/librarian/dashboard`, `/admin/dashboard` | เข้าสู่หน้า Dashboard |
| `GET /audit-logs` | `/admin/audit-logs` | โหลดตาราง Audit Logs |

---

## 20. Role-Based UI Controls
- **Route Guard Wrapper (`<ProtectedRoute allowedRoles={['librarian', 'admin']} />`):** สกัดกั้นการเข้าถึง URL ตรงผ่าน Browser หากไม่ได้รับอนุญาตจะ Redirect สู่ `/unauthorized`
- **Conditional UI Rendering:**
  - ซ่อนปุ่ม "จัดการหนังสือ" และ "เมนูเจ้าหน้าที่" ไม่ให้แสดงในหน้าจอของ Member
  - ปุ่ม "ยกเว้นค่าปรับ (Waive)" จะแสดงให้กดได้เฉพาะผู้ใช้งาน Role `Admin` เท่านั้น
  - ซ่อนแถบเมนูผู้ดูแลระบบ (`Users`, `Settings`, `Audit Logs`) หาก Role ไม่ใช่ `Admin`

---

## 21. Loading, Empty, and Error States Guidelines
1. **Loading State:**
   - หน้ารายการ/ตาราง: ใช้ **MUI Skeleton** จำลองโครงสร้างแถวตารางขณะรอข้อมูล
   - ปุ่มกดบันทึก: แสดง **CircularProgress** หมุนในปุ่ม และ Disable ปุ่มเพื่อป้องกัน Double Click
2. **Empty State:**
   - เมื่อไม่พบหนังสือ: แสดงภาพประกอบเวกเตอร์ พร้อมข้อความ *"ไม่พบข้อมูลหนังสือที่ตรงกับคำค้นหา"* และปุ่ม *"ล้างตัวกรอง"*
   - เมื่อไม่มีรายการยืม/จอง/ค่าปรับ: แสดงข้อความเชิงบวก เช่น *"คุณไม่มีรายการหนังสือค้างส่งในขณะนี้"*
3. **Error State:**
   - เกิดข้อผิดพลาดจาก API (Network/Server 500): แสดง **MUI Alert** สีแดงด้านบนหน้าจอ
   - กรณี 404/403: แสดงหน้าจอ Error Page พร้อมปุ่ม *"กลับสู่หน้าหลัก"*

---

## 22. Responsive Design Breakpoints
- **Mobile (`xs`, `< 600px`):** ซ่อน Sidebar เปลี่ยนเป็น Drawer แบบเลื่อนเปิด, ตารางหนังสือปรับเป็น List Card View, Form ปรับเป็นคอลัมน์เดี่ยว
- **Tablet (`sm` & `md`, `600px - 1200px`):** Sidebar แบบย่อไอคอน (Mini Drawer), ตารางข้อมูลแสดงคอลัมน์สำคัญ
- **Desktop (`lg` & `xl`, `> 1200px`):** แสดง Sidebar เต็มรูปแบบ, DataGrid แสดงคอลัมน์ครบถ้วนพร้อม Filter Bar ด้านข้าง

---

## 23. Dashboard UI Design

### 23.1 Member Dashboard (`/member/dashboard`)
- **Metric Cards (4 Cards):**
  1. *หนังสือที่กำลังยืม (Active Borrows)* — ตัวเลขสีน้ำเงิน
  2. *วันครบกำหนดส่งที่ใกล้ที่สุด (Nearest Due Date)* — ตัวเลขและวันที่สีส้ม
  3. *รายการจองที่รอรับ (Available Reservations)* — ตัวเลขสีเขียว
  4. *ยอดค่าปรับค้างชำระ (Unpaid Fines)* — ยอดเงินสีแดง
- **Recent Borrows Table:** ตารางแสดง 3 รายการยืมล่าสุด พร้อมปุ่มกดดูทั้งหมด

### 23.2 Staff / Admin Dashboard (`/librarian/dashboard` & `/admin/dashboard`)
- **Top Metric Cards:** ยอดหนังสือทั้งหมด, สต็อกพร้อมยืม, รายการกำลังยืม, รายการเกินกำหนด, ยอดจองค้าง, ค่าปรับค้างรับ
- **Circulation Analytics:** แผนภูมิแท่งสรุปยอดการยืม-คืนรอบสัปดาห์ / เดือน
- **Urgent Action Box:** รายการหนังสือเกินกำหนดที่ต้องติดตาม และคิวจองที่หนังสือพึ่งส่งคืน

---

## 24. Requirement Traceability Matrix

| Functional Requirement | หน้าจอหลักที่รองรับ (Frontend Page) |
| :--- | :--- |
| **FR-001 ถึง FR-004 (Auth & Access)** | `/login`, `/unauthorized`, Header User Menu |
| **FR-005 ถึง FR-007 (Member Management)** | `/member/profile`, `/librarian/members` |
| **FR-008 ถึง FR-010 (Book Management)** | `/librarian/books`, `/librarian/books/new`, `/librarian/categories` |
| **FR-011 ถึง FR-014 (Book Search)** | `/catalog`, `/catalog/:id` |
| **FR-015 ถึง FR-017 (Borrowing)** | `/librarian/circulation`, `/member/my-borrows` |
| **FR-018 ถึง FR-019 (Returning)** | `/librarian/circulation`, `/member/my-borrows` |
| **FR-020 ถึง FR-022 (Reservation)** | `/catalog/:id`, `/member/my-reservations`, `/librarian/reservations` |
| **FR-023 ถึง FR-025 (Fines)** | `/member/my-fines`, `/librarian/fines` |
| **FR-026 ถึง FR-028 (Notifications)**| Topbar Notification Dropdown, `/member/notifications` |
| **FR-029 ถึง FR-030 (Dashboard)** | `/member/dashboard`, `/librarian/dashboard`, `/admin/dashboard` |
| **FR-031 ถึง FR-032 (Reports)** | `/librarian/reports`, `/admin/reports` |
| **FR-033 ถึง FR-034 (Admin & Audit)** | `/admin/users`, `/admin/settings`, `/admin/audit-logs` |

---

## 25. Open Questions (ประเด็นหน้าจอที่ต้องการการยืนยัน)

| ID | ประเด็นคำถามด้านหน้าจอ UI | หน้าจอที่ได้รับผลกระทบ | ผลกระทบ | ลำดับความสำคัญ |
| :--- | :--- | :--- | :---: | :---: |
| **OQ-FE-001** | ในหน้าแคตตาล็อกหนังสือ (`/catalog`) ต้องการให้แสดงผลเริ่มต้นเป็น Grid Card รูปปก หรือแสดงเป็น Table View? | `/catalog` | Low | Medium |
| **OQ-FE-002** | การเปิดฟอร์มแก้ไขข้อมูล (เช่น แก้ไขหนังสือ/แก้ไขสมาชิก) ต้องการให้เป็นหน้า URL แยก หรือเปิดเป็น Modal/Drawer ทับหน้าจอเดิม? | `/librarian/books`, `/admin/users` | Medium | Medium |
| **OQ-FE-003** | หน้าจอรายงาน (`/librarian/reports`) ในเฟสแรกต้องการแผนภูมิสถิติ (Charts) ด้วยหรือไม่ หรือแสดงเฉพาะตารางสรุปข้อมูลตัวเลข? | `/librarian/reports` | Low | Low |

---

## 26. Assumptions
1. ผู้ใช้งานส่วนใหญ่จะเข้าใช้งานผ่านเว็บเบราว์เซอร์มาตรฐาน (Chrome, Edge, Safari, Firefox)
2. ไอคอนและชุด UI ทั้งหมดจะใช้มาตรฐาน **MUI Icons (@mui/icons-material)**
3. ไม่มีการใช้ CSS Framework อื่น (เช่น TailwindCSS) เพื่อรักษาความเสถียรและความเข้ากันได้ของ MUI 5

---

## 27. Risks & Mitigation Strategies
- **ความเสี่ยงหน้าจอกระตุกเมื่อข้อมูลมีขนาดใหญ่:** ใช้ Server-Side Pagination และ Virtualized Table (MUI DataGrid) ในตารางขนาดใหญ่
- **ความเสี่ยง State ไม่ Sync เมื่อมีการยืม-คืน:** จัดการเคลียร์ Cache หรือสั่ง Re-fetch ข้อมูลใหม่ทุกครั้งที่ Action สำเร็จ
- **ความเสี่ยงผู้ใช้กดซ้ำขณะรอ Request (Double Submit):** ปิดการทำงานของปุ่ม (Disabled) และแสดง Loading Spinner ทุกครั้งระหว่างประมวลผล

---

## 28. Validation Checklist Report
- [x] **อ่านเอกสาร `01` ถึง `06` ครบถ้วน:** สอดคล้องกับ Requirements, Roles, Workflows, Database Schema และ API Contract
- [x] **หน้าจอครบถ้วนทุกฟังก์ชัน:** 24 หน้าจอหลักครอบคลุม Public, Member, Librarian, Admin
- [x] **Routing & Layout ชัดเจน:** กำหนดโครงสร้าง `PublicLayout`, `MemberLayout`, `StaffLayout` และ Protected Route Guards
- [x] **Form & Table Specifications ระบุชัดเจน:** กำหนดฟิลด์ คอลัมน์ เงื่อนไขการตรวจสอบ และ Row Actions
- [x] **Role-Based UI ครบ:** กำหนดการซ่อน/แสดงปุ่มและสิทธิ์เข้าถึงเมนูอย่างรัดกุม
- [x] **Loading, Empty, Error States ระบุครบ:** ออกแบบ Skeleton, Empty State และ Alert Box
- [x] **API & Workflow Mapping ครบ:** ผูกโยงทุกหน้าจอเข้ากับ 42 API Endpoints
- [x] **ไม่มี React/JSX Code หรือ CSS Code:** เป็น UI/Frontend Architecture Specification
- [x] **ไม่มี Feature ใหม่ / ไม่เปลี่ยน Tech Stack:** ยึดตาม React 18 + Vite 5 + MUI 5

---

## 29. Summary
เอกสาร **Frontend Page Structure & UI Specification** ฉบับนี้ได้กำหนดโครงสร้างหน้าจอทั้งหมด 24 หน้าจอหลัก ครอบคลุม 4 มุมมองผู้ใช้งาน พร้อมทั้งออกแบบ Navigation Matrix, การผูกโยงกับ REST API Endpoints, ระบบป้องกันสิทธิ์เส้นทาง (Route Guards), และมาตรฐาน State Handling ไว้อย่างครบถ้วนตามหลักการ Modern React Architecture เอกสารนี้พร้อมนำไปใช้เป็นรากฐานสำหรับ **Planning Step 8: Dashboard, Report & Notification Design (`08-dashboard-report-notification.md`)** ต่อไป
