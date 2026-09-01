# 📚 Online Library Management System

ระบบจัดการห้องสมุดออนไลน์ Full-Stack พัฒนาด้วย React 18 + Node.js 20 + MySQL 8 บน Docker Compose

---

## 🏗️ Tech Stack & Services

| Service | Technology | Container Port | Host Port | รายละเอียด |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React 18 + Vite 5 + MUI 5 | `5173` | [`5173`](http://localhost:5173) | HMR / Polling watch (Docker-compatible) |
| **Backend** | Node.js 20 LTS + Express 4 | `5001` | [`5001`](http://localhost:5001) | Hot-reload ด้วย Nodemon + legacyWatch |
| **Database** | MySQL 8.0 (utf8mb4) | `3306` | `3307` | Healthcheck + Auto Init SQL (`db/init/`) |
| **DB Admin** | phpMyAdmin | `80` | [`8081`](http://localhost:8081) | Platform: `linux/amd64` |

---

## 📊 Implementation Progress (100% Complete)

| Phase | Name | Category | Status |
| :---: | :--- | :--- | :---: |
| **0** | Requirement & Architecture Validation | Planning | ✅ Done |
| **1** | Project Setup & Environment Initialization | Infrastructure | ✅ Done |
| **2** | Database Schema & Seed Data | Database | ✅ Done |
| **3** | Backend Core & MySQL Connection | Backend | ✅ Done |
| **4** | Authentication & RBAC Authorization | Backend | ✅ Done |
| **5** | Library Catalog & Book Management API | Backend | ✅ Done |
| **6** | Circulation Workflow API (Borrow, Return, Reserve) | Backend | ✅ Done |
| **7** | Member Management API | Backend | ✅ Done |
| **8** | Notification, Overdue & Fine Processing API | Backend | ✅ Done |
| **9** | Dashboard & Operational Reports API | Backend | ✅ Done |
| **10** | Frontend Layout, Theme & Routing | Frontend | ✅ Done |
| **11** | Frontend Authentication & State Management | Frontend | ✅ Done |
| **12** | Book Catalog & Book Management UI | Frontend | ✅ Done |
| **13** | Circulation Desk & Member Workflows UI | Frontend | ✅ Done |
| **14** | Member Management & Directory UI | Frontend | ✅ Done |
| **15** | Dashboard & Analytical Reports UI | Frontend | ✅ Done |
| **16** | Notification Center & Topbar Dropdown UI | Frontend | ✅ Done |
| **17** | Docker Integration & Service Verification | Infrastructure | ✅ Done |
| **18** | End-to-End Integration Testing & Bug Fix | Quality Assurance | ✅ Done |
| **19** | Security Hardening & Production Audit | Security | ✅ Done |
| **20** | Production Deployment & Release | DevOps | ✅ Done |

---

## 📁 โครงสร้างโปรเจกต์ (Directory Structure)

```text
Online_LibraryManagementSystem/
├── .env                    # Environment Variables จริง (ไม่ Commit)
├── .env.example            # Template สำหรับ Environment Variables
├── .gitignore              # กฎ Git Ignore
├── docker-compose.yml      # กำหนดคอนฟิก 4 Services + Healthcheck + Volumes
├── db/
│   └── init/               # SQL Scripts สำหรับ MySQL Auto-Init
│       ├── 01-schema.sql   # DDL Schema 15 ตาราง (InnoDB, utf8mb4)
│       ├── 02-seed.sql     # Master Data & Initial Seeds
│       └── README.md       # คำอธิบาย DB Init Scripts
├── backend/
│   ├── Dockerfile.dev      # Dockerfile สำหรับ Backend (Node 20 Alpine)
│   ├── package.json        # Express, mysql2, bcryptjs, jsonwebtoken, cors, dotenv, helmet, morgan
│   ├── nodemon.json        # คอนฟิก Live Watch สำหรับ Docker (legacyWatch)
│   └── src/
│       ├── config/
│       │   ├── db.js       # MySQL Connection Pool (mysql2/promise)
│       │   └── jwt.js      # JWT Token Generation & Verification
│       ├── services/
│       │   ├── circulationService.js # Borrow, Return, Reserve, Fine Transaction Engine
│       │   └── schedulerService.js   # Automated Overdue Detection & Expiry Promotion
│       ├── controllers/
│       │   ├── authController.js         # Login, Me, Change Password, Logout
│       │   ├── bookController.js         # Search, Details, Create, Update, Delete Books
│       │   ├── bookCopyController.js     # Physical Book Copies Management
│       │   ├── categoryController.js     # Book Categories Management
│       │   ├── circulationController.js  # Borrow, Return, Reserve Handlers
│       │   ├── fineController.js         # Fine Queries, Payments & Waiving
│       │   ├── memberController.js       # Member Profiles & IDOR Protection
│       │   ├── notificationController.js # In-App Notifications & Read Markers
│       │   ├── dashboardController.js    # Operational KPIs & Activity Summaries
│       │   ├── reportController.js       # Circulation & Financial Reports
│       │   ├── auditController.js        # Security & System Audit Logs
│       │   └── metadataController.js     # Authors & Publishers Directory
│       ├── middlewares/
│       │   ├── authGuard.js     # Bearer Token Auth Guard
│       │   ├── roleGuard.js     # RBAC Role Guard (admin, librarian, member)
│       │   └── errorHandler.js  # Global Error Handler & 404 Middleware
│       ├── models/
│       │   ├── bookModel.js         # Book Data Access & Pagination
│       │   ├── bookCopyModel.js     # Book Copies Data Access
│       │   ├── categoryModel.js     # Category Data Access
│       │   ├── fineModel.js         # Fines Data Access & Settlements
│       │   ├── memberModel.js       # Member Profile, Fines & History Data Access
│       │   └── notificationModel.js # In-App Notification Records
│       ├── routes/
│       │   ├── authRoutes.js         # /api/v1/auth Routes
│       │   ├── bookRoutes.js         # /api/v1/books Routes
│       │   ├── bookCopyRoutes.js     # /api/v1/copies Routes
│       │   ├── categoryRoutes.js     # /api/v1/categories Routes
│       │   ├── metadataRoutes.js     # /api/v1/metadata Routes
│       │   ├── borrowingRoutes.js    # /api/v1/borrowings Routes
│       │   ├── reservationRoutes.js  # /api/v1/reservations Routes
│       │   ├── memberRoutes.js       # /api/v1/members Routes
│       │   ├── fineRoutes.js         # /api/v1/fines Routes
│       │   ├── notificationRoutes.js # /api/v1/notifications Routes
│       │   ├── dashboardRoutes.js    # /api/v1/dashboard Routes
│       │   ├── reportRoutes.js       # /api/v1/reports Routes
│       │   └── auditRoutes.js        # /api/v1/audit-logs Routes
│       ├── utils/
│       │   ├── auditLogger.js # Structured Audit Logger
│       │   └── response.js    # Standard Response Formatter Helpers
│       └── server.js       # Express App + Helmet + CORS + Morgan + Health Check + Scheduler
└── frontend/
    ├── Dockerfile.dev      # Dockerfile สำหรับ Frontend (Node 20 Alpine)
    ├── package.json        # React 18, Vite 5, MUI 5, react-router-dom v6, axios
    ├── vite.config.js      # Host binding 0.0.0.0 & Polling watch & API Proxy
    ├── index.html          # HTML Entry Template + Google Fonts
    └── src/
        ├── main.jsx        # React Entry Point
        ├── index.css       # Global CSS Reset & Typography
        ├── theme.js        # MUI Custom Palette, Typography & Overrides
        ├── App.jsx         # Root Component with AuthProvider & BrowserRouter
        ├── contexts/
        │   └── AuthContext.jsx  # Global Auth Context & useAuth Custom Hook
        ├── services/
        │   ├── api.js                 # Axios Instance with Request/Response Interceptors
        │   ├── authService.js         # Login, Me, Change Password & Logout APIs
        │   ├── bookService.js         # Book, Category & Physical Copy CRUD APIs
        │   └── circulationService.js  # Borrow, Return & Reservation APIs
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.jsx   # Public Navigation Bar with Auth State
        │   │   ├── Sidebar.jsx  # Responsive Collapsible Sidebar
        │   │   ├── Topbar.jsx   # Portal Header & User Profile Dropdown
        │   │   └── Footer.jsx   # Standard Footer
        │   ├── auth/
        │   │   └── ChangePasswordDialog.jsx # Change Password Modal Dialog
        │   └── books/
        │       ├── BookCard.jsx         # Book Card with Availability Badge
        │       ├── BookFormDialog.jsx   # Add/Edit Book Dialog Form
        │       └── BookCopiesDialog.jsx # Manage Physical Copies & Barcodes
        ├── layouts/
        │   ├── PublicLayout.jsx # Public User Layout
        │   ├── MemberLayout.jsx # Member Portal Layout
        │   └── StaffLayout.jsx  # Staff & Admin Console Layout
        ├── routes/
        │   ├── ProtectedRoute.jsx # RBAC Role-Based Route Guard with Loading State
        │   └── AppRoutes.jsx      # Central Routing Tree
        └── pages/
            ├── public/            # HomePage, BookCatalogPage, BookDetailPage
            ├── auth/              # LoginPage with Quick Sign-In
            ├── member/            # MemberDashboard, MemberBorrowsPage, MemberReservationsPage, MemberFinesPage, Profile
            ├── staff/             # StaffDashboard, StaffBooksPage, StaffBorrowingsPage, StaffReservationsPage, Fines, Members, Reports, AuditLogs
            └── errors/            # NotFoundPage (404), UnauthorizedPage (403)
```

---

## 🚀 วิธีรันระบบ (Getting Started)

### 1. ตั้งค่า Environment Variables

```bash
# คัดลอก template และแก้ไขค่าตามต้องการ
cp .env.example .env
```

### 2. Build & Start Containers

```bash
# Build image และเริ่มรันทุก container ใน background
docker compose up --build -d

# หรือเริ่มรันโดยไม่ต้อง build ใหม่ (กรณีเคย build แล้ว)
docker compose up -d
```

### 3. ตรวจสอบสถานะ

```bash
# ดูสถานะ containers ทั้งหมด
docker compose ps

# Health Check API
curl http://localhost:5001/api/v1/health
```

---

## 🔍 การดู Logs (Monitor & Logs)

```bash
# ดู logs แบบ real-time ทั้งหมด
docker compose logs -f

# ดู logs เฉพาะ service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

---

## 🛑 หยุดการทำงาน (Stop Containers)

```bash
# หยุดการทำงาน (ข้อมูลใน Volume ยังคงอยู่)
docker compose down

# หยุดและลบ Volume ทั้งหมด (รีเซ็ตฐานข้อมูลใหม่)
docker compose down -v
```

---

## 🔄 รีสตาร์ต Service เฉพาะจุด

```bash
docker compose restart backend
docker compose restart frontend
```

---

## 💻 เข้า Shell ภายใน Container

```bash
docker compose exec backend sh
docker compose exec frontend sh

# เข้า MySQL CLI
docker compose exec db mysql -u root -p library_db
```

---

## 🔑 ข้อมูลการเข้าใช้งาน (Default Credentials)

| URL | คำอธิบาย |
| :--- | :--- |
| [http://localhost:5173](http://localhost:5173) | Frontend App (Welcome Page) |
| [http://localhost:5001/api/v1/health](http://localhost:5001/api/v1/health) | Backend Health Check API |
| [http://localhost:8081](http://localhost:8081) | phpMyAdmin |

### 👤 Default User Accounts (Phase 4 API)

| Role | Username / Email | Password | รายละเอียด |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` / `admin@library.local` | `Admin@1234` | สิทธิ์สูงสุด จัดการระบบ ผู้ใช้ และนโยบาย |
| **Librarian** | `librarian01` / `librarian01@library.local` | `Lib@1234` | เจ้าหน้าที่บรรณารักษ์ จัดการหนังสือ ยืม-คืน |
| **Member** | `member01` / `member01@library.local` | `Member@1234` | สมาชิกห้องสมุด (สมชาย ใจดี, MBR-2026-00001) |

**phpMyAdmin Login:**
- **Server:** `db`
- **Username:** `library_user` (หรือ `root`)
- **Password:** ดูจาก `.env` (`MYSQL_PASSWORD` หรือ `MYSQL_ROOT_PASSWORD`)
- **Database:** `library_db`

**MySQL Direct (จากเครื่อง Host):** `localhost:3307`

---

## 📝 Notes สำหรับ Developer

- `DB_HOST` ต้องเป็น `db` (Docker service name) เสมอเมื่อรันใน Container
- เมื่อแก้ไข `package.json` ต้อง rebuild: `docker compose up --build -d`
- Hot Reload ทำงานอัตโนมัติเมื่อแก้ไขไฟล์ `.js/.jsx/.css` โดยไม่ต้อง rebuild
- อย่า commit ไฟล์ `.env` ขึ้น Git เด็ดขาด
