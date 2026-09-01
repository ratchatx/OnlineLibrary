# Dashboard, Report & Notification Specification: Online Library Management System

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `08-dashboard-report-notification.md`  
**Phase:** Phase 1 — Planning Only (Step 8: Dashboard, Report & Notification Design)  
**Status:** Under Review  
**Date:** 2026-08-28  

---

## 1. Purpose
เอกสารฉบับนี้จัดทำขึ้นเพื่อกำหนดโครงสร้างตัวชี้วัด (Metrics & KPIs), การออกแบบส่วนแสดงผลสถิติภาพรวม (Dashboards), รายงานสรุปเชิงปฏิบัติการและเชิงบริหาร (Reports), และระบบการแจ้งเตือนเหตุการณ์สำคัญ (Notification & Alert System) สำหรับ **Online Library Management System** โดยสอดคล้องกับข้อกำหนดความต้องการ (Requirements), สิทธิ์การเข้าถึง (Roles & Permissions), ผังกระบวนการทำงาน (Workflows), ฐานข้อมูล (Database Schema), สัญญา API (API Contract), และโครงสร้างหน้าจอ (Frontend Pages) เพื่อให้ทีมพัฒนาและ AI สามารถนำไปพัฒนาฟังก์ชันการวิเคราะห์ข้อมูลและการแจ้งเตือนได้อย่างแม่นยำ

---

## 2. Reference Documents
เอกสารที่ใช้อ้างอิงร่วมในการออกแบบ:
1. `docs/planning/01-system-overview.md` — วัตถุประสงค์และขอบเขตระบบ
2. `docs/planning/02-requirements.md` — ข้อกำหนดความต้องการ (`FR-026` ถึง `FR-032`)
3. `docs/planning/03-roles-permissions.md` — การควบคุมการเข้าถึงข้อมูลตามบทบาท (RBAC)
4. `docs/planning/04-library-workflow.md` — วงจรสถานะการยืม-คืน-จอง และเงื่อนไขการแจ้งเตือน
5. `docs/planning/05-database-design.md` — โครงสร้างตาราง `borrowings`, `reservations`, `fines`, `notifications`
6. `docs/planning/06-api-contract.md` — Endpoints `/dashboard/*`, `/reports/*`, `/notifications/*`
7. `docs/planning/07-frontend-pages.md` — หน้าจอ Dashboard, Reports, และ Notification Center

---

## 3. Dashboard Overview
ระบบแดชบอร์ดถูกออกแบบมาเพื่อสรุปข้อมูลสำคัญแบบ Realtime ให้แก่ผู้ใช้งานแต่ละกลุ่ม เพื่อตอบคำถามทางธุรกิจและช่วยในการตัดสินใจ:
- **Member:** ช่วยให้สมาชิกรับรู้สถานะการยืม วันครบกำหนดส่ง และยอดค่าปรับของตนเองได้ทันที
- **Librarian:** ช่วยให้เจ้าหน้าที่ติดตามภาระงานประจำวัน หนังสือค้างส่ง คิวจองที่ต้องจัดสรร และสถานะสต็อกหนังสือ
- **Admin:** ช่วยให้ผู้บริหารมองเห็นภาพรวมการใช้งานห้องสมุด สัดส่วนทรัพยากร และสถิติแนวโน้มการเติบโต

---

## 4. Role-Based Dashboard Architecture

