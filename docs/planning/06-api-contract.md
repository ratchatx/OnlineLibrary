# REST API Contract Specification: Online Library Management System

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `06-api-contract.md`  
**Phase:** Phase 1 — Planning Only (Step 6: API Contract)  
**Status:** Under Review  
**Date:** 2026-08-28  

---

## 1. Purpose
เอกสารฉบับนี้จัดทำขึ้นเพื่อกำหนดข้อตกลงและโครงสร้างของ RESTful API (API Contract Specification) สำหรับ **Online Library Management System** เพื่อใช้เป็นสัญญาระหว่างส่วนหน้าบ้าน (Frontend - React 18 / MUI 5) และส่วนหลังบ้าน (Backend - Node.js 20 LTS / Express 4) โดยครอบคลุม Endpoint, HTTP Methods, Request/Response Payloads, Status Codes, มาตรฐาน Error Handling, การแบ่งหน้า (Pagination), และการตรวจสอบสิทธิ์ (Authentication & RBAC Authorization)

---

## 2. Reference Documents
เอกสารที่ใช้อ้างอิงร่วมในการออกแบบ API Contract:
1. `docs/planning/01-system-overview.md` — วัตถุประสงค์และขอบเขตระบบ
2. `docs/planning/02-requirements.md` — ข้อกำหนดความต้องการ (`FR-001` ถึง `FR-034`)
3. `docs/planning/03-roles-permissions.md` — สิทธิ์และการควบคุมการเข้าถึง (`Member`, `Librarian`, `Admin`)
4. `docs/planning/04-library-workflow.md` — กระบวนการทำงานและวงจรสถานะ
5. `docs/planning/05-database-design.md` — โครงสร้างตารางและแบบจำลองข้อมูล 15 ตาราง
6. `docs/planning/00-tech-stack-decision.md` — การตัดสินใจเลือก Node.js/Express (Port `5001`)

---

## 3. API Architecture Overview
- **Protocol:** HTTP/1.1 / HTTPS (JSON Payload)
- **Architecture Style:** RESTful API (Resource-Oriented)
- **Authentication Mechanism:** JSON Web Token (JWT) ส่งผ่าน HTTP Header `Authorization: Bearer <token>`
- **Character Encoding:** UTF-8 (`application/json; charset=utf-8`)
- **Field Naming Convention:** ใช้ `snake_case` สำหรับ Request และ Response Body เพื่อให้สอดคล้องกับ Database Schema และ Backend Model

---

## 4. API Base Path & Versioning
- **Base Path:** `/api/v1`
- **เหตุผลการใช้ Versioning (`/v1`):** เพื่อรองรับการปรับปรุงโครงสร้าง API ในอนาคตโดยไม่กระทบต่อ Client Version ปัจจุบัน และเป็น Best Practice ของระบบระดับองค์กร

---

## 5. API Design Principles
1. **Resource-Oriented URLs:** ใช้คำนามพหูพจน์ (Plural Nouns) เป็นตัวแทนของ Resource เช่น `/books`, `/members`, `/borrowings`
2. **Correct HTTP Methods:** 
   - `GET`: ดึงข้อมูล (Idempotent / Safe)
   - `POST`: สร้าง Resource ใหม่ หรือทำ Business Action
   - `PUT` / `PATCH`: ปรับปรุงข้อมูลทั้งหมดหรือบางส่วน
   - `DELETE`: ลบข้อมูล (หรือ Soft Delete)
3. **Consistent Envelope:** Response ทุก Endpoint จะถูกห่อหุ้มด้วยโครงสร้างมาตรฐานเดียวกัน (`success`, `data`, `message`, `pagination`)
4. **No Sensitive Leaks:** ห้ามเปิดเผย `password_hash`, Internal Error Stack Trace หรือ Database Details ใน API Response
5. **Stateless Backend:** Backend ไม่เก็บ Session State ฝั่ง Server แต่ตรวจสอบสถานะผ่าน JWT Payload

---