```text
[ Online Library Dashboards ]
  │
  ├── 1. Member Dashboard (/member/dashboard)
  │    ├── Personalized Metric Cards (กำลังยืม, เตือนครบกำหนด, คิวจองพร้อมรับ, ค่าปรับค้างชำระ)
  │    ├── Urgent Action Banner (หนังสือใกล้ครบกำหนด / เกินกำหนด)
  │    └── Recent Borrowing Activity Table
  │
  ├── 2. Librarian Dashboard (/librarian/dashboard)
  │    ├── Operational Metric Cards (หนังสือทั้งหมด, สต็อกว่าง, ยอดกำลังยืม, ยอดเกินกำหนด, คิวจองค้าง)
  │    ├── Circulation Bar Chart (แนวโน้มการยืม-คืนรอบสัปดาห์)
  │    ├── Overdue Action List (ตารางหนังสือค้างส่งที่ต้องติดตาม)
  │    └── Reserved Ready Queue (คิวจองที่หนังสือพึ่งถูกส่งคืน)
  │
  └── 3. Admin Executive Dashboard (/admin/dashboard)
       ├── Executive Metric Cards (จำนวนสมาชิก, หนังสือทั้งหมด, ยอดการยืมสะสม, ยอดค่าปรับรวม)
       ├── Category Distribution Pie Chart (สัดส่วนหนังสือและการยืมแยกตามหมวดหมู่)
       ├── Monthly Circulation Trend Line Chart (แนวโน้มการเติบโตรายเดือน)
       └── System Activity Log Summary
```

---

## 5. Dashboard Cards (KPI Metrics)

| รหัส KPI | ชื่อการ์ด (Card Name) | คำอธิบายและความหมาย | แหล่งข้อมูล (Data Source) | วิธีการคำนวณ (Calculation Logic) | บทบาทที่มองเห็น (Roles) |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **KPI-01** | **หนังสือที่กำลังยืม (Active Borrows)** | จำนวนเล่มที่สมาชิกกำลังถือครองในปัจจุบัน | `borrowings` | `COUNT(*) WHERE member_id = :me AND status = 'borrowed'` | Member |
| **KPI-02** | **ใกล้ครบกำหนดส่ง (Due Soon)** | วันครบกำหนดส่งที่ใกล้ที่สุดของสมาชิก | `borrowings` | `MIN(due_date) WHERE member_id = :me AND status = 'borrowed'` | Member |
| **KPI-03** | **หนังสือจองพร้อมรับ (Ready to Claim)**| จำนวนหนังสือจองที่ส่งคืนแล้วและถึงคิวรับ | `reservations` | `COUNT(*) WHERE member_id = :me AND status = 'available'` | Member |
| **KPI-04** | **ค่าปรับค้างชำระ (Unpaid Fines)** | ยอดเงินค่าปรับที่ยังไม่ได้ชำระของสมาชิก | `fines` | `SUM(amount) WHERE member_id = :me AND status = 'unpaid'` | Member |
| **KPI-05** | **จำนวนหนังสือทั้งหมด (Total Books)** | จำนวนรายการหนังสือและสำเนาทั้งหมดในระบบ | `books`, `book_copies` | `SUM(total_copies) FROM books WHERE deleted_at IS NULL` | Librarian, Admin |
| **KPI-06** | **สต็อกพร้อมยืม (Available Copies)** | จำนวนสำเนาหนังสือที่พร้อมให้บริการยืม | `books`, `book_copies` | `SUM(available_copies) FROM books WHERE deleted_at IS NULL` | Librarian, Admin |
| **KPI-07** | **ยอดกำลังยืมรวม (Total Active Borrows)**| จำนวนหนังสือที่ถูกยืมออกไปทั้งหมดในขณะนี้ | `borrowings` | `COUNT(*) WHERE status = 'borrowed'` | Librarian, Admin |
| **KPI-08** | **ยอดเกินกำหนดส่ง (Overdue Count)** | จำนวนรายการยืมที่พ้น Due Date และยังไม่คืน | `borrowings` | `COUNT(*) WHERE status = 'overdue'` | Librarian, Admin |
| **KPI-09** | **ยอดคิวจองที่รอหนังสือ (Pending Reserves)**| จำนวนคิวการจองที่รอหนังสือส่งคืน | `reservations` | `COUNT(*) WHERE status = 'pending'` | Librarian, Admin |
| **KPI-10** | **ยอดสมาชิกทั้งหมด (Total Members)** | จำนวนสมาชิกห้องสมุดที่มีสถานะ Active | `members` | `COUNT(*) WHERE membership_status = 'active'` | Librarian, Admin |
| **KPI-11** | **ยอดค่าปรับค้างชำระรวม (Total Unpaid Fines)**| ยอดเงินค่าปรับรวมทั้งระบบที่ยังไม่ได้รับชำระ | `fines` | `SUM(amount) WHERE status = 'unpaid'` | Librarian, Admin |