## 6. Authentication & Authorization
- **Header:** `Authorization: Bearer <jwt_token>`
- **Public Endpoints:** เข้าถึงได้โดยไม่ต้องแนบ Token (เช่น `/auth/login`, `/books` สำหรับการค้นหา)
- **Protected Endpoints:** ต้องมี Token ที่ถูกต้อง และมี Role ที่ตรงตามที่กำหนดใน `03-roles-permissions.md`
- **Error Codes:**
  - `401 Unauthorized`: ไม่มี Token, Token หมดอายุ หรือ Token ไม่ถูกต้อง
  - `403 Forbidden`: มี Token แต่ Role ไม่มีสิทธิ์เข้าถึง Resource นั้น หรือเข้าถึงข้อมูลของผู้อื่น (IDOR)

---

## 7. API Modules Overview
ระบบแบ่ง API ออกเป็น 16 โมดูลหลัก:
1. `Auth API` — การยืนยันตัวตนและการเข้าสู่ระบบ
2. `Users API` — การจัดการบัญชีผู้ใช้ระบบ (Admin)
3. `Members API` — การจัดการข้อมูลสมาชิกและประวัติส่วนตัว
4. `Books API` — แคตตาล็อกหนังสือและการสืบค้น
5. `Book Categories API` — การจัดการหมวดหมู่หนังสือ
6. `Authors API` — ข้อมูลผู้แต่ง (Metadata)
7. `Publishers API` — ข้อมูลสำนักพิมพ์ (Metadata)
8. `Book Copies API` — การจัดการตัวเล่มจริงและสต็อก
9. `Borrowings API` — ธุรกรรมการยืมหนังสือ
10. `Returns API` — ธุรกรรมการรับคืนหนังสือ
11. `Reservations API` — การจองหนังสือและคิว
12. `Fines API` — รายการค่าปรับและการบันทึกชำระ
13. `Notifications API` — ข้อความแจ้งเตือนภายในระบบ
14. `Dashboard API` — ข้อมูลสรุปเชิงสถิติสำหรับหน้าแดชบอร์ด
15. `Reports API` — รายงานสรุปการดำเนินงานห้องสมุด
16. `Audit Logs API` — บันทึกประวัติกิจกรรมความปลอดภัย

---

## 8. Auth API (`/api/v1/auth`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `POST` | `/auth/login` | เข้าสู่ระบบและรับ Token | `{ username, password }` | `{ token, user: { id, username, email, role } }` | Public | All |
| `POST` | `/auth/logout` | ออกจากระบบ (Invalidate Client State) | - | `{ message: "Logged out successfully" }` | Yes | All |
| `GET` | `/auth/me` | ดึงข้อมูลโปรไฟล์ผู้ใช้งานปัจจุบัน | - | `{ user, member_profile? }` | Yes | All |
| `PUT` | `/auth/change-password`| เปลี่ยนรหัสผ่านของตนเอง | `{ old_password, new_password }` | `{ message: "Password updated" }` | Yes | All |

---

## 9. Users API (`/api/v1/users`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/users` | ดึงรายชื่อผู้ใช้งานทั้งหมด | Query: `page, limit, search, role, status` | List of Users + Pagination | Yes | Admin |
| `GET` | `/users/:id` | ดึงข้อมูลผู้ใช้งานรายบุคคล | Path: `id` | Single User Object | Yes | Admin |
| `POST` | `/users` | สร้างบัญชีผู้ใช้งานใหม่ | `{ username, email, password, role_id, status }` | Created User Object | Yes | Admin |
| `PUT` | `/users/:id` | ปรับปรุงข้อมูลบัญชีผู้ใช้งาน | `{ email, role_id, status }` | Updated User Object | Yes | Admin |
| `PATCH`| `/users/:id/status` | เปลี่ยนสถานะบัญชี (Active/Suspended) | `{ status }` | Updated Status | Yes | Admin |
| `DELETE`| `/users/:id` | Soft Delete บัญชีผู้ใช้งาน | Path: `id` | Success Message | Yes | Admin |

---

## 10. Members API (`/api/v1/members`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/members` | ดึงรายชื่อสมาชิกห้องสมุด | Query: `page, limit, search, status` | List of Members + Pagination | Yes | Librarian, Admin |
| `GET` | `/members/:id` | ดึงข้อมูลโปรไฟล์สมาชิก | Path: `id` | Single Member Profile | Yes | Member (Own), Librarian, Admin |
| `PUT` | `/members/:id` | ปรับปรุงข้อมูลโปรไฟล์สมาชิก | `{ first_name, last_name, phone, address }` | Updated Member Profile | Yes | Member (Own), Librarian, Admin |
| `GET` | `/members/:id/borrowings`| ดึงประวัติการยืม-คืนของสมาชิก | Query: `status, page, limit` | List of Member Borrowings | Yes | Member (Own), Librarian, Admin |
| `GET` | `/members/:id/reservations`| ดึงรายการจองของสมาชิก | Query: `status, page, limit` | List of Member Reservations | Yes | Member (Own), Librarian, Admin |
| `GET` | `/members/:id/fines` | ดึงรายการค่าปรับของสมาชิก | Query: `status, page, limit` | List of Member Fines | Yes | Member (Own), Librarian, Admin |

---

## 11. Books API (`/api/v1/books`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/books` | ค้นหาและดูรายการหนังสือ | Query: `page, limit, search, category_id, availability, sort` | List of Books + Pagination | Public | All |
| `GET` | `/books/:id` | ดึงรายละเอียดหนังสือ | Path: `id` | Single Book Details + Copies Summary | Public | All |
| `POST` | `/books` | สร้างรายการหนังสือใหม่ | `{ isbn, title, author, publisher, publish_year, category_id, description, cover_image_url }` | Created Book Object | Yes | Librarian, Admin |
| `PUT` | `/books/:id` | ปรับปรุงข้อมูลบรรณานุกรม | `{ title, author, publisher, publish_year, category_id, description, cover_image_url }` | Updated Book Object | Yes | Librarian, Admin |
| `DELETE`| `/books/:id` | Soft Delete รายการหนังสือ | Path: `id` | Success Message | Yes | Librarian, Admin |

---

## 12. Book Categories API (`/api/v1/categories`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/categories` | ดึงรายการหมวดหมู่หนังสือทั้งหมด | Query: `search` | List of Categories | Public | All |
| `GET` | `/categories/:id` | ดึงข้อมูลหมวดหมู่รายตัว | Path: `id` | Single Category Object | Public | All |
| `POST` | `/categories` | สร้างหมวดหมู่หนังสือใหม่ | `{ name, description, parent_id? }` | Created Category Object | Yes | Librarian, Admin |
| `PUT` | `/categories/:id` | ปรับปรุงข้อมูลหมวดหมู่ | `{ name, description, parent_id? }` | Updated Category Object | Yes | Librarian, Admin |
| `DELETE`| `/categories/:id` | ลบหมวดหมู่หนังสือ | Path: `id` | Success Message | Yes | Librarian, Admin |

---

## 13. Authors & Publishers API (`/api/v1/metadata`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/metadata/authors` | ดึงรายชื่อผู้แต่งยอดนิยม/ทั้งหมด | Query: `search, limit` | List of Author Names (String Array) | Public | All |
| `GET` | `/metadata/publishers` | ดึงรายชื่อสำนักพิมพ์ทั้งหมด | Query: `search, limit` | List of Publisher Names (String Array) | Public | All |

---