---

## 6. Dashboard Charts (Data Visualization)

| รหัส Chart | ชื่อแผนภูมิ (Chart Name) | ประเภท (Type) | แกน X / มิติ | แกน Y / ค่า | แหล่งข้อมูล | วัตถุประสงค์และการกรอง | บทบาท |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **CHART-01** | **Circulation Weekly Trend** | Bar Chart | วันในสัปดาห์ (จ.-อา.) | จำนวนเล่ม (ยืม / คืน) | `borrowings` | เปรียบเทียบยอดการยืมและการคืนในรอบ 7 วันล่าสุด | Librarian, Admin |
| **CHART-02** | **Top 5 Borrowed Books** | Horizontal Bar | รายชื่อหนังสือ | จำนวนครั้งที่ถูกยืม | `borrowings`, `books` | แสดง 5 อันดับหนังสือยอดนิยม (กรองตามเดือน/ปีได้) | Librarian, Admin |
| **CHART-03** | **Category Distribution** | Donut / Pie Chart | ชื่อหมวดหมู่หนังสือ | สัดส่วนจำนวนเล่ม (%) | `books`, `book_categories`| สัดส่วนทรัพยากรหนังสือตามหมวดหมู่วิชาการ | Admin |
| **CHART-04** | **Monthly Circulation Growth** | Line Chart | เดือน (ม.ค. - ธ.ค.) | ยอดการยืมสะสม | `borrowings` | วิเคราะห์แนวโน้มการเติบโตของการใช้บริการรายเดือน | Admin |

---

## 7. Dashboard Tables (Actionable Summary Tables)

### 7.1 Urgent Overdue Borrowings Table (Librarian Dashboard)
- **วัตถุประสงค์:** แสดงรายการหนังสือค้างส่งเกินกำหนด เพื่อให้เจ้าหน้าที่สามารถติดตามได้ทันที
- **Columns:** รหัสรายการ (`borrowing_code`), ชื่อสมาชิก (`member_name`), เบอร์โทร (`phone`), ชื่อหนังสือ (`book_title`), วันครบกำหนด (`due_date`), จำนวนวันเกิน (`overdue_days`), ยอดค่าปรับสะสม (`fine_amount`)
- **Row Action:** ปุ่มกด *"ดูรายละเอียด"* หรือ *"ติดต่อสมาชิก"*

### 7.2 Reserved Books Ready for Pickup (Librarian Dashboard)
- **วัตถุประสงค์:** แสดงคิวจองที่หนังสือถูกส่งคืนแล้วและรอสมาชิกมารับ
- **Columns:** รหัสการจอง (`reservation_code`), ผู้จอง (`member_name`), ชื่อหนังสือ (`book_title`), บาร์โค้ดเล่มที่ล็อค (`barcode`), วันหมดสิทธิ์รับ (`hold_until_date`)
- **Row Action:** ปุ่ม *"ยืนยันการรับหนังสือ"* หรือ *"สละสิทธิ์ให้คิวถัดไป"*

### 7.3 Recent User Borrows Table (Member Dashboard)
- **วัตถุประสงค์:** แสดงรายการยืม 3-5 รายการล่าสุดของสมาชิก พร้อมเวลานับถอยหลังสู่วัน Due Date
- **Columns:** ชื่อหนังสือ (`book_title`), วันที่ยืม (`borrow_date`), วันครบกำหนดส่ง (`due_date`), สถานะ (`status chip`)

---

## 8. Dashboard Filters
- **Date Preset Filter:** เลือกช่วงเวลาแสดงผล (`Today`, `Last 7 Days`, `This Month`, `This Year`)
- **Category Filter:** เลือกดูสถิติเจาะจงเฉพาะหมวดหมู่หนังสือ
- **Status Filter:** กรองดูเฉพาะรายการที่ `Active`, `Overdue`, หรือ `Resolved`

---

## 9. Dashboard Drill-Down Mapping