## 14. Book Copies API (`/api/v1/books/:book_id/copies` & `/api/v1/copies`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/books/:book_id/copies` | ดึงรายการสำเนาทั้งหมดของหนังสือเล่มนี้ | Path: `book_id` | List of Book Copies | Yes | Librarian, Admin |
| `POST` | `/books/:book_id/copies` | เพิ่มสำเนาหนังสือเล่มจริงใหม่ | Path: `book_id`, Body: `{ barcode, copy_number, status? }` | Created Copy Object | Yes | Librarian, Admin |
| `GET` | `/copies/barcode/:barcode`| ค้นหาสำเนาหนังสือด้วย Barcode | Path: `barcode` | Single Copy with Book Info | Yes | Librarian, Admin |
| `PATCH`| `/copies/:id/status` | ปรับปรุงสถานะสำเนา (Maintenance/Lost) | `{ status }` | Updated Copy Status | Yes | Librarian, Admin |
| `DELETE`| `/copies/:id` | ลบสำเนาหนังสือ (เฉพาะที่ไม่มีประวัติยืม) | Path: `id` | Success Message | Yes | Librarian, Admin |

---

## 15. Borrowings API (`/api/v1/borrowings`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/borrowings` | ดึงรายการยืมทั้งหมดในระบบ | Query: `page, limit, status, member_id, overdue_only` | List of Borrowings + Pagination | Yes | Librarian, Admin |
| `GET` | `/borrowings/my-borrows` | ดึงรายการยืมของสมาชิกปัจจุบัน | Query: `status, page, limit` | List of Current User Borrowings | Yes | Member |
| `GET` | `/borrowings/:id` | ดึงรายละเอียดรายการยืม | Path: `id` | Single Borrowing Details | Yes | Member (Own), Librarian, Admin |
| `POST` | `/borrowings` | สร้างรายการยืมหนังสือใหม่ | `{ member_id, book_copy_id, notes? }` | Created Borrowing Object | Yes | Member, Librarian, Admin |

---

## 16. Returns API (`/api/v1/borrowings/:id/return`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `POST` | `/borrowings/:id/return` | บันทึกการรับคืนหนังสือ | Path: `id`, Body: `{ return_date?, notes? }` | `{ borrowing, fine_incurred?, next_reservation? }` | Yes | Librarian, Admin |

---

## 17. Reservations API (`/api/v1/reservations`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/reservations` | ดึงรายการจองทั้งหมดในระบบ | Query: `page, limit, status, book_id` | List of Reservations + Pagination | Yes | Librarian, Admin |
| `GET` | `/reservations/my-reservations` | ดึงรายการจองของสมาชิกปัจจุบัน | Query: `status, page, limit` | List of Current User Reservations | Yes | Member |
| `GET` | `/reservations/:id` | ดึงรายละเอียดรายการจอง | Path: `id` | Single Reservation Details | Yes | Member (Own), Librarian, Admin |
| `POST` | `/reservations` | สร้างรายการจองหนังสือใหม่ | `{ book_id }` | Created Reservation Object | Yes | Member, Librarian, Admin |
| `POST` | `/reservations/:id/cancel` | ยกเลิกรายการจองหนังสือ | Path: `id` | Updated Reservation (Cancelled) | Yes | Member (Own), Librarian, Admin |

---

## 18. Fines API (`/api/v1/fines`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/fines` | ดึงรายการค่าปรับทั้งหมด | Query: `page, limit, status, member_id` | List of Fines + Pagination | Yes | Librarian, Admin |
| `GET` | `/fines/my-fines` | ดึงรายการค่าปรับของสมาชิกปัจจุบัน | Query: `status, page, limit` | List of Current User Fines | Yes | Member |
| `GET` | `/fines/:id` | ดึงรายละเอียดค่าปรับ | Path: `id` | Single Fine Details | Yes | Member (Own), Librarian, Admin |
| `POST` | `/fines/:id/pay` | บันทึกการรับชำระเงินค่าปรับ | Path: `id`, Body: `{ notes? }` | Updated Fine (Paid) | Yes | Librarian, Admin |
| `POST` | `/fines/:id/waive` | ยกเว้นหรือปรับลดยอดค่าปรับ | Path: `id`, Body: `{ reason }` | Updated Fine (Waived) | Yes | Admin |

---

## 19. Notifications API (`/api/v1/notifications`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/notifications` | ดึงข้อความแจ้งเตือนของผู้ใช้ปัจจุบัน | Query: `is_read, page, limit` | List of Notifications + Unread Count | Yes | All |
| `PATCH`| `/notifications/:id/read`| ปรับสถานะข้อความแจ้งเตือนเป็นอ่านแล้ว | Path: `id` | Updated Notification | Yes | All |
| `PATCH`| `/notifications/read-all` | ปรับสถานะข้อความทั้งหมดเป็นอ่านแล้ว | - | `{ updated_count }` | Yes | All |

---

## 20. Dashboard API (`/api/v1/dashboard`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/dashboard/staff-summary`| ดึงข้อมูลสรุปสถิติสำหรับเจ้าหน้าที่/แอดมิน | Query: `period` (today, month, year) | `{ total_books, active_borrows, overdue_count, total_unpaid_fines, pending_reservations }` | Yes | Librarian, Admin |
| `GET` | `/dashboard/member-summary`| ดึงข้อมูลสรุปกิจกรรมของสมาชิก | - | `{ current_borrows_count, nearest_due_date, active_reservations_count, total_unpaid_fines }` | Yes | Member |

---

## 21. Reports API (`/api/v1/reports`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/reports/borrow-return` | สรุปรายงานสถิติการยืม-คืนตามช่วงเวลา | Query: `date_from, date_to, category_id` | Grouped Statistics Data | Yes | Librarian, Admin |
| `GET` | `/reports/overdue-fines` | สรุปรายงานรายการค้างส่งและค่าปรับ | Query: `status, date_from, date_to` | Summary Table of Overdue & Fines | Yes | Librarian, Admin |
| `GET` | `/reports/popular-books` | สรุปรายงานอันดับหนังสือยอดนิยม | Query: `limit, period` | Top Borrowed Books List | Yes | Librarian, Admin |

---

## 22. Audit Logs API (`/api/v1/audit-logs`)

| Method | Endpoint | Description | Request Body / Params | Response Summary | Auth | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `GET` | `/audit-logs` | ดึงประวัติกิจกรรมความปลอดภัยและระบบ | Query: `page, limit, user_id, action, date_from, date_to` | List of Audit Logs + Pagination | Yes | Admin |

---