```text
[ Dashboard Metric Card ] ────────► [ รายการกรองในหน้ารายการหลัก ] ────────► [ หน้ารายละเอียด ]
- Total Books Card                 -> /librarian/books                     -> /catalog/:id
- Overdue Books Card               -> /librarian/circulation (Tab Overdue) -> Borrowing Detail Modal
- Pending Reservations Card        -> /librarian/reservations              -> Reservation Detail
- Outstanding Fines Card           -> /librarian/fines (Tab Unpaid)        -> Fine Payment Modal
- Member My Borrows Card           -> /member/my-borrows                   -> Borrowing Timeline
```

---

## 10. Reports Overview
ระบบรายงานถูกออกแบบมาเพื่อสนับสนุนการบริหารจัดการ การตรวจสอบบัญชี และการสรุปผลการดำเนินงานห้องสมุด โดยแบ่งออกเป็น 5 รายงานหลัก:
1. **Borrowing & Return Transaction Report:** รายงานธุรกรรมการยืม-คืนตามช่วงเวลา
2. **Overdue & Fine Summary Report:** รายงานหนังสือค้างส่งและยอดการจัดเก็บค่าปรับ
3. **Book Inventory & Circulation Report:** รายงานสถิติทรัพยากรหนังสือและอัตราการหมุนเวียน
4. **Reservation Performance Report:** รายงานประสิทธิภาพการให้บริการหนังสือจอง
5. **Member Activity & Penalty Report:** รายงานสถิติการใช้งานและประวัติการถูกระงับสิทธิ์ของสมาชิก

---

## 11. Report Specifications

| รหัสรายงาน | ชื่อรายงาน (Report Name) | วัตถุประสงค์ | สิทธิ์เข้าถึง | ตัวกรองหลัก (Filters) | คอลัมน์สำคัญ (Key Columns) |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **RPT-01** | **รายงานการยืม-คืนประจำงวด** | สรุปยอดการยืมและรับคืนหนังสือเพื่อดูปริมาณงาน | Librarian, Admin | `date_from`, `date_to`, `category_id` | วันที่, รหัสยืม, สมาชิก, หนังสือ, วันยืม, วันคืนจริง, เจ้าหน้าที่ผู้รับ |
| **RPT-02** | **รายงานค้างส่งและค่าปรับ** | ตรวจสอบทรัพย์สินที่ยังไม่ส่งคืนและยอดเงินค่าปรับ | Librarian, Admin | `date_from`, `date_to`, `status (unpaid/paid)` | รหัสยืม, สมาชิก, หนังสือ, วันครบกำหนด, วันเกิน, ยอดค่าปรับ, สถานะการชำระ |
| **RPT-03** | **รายงานสถิติหนังสือยอดนิยม** | วิเคราะห์ความต้องการในการอ่านเพื่อจัดซื้อหนังสือ | Librarian, Admin | `period`, `category_id`, `limit` | อันดับ, ISBN, ชื่อหนังสือ, หมวดหมู่, จำนวนครั้งที่ยืม, ยอดจองรวม |
| **RPT-04** | **รายงานการจองหนังสือ** | ตรวจสอบระยะเวลารอคอยและคิวการจอง | Librarian, Admin | `date_from`, `date_to`, `status` | รหัสจอง, สมาชิก, หนังสือ, วันจอง, วันได้รับ, ระยะเวลารอ (วัน), สถานะคิว |
| **RPT-05** | **รายงานสถิติสมาชิกห้องสมุด** | สรุปจำนวนสมาชิกและการกระจายตัวของสมาชิก | Admin | `status`, `registered_from`, `registered_to` | รหัสสมาชิก, ชื่อ-นามสกุล, วันที่สมัคร, ยอดการยืมสะสม, ยอดค่าปรับสะสม, สถานะ |

---

## 12. Report Export Capabilities
- **Export Formats ที่รองรับ:** ในเฟสนี้รองรับการส่งออกข้อมูลในรูปแบบ **CSV (Comma-Separated Values)** ผ่าน Client-Side Data Export บน MUI DataGrid
- **Candidate Export Format (รอการยืนยัน):** รูปแบบ PDF สำหรับพิมพ์ใบสรุปยอดรายเดือน *(ระบุเป็น Open Question)*
- **Security Constraint:** การ Export ข้อมูลสมาชิกจะถูกจำกัดเฉพาะ Role `Admin` เท่านั้น เพื่อป้องกันการรั่วไหลของข้อมูลส่วนบุคคล (PII)

---

## 13. Notification System Architecture
ระบบการแจ้งเตือนเน้นการสื่อสารแบบ **In-App Notifications** ภายในเว็บแอปพลิเคชัน เพื่อแจ้งเตือนเหตุการณ์สำคัญเกี่ยวกับหนังสือของสมาชิกอย่างทันท่วงที:

```text
[ System Event / Trigger ]
           │
           ▼
[ Notification Engine (Backend) ]
           │
           ▼
[ Insert Record to `notifications` Table ]
           │
           ├────────────────────────────────────────┐
           ▼                                        ▼
[ Topbar Unread Badge Counter ]           [ Notification Center View ]
  (แสดงตัวเลขสีแดงบนกระดิ่ง)                  (/member/notifications)
```

---

## 14. Notification Rules & Matrix

| Event ID | เหตุการณ์กระตุ้น (Trigger Event) | ผู้รับ | Channel | หัวข้อข้อความ (Notification Title) | ลำดับความสำคัญ | เงื่อนไขการส่ง (Conditions) |
| :--- | :--- | :---: | :---: | :--- | :---: | :--- |
| **NOTIF-01** | ยืมหนังสือสำเร็จ | Member | In-App | ยืมหนังสือสำเร็จ | Normal | สร้างทันทีเมื่อ Borrow Status = `borrowed` |
| **NOTIF-02** | เตือนก่อนครบกำหนดส่ง 1-2 วัน | Member | In-App | แจ้งเตือน: ใกล้ครบกำหนดส่งหนังสือ | High | Scheduled Job ตรวจพบ `due_date - today <= 2` |
| **NOTIF-03** | หนังสือเกินกำหนดส่ง (Overdue) | Member | In-App | ด่วน: หนังสือเกินกำหนดส่งแล้ว | Urgent | Scheduled Job ตรวจพบ `today > due_date` |
| **NOTIF-04** | หนังสือจองพร้อมให้ยืม | Member | In-App | หนังสือที่ท่านจองพร้อมให้ยืมแล้ว | High | มีการคืนหนังสือและถึงคิวแรก (`status = available`) |
| **NOTIF-05** | คิวการจองหมดอายุ | Member | In-App | สิทธิ์การจองหนังสือหมดอายุ | Normal | พ้นกำหนดวันรับหนังสือ (`today > hold_until_date`) |
| **NOTIF-06** | บันทึกค่าปรับ | Member | In-App | แจ้งเตือนรายการค่าปรับค้างชำระ | High | เกิดรายการคืนล่าช้า (`status = unpaid`) |
| **NOTIF-07** | บันทึกชำระค่าปรับสำเร็จ | Member | In-App | บันทึกการชำระค่าปรับเรียบร้อยแล้ว | Normal | เจ้าหน้าที่กดยืนยันรับเงิน (`status = paid`) |

---

## 15. Due Date & Overdue Scheduled Alert Rules

| Scheduled Alert Rule | ความถี่ในการตรวจสอบ (Frequency) | เงื่อนไขการตรวจจับ (Detection Query) | ผู้รับข้อความ | การป้องกันส่งซ้ำ (Deduplication Logic) |
| :--- | :--- | :--- | :---: | :--- |
| **Due Soon Alert** | ทุกวัน เวลา 07:00 น. | รายการยืม `status = 'borrowed'` และ `due_date = today + 1 day` | Member | ตรวจสอบว่าไม่มี Notification ประเภทนี้สำหรับ Borrowing ID นี้ในรอบ 24 ชม. |
| **Overdue Daily Alert**| ทุกวัน เวลา 08:00 น. | รายการยืม `status = 'overdue'` และยังไม่คืน | Member | ส่งแจ้งเตือนซ้ำทุก 3 วันจนกว่าจะมีการส่งคืนหนังสือ |
| **Hold Expiry Alert** | ทุกชั่วโมง | รายการจอง `status = 'available'` และ `hold_until_date < now()` | Member | ปรับสถานะการจองเป็น `expired` และส่งข้อความแจ้งเตือนทันที |