## 23. Request Standards
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <jwt_token>` (สำหรับ Protected Endpoints)
- **Path Parameters:** ใช้ระบุ Resource Identifier เฉพาะตัว เช่น `:id`, `:barcode`
- **Query Parameters Standard:**
  - `page`: หมายเลขหน้า (Default: `1`)
  - `limit`: จำนวนรายการต่อหน้า (Default: `10`, Max: `100`)
  - `search`: คำค้นหาข้อความ
  - `sort`: ชื่อฟิลด์ที่ต้องการจัดเรียง (เช่น `created_at`, `title`)
  - `order`: ทิศทางการจัดเรียง (`asc` หรือ `desc`, Default: `desc`)

---

## 24. Response Standards (Envelope Format)

### 24.1 Single Resource / Success Response
```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin"
  }
}
```

### 24.2 Paginated List Response
```json
{
  "success": true,
  "data": [
    { "id": 1, "title": "Clean Code" }
  ],
  "pagination": {
    "total_records": 100,
    "current_page": 1,
    "total_pages": 10,
    "limit": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 25. Standard HTTP Status Codes

| Status Code | Meaning | การใช้งานในระบบ |
| :--- | :--- | :--- |
| **`200 OK`** | สำเร็จ | ดึงข้อมูล, อัปเดตข้อมูล หรือทำ Action สำเร็จ |
| **`201 Created`** | สร้างสำเร็จ | สร้าง Resource ใหม่ เช่น เพิ่มหนังสือ, สร้างรายการยืม/จอง |
| **`204 No Content`** | สำเร็จไม่มีข้อมูลส่งกลับ | ลบข้อมูลสำเร็จ (Optional) |
| **`400 Bad Request`** | ข้อมูลนำเข้าไม่ถูกต้อง | Validation ล้มเหลว หรือผิดกฎทางธุรกิจ (เช่น หนังสือหมด) |
| **`401 Unauthorized`** | ยังไม่ได้ยืนยันตัวตน | ไม่มี Token, Token หมดอายุ |
| **`403 Forbidden`** | ไม่มีสิทธิ์เข้าถึง | Role ไม่มีสิทธิ์ หรือเข้าถึงข้อมูลผู้อื่น |
| **`404 Not Found`** | ไม่พบข้อมูล | ระบุ ID หรือ Resource ที่ไม่มีอยู่จริง |
| **`409 Conflict`** | ข้อมูลขัดแย้ง | จองหนังสือซ้ำ, รหัส ISBN/Barcode ซ้ำ |
| **`422 Unprocessable Entity`** | รูปแบบข้อมูลผิดพลาด | Validation Error ระดับโครงสร้าง JSON |
| **`500 Internal Server Error`** | เซิร์ฟเวอร์ขัดข้อง | Database Error, Unhandled Exception |

---

## 26. Standard Error Response Format

```json
{
  "success": false,
  "message": "Validation failed / Book is currently unavailable",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 27. Validation Rules Summary
1. **Auth:** `username` (ความยาว 3-50 ตัวอักษร), `password` (ความยาวขั้นต่ำ 6-8 ตัวอักษร)
2. **Books:** `title` (Required), `category_id` (Required, ต้องมีอยู่จริง), `isbn` (ความยาว 10-20 ตัวอักษร)
3. **Borrowings:** `member_id` (Required, สถานะ Active), `book_copy_id` (Required, สถานะ Available)
4. **Fines:** `amount` (ตัวเลขทศนิยม >= 0), `reason` (Required เมื่อทำการ Waive)

---

## 28. Pagination, Filtering, and Sorting Guidelines
- ทุก List Endpoint ที่มีแนวโน้มข้อมูลขนาดใหญ่ ต้องรองรับ Pagination ผ่าน Query Parameters `page` และ `limit`
- กำหนดค่า Maximum Limit ที่ `100` เพื่อป้องกันปัญหา Memory Exhaustion ใน Node.js
- รองรับการกรองตามช่วงวันที่ (`date_from`, `date_to`) ในโมดูล Borrowings, Fines, Reports, และ Audit Logs

---

## 29. API Security & Access Control
- **Input Sanitization:** Validate และ Sanitize Input ทุกจุดที่ Controller/Middleware เพื่อป้องกัน SQL Injection และ XSS
- **No Secret Exposure:** กรองฟิลด์ `password_hash` ออกจาก User/Member Response ทุกกรณี
- **Resource Ownership Validation:** บังคับตรวจสอบ `req.user.id === resource.member_id` ใน Endpoint ส่วนตัว เพื่อป้องกัน Insecure Direct Object References (IDOR)
- **Rate Limiting:** แนะนำให้ติดตั้ง Rate Limiting สำหรับ `/auth/login` เพื่อป้องกัน Brute-force Attacks

---

## 30. Business Rule Mapping

| กฎทางธุรกิจ (Business Rule) | Endpoint ที่เกี่ยวข้อง | ตาราง Database |
| :--- | :--- | :--- |
| **BR-001 (Active Member Check)** | `POST /borrowings`, `POST /reservations` | `members`, `users` |
| **BR-002 (Stock Check & Available > 0)** | `POST /borrowings` | `books`, `book_copies` |
| **BR-003 (Due Date Calculation)** | `POST /borrowings` | `borrowings` |
| **BR-004 (Overdue Fine Calculation)** | `POST /borrowings/:id/return` | `borrowings`, `fines` |
| **BR-005 (Reservation when Stock = 0)** | `POST /reservations` | `books`, `reservations` |
| **BR-006 (No Duplicate Reservation)** | `POST /reservations` | `reservations` |
| **BR-007 (Reservation Hold on Return)** | `POST /borrowings/:id/return` | `reservations`, `book_copies` |
| **BR-008 (Backend Calculation)** | All Calculation Endpoints | All Tables |

---

## 31. Requirement Traceability Matrix

| Functional Requirement | Endpoints ที่รองรับ |
| :--- | :--- |
| **FR-001 ถึง FR-004 (Auth & RBAC)** | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| **FR-005 ถึง FR-007 (Member Management)** | `GET/PUT /members/:id`, `GET /members` |
| **FR-008 ถึง FR-010 (Book Management)** | `GET/POST/PUT/DELETE /books`, `GET/POST /categories` |
| **FR-011 ถึง FR-014 (Book Search)** | `GET /books`, `GET /books/:id`, `GET /metadata/*` |
| **FR-015 ถึง FR-017 (Borrowing)** | `POST /borrowings`, `GET /borrowings/my-borrows` |
| **FR-018 ถึง FR-019 (Returning)** | `POST /borrowings/:id/return` |
| **FR-020 ถึง FR-022 (Reservation)** | `POST /reservations`, `POST /reservations/:id/cancel` |
| **FR-023 ถึง FR-025 (Fines)** | `GET /fines/my-fines`, `POST /fines/:id/pay`, `POST /fines/:id/waive` |
| **FR-026 ถึง FR-028 (Notifications)**| `GET /notifications`, `PATCH /notifications/:id/read` |
| **FR-029 ถึง FR-030 (Dashboard)** | `GET /dashboard/staff-summary`, `GET /dashboard/member-summary` |
| **FR-031 ถึง FR-032 (Reports)** | `GET /reports/borrow-return`, `GET /reports/overdue-fines` |
| **FR-033 ถึง FR-034 (Admin & Audit)** | `GET/POST/PUT /users`, `GET /audit-logs` |

---

## 32. Role / Endpoint Authorization Matrix

| Endpoint Group | Public | Member | Librarian | Admin |
| :--- | :---: | :---: | :---: | :---: |
| `/auth/login` | `✓` | `✓` | `✓` | `✓` |
| `/auth/me`, `/auth/change-password` | `✗` | `✓` | `✓` | `✓` |
| `/users/**` | `✗` | `✗` | `✗` | `✓` |
| `/members` (List All) | `✗` | `✗` | `✓` | `✓` |
| `/members/:id` (Get Profile) | `✗` | `Own Only` | `✓` | `✓` |
| `/books` (Search Catalog) | `✓` | `✓` | `✓` | `✓` |
| `/books` (Create/Update/Delete) | `✗` | `✗` | `✓` | `✓` |
| `/categories/**` (Manage) | `✗` | `✗` | `✓` | `✓` |
| `/copies/**` (Manage Barcodes) | `✗` | `✗` | `✓` | `✓` |
| `/borrowings/my-borrows` | `✗` | `✓` | `✓` | `✓` |
| `/borrowings` (Create/Manage) | `✗` | `Self Only` | `✓` | `✓` |
| `/borrowings/:id/return` | `✗` | `✗` | `✓` | `✓` |
| `/reservations/my-reservations` | `✗` | `✓` | `✓` | `✓` |
| `/reservations` (Create/Cancel) | `✗` | `Self/Own` | `✓` | `✓` |
| `/fines/my-fines` | `✗` | `✓` | `✓` | `✓` |
| `/fines/:id/pay` | `✗` | `✗` | `✓` | `✓` |
| `/fines/:id/waive` | `✗` | `✗` | `✗` | `✓` |
| `/notifications/**` | `✗` | `Own Only` | `Own Only` | `Own Only` |
| `/dashboard/staff-summary` | `✗` | `✗` | `✓` | `✓` |
| `/dashboard/member-summary` | `✗` | `✓` | `N/A` | `N/A` |
| `/reports/**` | `✗` | `✗` | `✓` | `✓` |
| `/audit-logs` | `✗` | `✗` | `✗` | `✓` |

---

## 33. Open Questions (ประเด็น API ที่ต้องการการยืนยัน)

| ID | คำถาม / ข้อสงสัยเกี่ยวกับ API | API ที่ได้รับผลกระทบ | ผลกระทบ | ลำดับความสำคัญ |
| :--- | :--- | :--- | :---: | :---: |
| **OQ-API-001** | ในระบบยืนยันตัวตน ต้องมีระบบ Refresh Token ผ่าน Cookie/Header หรือใช้ Long-lived Access Token ในเฟสแรก? | `POST /auth/login` | Medium | Medium |
| **OQ-API-002** | เมื่อทำรายการยืมสำเร็จ จำเป็นต้องมี Endpoint สำหรับออกเอกสารใบยืม (Print Slip) หรือไม่? | `POST /borrowings` | Low | Low |
| **OQ-API-003** | การอัปโหลดรูปภาพหน้าปกหนังสือ (`cover_image_url`) จะรับเป็น Image File Upload (Multipart Form Data) หรือรับเป็น URL String ภายนอก? | `POST/PUT /books` | Medium | High |

---

## 34. Assumptions
1. ทุก Endpoint ที่มีการรับส่งข้อมูลใช้มาตรฐาน JSON Payload (`Content-Type: application/json`)
2. การคำนวณวันครบกำหนดและค่าปรับทั้งหมดจะประมวลผลภายใน Controller/Service ของ Backend โดยอัตโนมัติ
3. เวลาทั้งหมดใน Payload จะอยู่ในรูปแบบ ISO 8601 String (`YYYY-MM-DDTHH:mm:ss.sssZ`)

---

## 35. Risks & Mitigation Strategies
- **ความเสี่ยง Mass Assignment Vulnerability:** ป้องกันโดยใช้ Whitelist Body Parsing ใน Controller (รับเฉพาะฟิลด์ที่กำหนด)
- **ความเสี่ยง Unauthorized Access ผ่าน ID Manipulation (IDOR):** มี Middleware ตรวจสอบความเป็นเจ้าของ Resource ทุกครั้งที่มีการส่ง `:id`
- **ความเสี่ยง Performance จากการดึงข้อมูลจำนวนมาก:** บังคับใช้ Pagination กับทุก List Endpoint โดยจำกัด `limit` สูงสุดไม่เกิน 100 รายการ

---

## 36. Validation Checklist Report
- [x] **อ่านเอกสาร `01` ถึง `05` ครบถ้วน:** สอดคล้องกับ Requirements, Roles, Workflows, และ Database Schema
- [x] **API Modules ครบ:** ครอบคลุม 16 โมดูลหลัก
- [x] **Endpoints ครบ:** มี Method, Path, Request, Response, Auth, Allowed Roles ชัดเจน
- [x] **HTTP Status Codes ถูกต้องตามมาตรฐาน REST:** 200, 201, 400, 401, 403, 404, 409, 500
- [x] **Envelope Response & Error Format ชัดเจน:** มีมาตรฐานเดียวกันทั้งระบบ
- [x] **Role / Endpoint Matrix ครบ:** แจกแจงสิทธิ์ Public, Member, Librarian, Admin
- [x] **Requirement Traceability & Business Rules Mapping ครบ:** ผูกโยงกับ `FR-XXX` และ `BR-XXX`
- [x] **ไม่มี Code Implementation / SQL / Migration:** เป็น API Contract Specification
- [x] **ไม่มี Feature ใหม่ / ไม่เปลี่ยน Architecture:** สอดคล้องกับขอบเขตระบบทุกประการ

---

## 37. Summary
เอกสาร **REST API Contract Specification** ฉบับนี้ได้กำหนดโครงสร้าง Endpoints ทั้งหมด 42 Endpoints ครอบคลุม 16 โมดูล พร้อมทั้งกำหนดมาตรฐานการส่งข้อมูล Request/Response, ระบบความปลอดภัย JWT & RBAC, และการเชื่อมโยงกับฐานข้อมูล MySQL 8 ไว้อย่างสมบูรณ์ เอกสารนี้พร้อมนำไปใช้เป็นรากฐานสำหรับ **Planning Step 7: Frontend Pages & UI Structure (`07-frontend-pages.md`)** ต่อไป