---

## 16. Notification Center UI Specification
- **Notification Dropdown (Topbar):** แสดง 5 รายการล่าสุด, ไอคอนสถานะ, เวลาผ่านมา (เช่น "2 ชั่วโมงที่แล้ว"), ปุ่ม *"ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"*
- **Full Notification Page (`/member/notifications`):** ตาราง/รายการข้อความทั้งหมด, ตัวกรอง (`ทั้งหมด`, `ยังไม่ได้อ่าน`, `การยืม-คืน`, `การจอง`, `ค่าปรับ`), ปุ่มลบข้อความเก่า

---

## 17. Notification Lifecycle State Machine

```text
[ Event Triggered ] ──► [ สร้าง Notification สถานะ "Unread" (is_read = false) ]
                                      │
                                      ▼
                        [ สมาชิกกดเปิดอ่านข้อความ / กด Mark as Read ]
                                      │
                                      ▼
                          [ ปรับสถานะเป็น "Read" (is_read = true, read_at = NOW()) ]
```

---

## 18. Scheduled Background Job Architecture (Concept)
- **Job Engine:** Node.js Scheduled Task / Cron Runner ในฝั่ง Backend Service
- **Execution Cycle:**
  - `Daily 00:01 น.` : ปรับสถานะรายการยืมที่พ้น Due Date ให้เป็น `overdue` ในฐานข้อมูล
  - `Daily 07:00 น.` : ส่ง Due Date Reminder Notifications
  - `Daily 08:00 น.` : ส่ง Overdue Notifications
  - `Hourly` : ตรวจสอบคิวจองที่หมดอายุ (`Expired Reservations`) และจัดสรรให้คิวถัดไป

---

## 19. API Mapping Matrix

| Dashboard / Report / Notification Function | API Module | Endpoint | HTTP Method | Allowed Roles |
| :--- | :--- | :--- | :---: | :---: |
| **Staff Dashboard Summary** | `Dashboard` | `/api/v1/dashboard/staff-summary` | `GET` | Librarian, Admin |
| **Member Dashboard Summary** | `Dashboard` | `/api/v1/dashboard/member-summary` | `GET` | Member |
| **Circulation Report** | `Reports` | `/api/v1/reports/borrow-return` | `GET` | Librarian, Admin |
| **Overdue & Fine Report** | `Reports` | `/api/v1/reports/overdue-fines` | `GET` | Librarian, Admin |
| **Popular Books Report** | `Reports` | `/api/v1/reports/popular-books` | `GET` | Librarian, Admin |
| **Get User Notifications** | `Notifications` | `/api/v1/notifications` | `GET` | All (Own) |
| **Mark Notification as Read** | `Notifications` | `/api/v1/notifications/:id/read` | `PATCH` | All (Own) |
| **Mark All Notifications Read**| `Notifications` | `/api/v1/notifications/read-all` | `PATCH` | All (Own) |

---

## 20. Database Mapping Matrix

| KPI / Report / Notification Entity | ตารางฐานข้อมูลที่เกี่ยวข้อง (Tables) | ฟิลด์สำคัญที่ใช้ประมวลผล (Key Fields) |
| :--- | :--- | :--- |
| **Book & Stock Metrics** | `books`, `book_copies` | `total_copies`, `available_copies`, `status` |
| **Borrowing & Overdue Metrics** | `borrowings` | `borrow_date`, `due_date`, `return_date`, `status` |
| **Reservation Queue Metrics** | `reservations` | `queue_number`, `status`, `hold_until_date` |
| **Fine & Payment Metrics** | `fines` | `amount`, `overdue_days`, `status`, `paid_at` |
| **Notification Storage** | `notifications` | `user_id`, `type`, `title`, `message`, `is_read`, `read_at` |
| **Audit Tracking** | `audit_logs` | `user_id`, `action`, `entity_name`, `created_at` |

---

## 21. Frontend Page Mapping Matrix

| Component / Function | หน้าจอหลักใน Frontend (Frontend Page) | ตำแหน่งการจัดวาง (Placement) |
| :--- | :--- | :--- |
| **Member Metric Cards** | `/member/dashboard` | แถวบนสุดของหน้า Dashboard |
| **Staff Metric Cards** | `/librarian/dashboard`, `/admin/dashboard` | แถวบนสุดของหน้า Dashboard |
| **Circulation Charts** | `/librarian/dashboard`, `/admin/dashboard` | ส่วนกลางหน้า Dashboard |
| **Overdue Action List** | `/librarian/dashboard` | ส่วนล่างหน้า Dashboard |
| **Notification Bell Dropdown** | `Topbar Navigation` (All Protected Layouts) | ขวาบนแถบ Header |
| **Notification Center Page** | `/member/notifications` | หน้ารายการข้อความเต็มรูปแบบ |
| **Staff Report Viewer** | `/librarian/reports` | หน้ารายงานสถิติการดำเนินงาน |
| **Admin Executive Reports** | `/admin/reports` | หน้ารายงานสรุปเชิงบริหาร |

---

## 22. Role-Based Data Visibility & Security Matrix

| ข้อมูล / รายงาน / สถิติ (Data Entity) | Member | Librarian | Admin |
| :--- | :---: | :---: | :---: |
| **สถิติส่วนตัว (Personal Metrics)** | `Full (Own)` | `N/A` | `N/A` |
| **สถิติภาพรวมห้องสมุด (Library Metrics)** | `✗` | `Full` | `Full` |
| **รายงานการยืม-คืนประจำงวด** | `✗` | `Full` | `Full` |
| **รายงานหนี้ค่าปรับและหนังสือค้างส่ง** | `✗` | `Full` | `Full` |
| **รายงานข้อมูลสมาชิกเชิงลึก** | `✗` | `Operational Only` | `Full` |
| **ประวัติ Audit Security Logs** | `✗` | `✗` | `Full` |
| **ข้อความแจ้งเตือนส่วนบุคคล** | `Full (Own)` | `Full (Own)` | `Full (Own)` |

---

## 23. Performance Optimization Strategies
1. **Aggregated Indexing:** ใช้งาน Composite Indexes ในฐานข้อมูล เช่น `borrowings(status, due_date)` และ `fines(status, amount)` เพื่อให้ Query แดชบอร์ดประมวลผลได้รวดเร็วระดับมิลลิวินาที
2. **Scheduled Pre-calculation:** ในกรณีที่ระบบมีข้อมูลขนาดใหญ่ในอนาคต สามารถตั้ง Scheduled Job สรุปยอดสถิติรายวันลงตาราง Cache ได้
3. **Client-Side Data Virtualization:** ตารางรายงานขนาดใหญ่ใช้ MUI DataGrid Pagination เพื่อป้องกันเบราว์เซอร์ค้าง

---

## 24. Gaps Analysis & Verification

### 24.1 API Gaps
- **สถานะ:** ไม่มี API Gaps — Endpoints ใน `06-api-contract.md` (`/dashboard/*`, `/reports/*`, `/notifications/*`) ครอบคลุมการทำงานของ Dashboard, Reports, และ Notifications ครบถ้วน 100%

### 24.2 Database Gaps
- **สถานะ:** ไม่มี Database Gaps — โครงสร้างตารางใน `05-database-design.md` มีฟิลด์รองรับการคำนวณ Metrics ทุกตัวอย่างสมบูรณ์

### 24.3 Frontend Gaps
- **สถานะ:** ไม่มี Frontend Gaps — หน้าจอใน `07-frontend-pages.md` มีหน้ารองรับครบทุกมุมมอง

---

## 25. Open Questions (ประเด็นที่ต้องการการยืนยัน)

| ID | ประเด็นคำถาม | ส่วนที่ได้รับผลกระทบ | ผลกระทบ | ลำดับความสำคัญ |
| :--- | :--- | :--- | :---: | :---: |
| **OQ-DASH-001** | การส่งออกรายงาน (Report Export) ในเฟสแรกต้องการรองรับไฟล์ PDF ด้วยหรือไม่ หรือส่งออกเป็น CSV เท่านั้น? | Reports | Low | Medium |
| **OQ-DASH-002** | ข้อความแจ้งเตือนเตือนก่อนครบกำหนด (Due Soon Alert) ควรกำหนดส่งล่วงหน้า 1 วัน หรือ 2 วัน? | Scheduled Notifications | Low | Medium |
| **OQ-DASH-003** | แดชบอร์ดของ Admin ต้องการดูสถิติแยกตามสาขา (Multi-Branch) หรือไม่? *(ปัจจุบันระบบเป็น Single Library)* | Admin Dashboard | Low | Low |

---

## 26. Assumptions
1. การแจ้งเตือนทั้งหมดจะส่งผ่านช่องทาง In-App Notifications ภายในระบบเว็บแอปพลิเคชันเป็นหลัก
2. ข้อมูลสถิติบน Dashboard จะถูกประมวลผลแบบ On-demand Query จากฐานข้อมูล MySQL 8 โดยตรง
3. Timezone สำหรับการบันทึกและคำนวณวันเวลานับตามเวลามาตรฐานประเทศไทย (`Asia/Bangkok` / UTC+7)

---

## 27. Risks & Mitigation Strategies
- **ความเสี่ยง Query แดชบอร์ดดึงข้อมูลช้าเมื่อตารางยืมมีขนาดใหญ่:** ป้องกันด้วยการทำ Index บน `status` และ `due_date`
- **ความเสี่ยงการส่ง Notification ซ้ำซ้อน:** ป้องกันโดยการตรวจสอบ Record การแจ้งเตือนเดิมในตารางก่อนสร้างข้อความใหม่ทุกครั้ง

---

## 28. Validation Checklist Report
- [x] **อ่านเอกสาร Planning `01` ถึง `07` ครบถ้วน:** สอดคล้องกับ Requirements, Roles, Workflows, Database, API, และ Frontend
- [x] **Dashboard ครบตาม Requirements:** มี Dashboard สำหรับ Member, Librarian, Admin ชัดเจน
- [x] **KPIs มีสูตรและ Data Source ชัดเจน:** กำหนดวิธีคำนวณครบ 11 ตัวชี้วัดหลัก
- [x] **Charts & Tables ระบุข้อมูลครบ:** มีแผนภูมิ 4 แบบ และตารางสรุปงานเร่งด่วน 3 ตาราง
- [x] **Reports ครอบคลุม 5 รายงานหลัก:** กำหนดตัวกรอง คอลัมน์ และสิทธิ์เข้าถึงครบถ้วน
- [x] **Notification Rules & Lifecycle สมบูรณ์:** มีกฎการแจ้งเตือน 7 เหตุการณ์หลัก และกฎ Scheduled Alerts
- [x] **API, Database, Frontend Mapping ครบ:** ผูกโยงครบถ้วน ปราศจาก Gaps
- [x] **ไม่มี Code / SQL / Cron Implementation:** เป็นเอกสารออกแบบสถาปัตยกรรมและข้อกำหนดเชิงฟังก์ชัน
- [x] **ไม่มี Feature นอก Scope:** ปราศจากระบบภายนอกที่ไม่ได้รับอนุมัติ (SMS/Payment Gateway)

---

## 29. Summary
เอกสาร **Dashboard, Report & Notification Specification** ฉบับนี้ได้กำหนดโครงสร้างตัวชี้วัด 11 KPIs, แดชบอร์ด 3 มุมมอง, รายงานหลัก 5 ชุด, และระบบการแจ้งเตือน 7 เหตุการณ์หลัก พร้อมทั้งผูกโยงเข้ากับสถาปัตยกรรมฐานข้อมูลและ API Contract อย่างสมบูรณ์ เอกสารนี้พร้อมนำไปใช้เป็นรากฐานสำหรับ **Planning Step 9: Project Docker & Deployment Architecture (`09-project-docker-architecture.md`)** ต่อไป
