# Project Structure & Docker Architecture: Online Library Management System

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `09-project-docker-architecture.md`  
**Phase:** Phase 1 — Planning Only (Step 9: Project & Docker Architecture)  
**Status:** Under Review  
**Date:** 2026-08-28  

---

## 1. Purpose
เอกสารฉบับนี้จัดทำขึ้นเพื่อกำหนดโครงสร้างไดเรกทอรีของโปรเจกต์ (Repository Directory Structure), สถาปัตยกรรมคอนเทนเนอร์ (Container Architecture), การจำลองสภาพแวดล้อมการพัฒนา (Development Environment ด้วย Docker Compose), กลยุทธ์การเชื่อมต่อเครือข่ายและจัดเก็บข้อมูล (Network & Volume Strategy), การจัดการตัวแปรสภาพแวดล้อม (Environment Variables), และการออกแบบสถาปัตยกรรมการส่งมอบระบบสู่ Production (Deployment Architecture) ทั้งบน **Railway (Single-Container Multi-Stage Build)** และ **On-Premise (Nginx Reverse Proxy)** เพื่อให้ระบบมีความยืดหยุ่นสูง (Portable) ปลอดภัย และพร้อมสำหรับการพัฒนาในทุกแพลตฟอร์ม

---

## 2. Reference Documents
เอกสารที่ใช้อ้างอิงร่วมในการออกแบบสถาปัตยกรรม:
1. `docs/planning/01-system-overview.md` ถึง `08-dashboard-report-notification.md`
2. `docs/planning/00-tech-stack-decision.md` — การตัดสินใจเลือก React 18, Node.js 20, MySQL 8, Docker
3. `docs/planning/00-ai-working-rules.md` — กติกาการจัดการ Docker และ Port Mapping
4. `docs/planning/00-git-workflow.md` — กติกาการจัดเก็บไฟล์และการป้องกัน Secret รั่วไหล

---

## 3. Project Architecture Overview
ระบบถูกออกแบบภายใต้หลักการ **Decoupled Development & Unified Production**:
- **ช่วงการพัฒนา (Development):** แยกการทำงานออกเป็น 4 Services อิสระ (`frontend`, `backend`, `db`, `phpmyadmin`) บน Custom Docker Bridge Network พร้อมระบบ Hot Reload และ Persistent Volumes
- **ช่วงการส่งมอบ (Production Target A - Railway):** รวม Frontend และ Backend เข้าสู่ Application Image เดียวกันผ่าน Multi-Stage Docker Build โดย Backend Express จะทำหน้าที่ Serve Static Files (`./public`) และให้บริการ REST API (`/api/v1`)
- **ช่วงการส่งมอบ (Production Target B - On-Premise Alternative):** ใช้งาน Application Image เดียวกันกับ Railway แต่มี Nginx Reverse Proxy ทำหน้าที่กระจาย Traffic และจัดการ SSL Termination

---

## 4. Repository Directory Structure

```text
Online_LibraryManagementSystem/
├── .agents/                               # Antigravity IDE Skills & Custom Rules
│    └── skills/
│         └── online-library-dev/
│              └── SKILL.md
├── docs/                                  # Project Documentation
│    ├── planning/                         # System Architecture & Planning Specs
│    ├── testing/                          # Test Plans & Test Cases
│    └── deployment/                       # Deployment Guides & Checklists
├── frontend/                              # Frontend Application (React 18 + Vite 5 + MUI 5)
│    ├── public/                           # Static Assets (Favicon, Logo)
│    ├── src/                              # Source Code
│    │    ├── assets/                      # Images, Icons
│    │    ├── components/                  # Reusable UI Components
│    │    ├── contexts/                    # React Contexts (Auth, Notification)
│    │    ├── hooks/                       # Custom Hooks
│    │    ├── layouts/                     # Layout Components (Public, Member, Staff)
│    │    ├── pages/                       # Page Components (ตาม 07-frontend-pages.md)
│    │    ├── routes/                      # Route Definitions & Protected Route Guards
│    │    ├── services/                    # API Client & Service Modules (Axios)
│    │    ├── utils/                       # Helpers & Formatters
│    │    ├── App.jsx                      # Root Application Component
│    │    └── main.jsx                     # Application Entry Point
│    ├── index.html                        # HTML Entry Template
│    ├── package.json                      # Frontend Dependencies
│    └── vite.config.js                    # Vite Configuration
├── backend/                               # Backend Application (Node.js 20 LTS + Express 4)
│    ├── src/
│    │    ├── config/                      # Database, JWT & Environment Configs
│    │    ├── controllers/                 # Request Handlers & Business Presentation
│    │    ├── middlewares/                 # Auth, RBAC, Validation & Error Middlewares
│    │    ├── models/                      # Database Access & Query Modules (MySQL)
│    │    ├── routes/                      # API Route Definitions (ตาม 06-api-contract.md)
│    │    ├── services/                    # Core Business Logic & Calculations
│    │    ├── utils/                       # Helper Functions (Logger, Date, Response Helper)
│    │    └── server.js                    # Backend Server Entry Point (Port 5001)
│    ├── package.json                      # Backend Dependencies
│    └── nodemon.json                      # Nodemon Hot Reload Config
├── db/                                    # Database Initialization Scripts
│    └── init/                             # SQL Scripts for InitDB Container
│         ├── 01-schema.sql                # Table Schemas (ตาม 05-database-design.md)
│         └── 02-seed.sql                  # Initial Roles, Admin User, Master Data
├── nginx/                                 # Nginx Reverse Proxy Config (For Target B)
│    └── default.conf                      # Nginx Server Block Configuration
├── Dockerfile                             # Root Multi-Stage Dockerfile (For Production)
├── docker-compose.yml                     # Local Development Compose Configuration
├── docker-compose.prod.yml                # On-Premise Production Compose Configuration
├── railway.toml                           # Railway Deployment Configuration
├── .env.example                           # Template Environment Variables
├── .gitignore                             # Git Ignore Rules
└── README.md                              # Project Master Documentation
```

---

## 5. Frontend Internal Structure Guidelines
- **`layouts/`:** จัดการโครงร่างหน้าจอ 3 แบบ (`PublicLayout`, `MemberLayout`, `StaffLayout`)
- **`pages/`:** จัดหมวดหมู่หน้าจอตามโดเมน (เช่น `pages/auth/`, `pages/books/`, `pages/circulation/`, `pages/admin/`)
- **`services/api.js`:** รวมศูนย์การตั้งค่า Axios Interceptor สำหรับแนบ `Bearer JWT` และดักจับ Error 401/403

---

## 6. Backend Internal Layered Architecture
Backend ถูกจัดโครงสร้างแบบ **Separation of Concerns (SoC)**:
- **`server.js`:** จุดเริ่มต้นของระบบ (Entry Point) ทำหน้าที่กำหนดค่า Express App, Middlewares (CORS, Helmet, Body Parser), Routing, และเริ่มต้น Listen Port `5001`
- **`routes/`:** กำหนด Endpoints และผูก Middleware (Auth/Validation) ก่อนส่งต่อให้ Controller
- **`controllers/`:** รับ Request ตรวจสอบ Input ส่งต่องานให้ Service และจัดรูปแบบ Response Standard
- **`services/`:** หัวใจของ Business Logic (การคำนวณค่าปรับ, ตรวจสอบสต็อก, จัดการคิวจอง, Background Schedulers)
- **`models/`:** เชื่อมต่อและรันคำสั่ง SQL กับฐานข้อมูล MySQL ผ่าน Connection Pool
- **`middlewares/`:** ตรวจสอบความปลอดภัย (`authGuard`, `roleGuard`), ตรวจจับ Error กลาง (`errorHandler`)

---

## 7. Database Directory Structure
- **`db/init/`:** เป็นไดเรกทอรีที่เก็บไฟล์ SQL เริ่มต้น ซึ่งจะถูก Mount เข้าไปยัง `/docker-entrypoint-initdb.d` ของ MySQL Container
- **ไฟล์ภายใน:**
  - `01-schema.sql`: สร้างตารางทั้ง 15 ตาราง ดัชนี และ Foreign Keys
  - `02-seed.sql`: กำหนดบทบาท (`roles`), สิทธิ์ (`permissions`), ผู้ดูแลระบบเริ่มต้น (`admin`), และหมวดหมู่หนังสือเริ่มต้น

---

## 8. Docker Development Architecture
สถาปัตยกรรม Container ในช่วง Local Development ประกอบด้วย 4 Services ที่ทำงานร่วมกัน:

```text
[ Host Machine (Developer Browser) ]
  │
  ├── Port 5173 ────────► [ Frontend Container (Vite Dev Server) ]
  ├── Port 5001 ────────► [ Backend Container (Express + Nodemon) ]
  ├── Port 8081 ────────► [ phpMyAdmin Container (Database GUI) ]
  └── Port 3307 ────────► [ MySQL 8 Container (Database Engine) ]
                                ▲
                                │ (Internal Docker Bridge Network: "library-net")
                                ├── Backend ────► db:3306
                                └── phpMyAdmin ──► db:3306
```

---

## 9. Docker Service Specifications (Development)

| Service Name | Base Image | Container Port | Host Port | บทบาทหน้าที่ | Dependencies |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **`frontend`** | `node:20-alpine` | `5173` | `5173` | ให้บริการ Vite Dev Server พร้อม Hot Module Replacement (HMR) | `backend` |
| **`backend`** | `node:20-alpine` | `5001` | `5001` | ให้บริการ RESTful API และรัน Scheduled Jobs | `db` (`service_healthy`) |
| **`db`** | `mysql:8.0` | `3306` | `3307` | เก็บรักษาฐานข้อมูล MySQL (InnoDB, `utf8mb4`) | - |
| **`phpmyadmin`**| `phpmyadmin:latest` | `80` | `8081` | เครื่องมือ GUI จัดการฐานข้อมูลผ่านเว็บเบราว์เซอร์ | `db` |

---

## 10. Port Mapping Standards

| Service | Host Port | Container Port | เหตุผลในการเลือก Port |
| :--- | :---: | :---: | :--- |
| **Frontend** | `5173` | `5173` | พอร์ตมาตรฐานของ Vite Development Server |
| **Backend** | `5001` | `5001` | เลี่ยงพอร์ต `5000` ของ macOS AirPlay Receiver และพอร์ต `3000` ทั่วไป |
| **MySQL** | `3307` | `3306` | เลี่ยงพอร์ต `3306` กรณี Host มี MySQL Server ติดตั้งอยู่เดิมในเครื่อง |
| **phpMyAdmin** | `8081` | `80` | พอร์ตมาตรฐานสำหรับ Web Tool ช่วงการพัฒนา |

---

## 11. Docker Network Architecture
- **Network Name:** `library-net` (Custom Bridge Network)
- **การสื่อสารระหว่าง Containers:**
  - Backend เชื่อมต่อ Database ผ่าน Hostname `db` และพอร์ตภายใน `3306` (`mysql://user:pass@db:3306/library_db`)
  - phpMyAdmin เชื่อมต่อ Database ผ่าน Server Name `db` และพอร์ต `3306`
  - **ข้อห้ามเด็ดขาด:** ห้ามใช้ `localhost` หรือ Host Port `3307` ในการเชื่อมต่อระหว่าง Container ภายใน Docker Network

---

## 12. Volume Strategy

### 12.1 Persistent Data Volume
- **`mysql_data` (Named Volume):** Mount เข้าไปยัง `/var/lib/mysql` เพื่อเก็บรักษาข้อมูลของฐานข้อมูลไว้อย่างถาวร แม้ Container จะถูกสั่ง Recreate หรือ Restart ข้อมูลจะไม่สูญหาย

### 12.2 Development Bind Mounts
- **Frontend Source:** Bind Mount `./frontend:/app` เพื่อให้ Vite ตรวจจับการเปลี่ยนแปลงโค้ดและทำ Hot Reload
- **Backend Source:** Bind Mount `./backend:/app` เพื่อให้ Nodemon ตรวจจับการเปลี่ยนแปลงโค้ดและ Restart Server
- **Database Init:** Bind Mount `./db/init:/docker-entrypoint-initdb.d:ro` (Read-only)

### 12.3 Anonymous Volume สำหรับ `node_modules`
- **กลยุทธ์:** ใช้ Anonymous Volume สำหรับ `/app/node_modules` ทั้งใน `frontend` และ `backend`
- **เหตุผล:**
  1. ป้องกันไม่ให้ `node_modules` จาก Host เข้าไปทับ `node_modules` ที่ถูก Build ภายใน Linux Container
  2. ป้องกันปัญหา Native Binary Mismatch (โดยเฉพาะกรณีโฮสต์เป็น macOS Apple Silicon หรือ Windows)
  3. เพิ่มความเร็วในการ I/O ของ Container

---

## 13. Environment Variables Strategy

### 13.1 `.env.example` Template
```env
# Server Configuration
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Database Configuration (Docker Internal)
DB_HOST=db
DB_PORT=3306
DB_USER=library_user
DB_PASSWORD=library_password
DB_NAME=library_db
MYSQL_ROOT_PASSWORD=root_password

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

### 13.2 กฎความปลอดภัยของ Environment Variables
- ห้าม Commit ไฟล์ `.env` จริงขึ้นสู่ Git Repository เด็ดขาด
- ใน Docker Compose ให้ใช้ตัวแปรแบบ `${VARIABLE:-default_value}` เพื่อความยืดหยุ่น
- บน Production (Railway) ให้ตั้งค่าตัวแปรผ่าน Railway Variables Dashboard

---

## 14. Database Connection Strategy
- **Backend Connection Pool:** ใช้ `mysql2/promise` สร้าง Connection Pool (กำหนด `connectionLimit: 10`, `waitForConnections: true`)
- **Host Resolution:**
  - Local Container: `DB_HOST=db`, `DB_PORT=3306`
  - Host Tool (DBeaver / DataGrip บนเครื่อง Host): `Host=localhost`, `Port=3307`
  - Production (Railway): อ่านค่าจาก Environment Variable `MYSQLHOST` / `MYSQLPORT`

---

## 15. Frontend-Backend Communication
1. **Local Development:**
   - เบราว์เซอร์ของผู้ใช้รันที่ `http://localhost:5173`
   - Frontend เรียก API ไปยัง Backend ที่ `http://localhost:5001/api/v1`
2. **Production (Railway Single Container):**
   - เบราว์เซอร์เข้าสู่ระบบที่ `https://your-app.railway.app`
   - Frontend เรียก API ภายใต้ Same Origin ที่ `/api/v1` (ไม่ต้องระบุ Hostname)
3. **Production (On-Premise via Nginx):**
   - เบราว์เซอร์เข้าสู่ระบบที่ `https://library.yourdomain.com`
   - Nginx ทำหน้าที่ Route `/api/v1` ไปยัง Backend และ Route `/` ไปยัง Static Files

---

## 16. CORS (Cross-Origin Resource Sharing) Strategy
- **Development:** ตั้งค่า Express CORS Middleware ให้อนุญาต Origin `http://localhost:5173` พร้อม `credentials: true`
- **Production (Railway):** เนื่องจาก Frontend และ Backend อยู่บน Origin เดียวกัน สามารถปิดหรือจำกัด CORS ให้เฉพาะเจาะจงได้
- **ข้อห้าม:** ห้ามเปิด `origin: "*"` ร่วมกับ `credentials: true` ในระดับ Production

---

## 17. Health Check Strategy
- **MySQL Healthcheck:** กำหนดคำสั่ง `mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD` ใน Container `db` (ความถี่ `interval: 10s`, `timeout: 5s`, `retries: 5`)
- **Backend Dependency:** กำหนด `depends_on: { db: { condition: service_healthy } }` ใน `backend` service เพื่อให้มั่นใจว่า Backend จะไม่เริ่มทำงานจนกว่า MySQL จะพร้อมรับ Connection อย่างสมบูรณ์

---

## 18. Hot Reload Strategy
- **Frontend (Vite HMR):** ใช้ WebSocket พอร์ต `5173` ส่งข้อมูล Component Update ไปยังเบราว์เซอร์ทันทีที่บันทึกไฟล์
- **Backend (Nodemon):** ตรวจจับการเปลี่ยนแปลงไฟล์ใน `backend/src/` และทำการ Restart Process ภายใน 1 วินาที โดยไม่ทำให้ Container ดับ

---

## 19. Dependency Management & Container Rebuild
- **เมื่อมีการแก้ไขโค้ดธรรมดา (`.js`, `.jsx`, `.css`):** ไม่ต้อง Rebuild Container (Hot Reload ทำงานอัตโนมัติ)
- **เมื่อมีการติดตั้ง Dependency ใหม่ (`package.json`):** ต้องสั่ง `docker compose down` และ `docker compose up --build` เพื่อให้ Container ติดตั้ง Package ลงใน Anonymous Volume ใหม่

---

## 20. Production Architecture — Target A: Railway (Single-Container)

```text
[ Internet / Users ]
          │
          ▼ (HTTPS Request)
[ Railway Load Balancer / SSL Termination ]
          │
          ▼
[ Single Container Instance (Node.js 20 Runtime) ]
  ├── Express Web Server (Port $PORT จาก Railway)
  │     ├── Static File Server ──► Serve /app/public (React Build Output)
  │     └── API Router ──────────► Handle /api/v1/*
  │
  └── Database Connection (TCP) ──► [ Railway Managed MySQL Service ]
```

### Multi-Stage Dockerfile Strategy (Root `Dockerfile`)
1. **Stage 1 (Frontend Builder):** ใช้ `node:20-alpine` ติดตั้ง Dependencies และรัน `npm run build` ใน `frontend/` ได้ผลลัพธ์เป็น Static Files ใน `dist/`
2. **Stage 2 (Backend Production):** ใช้ `node:20-alpine` ติดตั้ง Production Dependencies (`--omit=dev`) ใน `backend/`
3. **Stage 3 (Final Runner):** คัดลอก Backend Code, Production Node Modules, และคัดลอกไฟล์ Frontend Build จาก Stage 1 มาไว้ที่ `./public` ของ Backend จากนั้นรัน `node src/server.js`

---

## 21. Production Architecture — Target B: On-Premise (Nginx Reverse Proxy)

```text
[ Internet / Local Network ]
          │
          ▼ (Port 80/443)
[ Nginx Reverse Proxy Container ]
  ├── Route "/" ────────► Serve Static Files (or Forward to App)
  └── Route "/api" ─────► Forward to [ Backend Container:5001 ]
                                             │
                                             ▼
                                [ MySQL Container:3306 ] (Persistent Volume)
```

- ใช้ `docker-compose.prod.yml` และคอนฟิก `nginx/default.conf` ในการ Deploy
- ใช้ Application Image ตัวเดียวกันกับที่ใช้บน Railway

---

## 22. Deployment Portability
ระบบถูกออกแบบให้ **Cloud-Agnostic**:
- ซอร์สโค้ดไม่มีการเรียกใช้ Cloud-specific SDK (เช่น AWS SDK หรือ Railway API) ภายใน Business Logic
- การสลับ Deployment Target ทำได้โดยการเปลี่ยน Configuration ไฟล์ (`railway.toml` vs `docker-compose.prod.yml`) เท่านั้น

---

## 23. File Upload Architecture
- **ขอบเขตในปัจจุบัน:** สำหรับรูปหน้าปกหนังสือ (`cover_image_url`) จะรับเป็น URL String ภายนอกเป็นหลัก
- **แนวทางรองรับการอัปโหลดไฟล์จริงในอนาคต:**
  - Railway Container Filesystem มีลักษณะเป็น **Ephemeral (ข้อมูลหายเมื่อ Container Restart)**
  - หากต้องการเปิดใช้การอัปโหลดไฟล์จริง ต้องกำหนดให้จัดเก็บไฟล์บน **Railway Persistent Volume Mount** หรือเชื่อมต่อไปยัง **S3-Compatible Object Storage** (ห้ามเก็บไฟล์ลงใน Local Container Filesystem โดยตรง)

---

## 24. Security Considerations
1. **Non-Root Execution:** รันแอปพลิเคชัน Node.js ภายใต้ User `node` ใน Production Container
2. **Least Privilege Network:** แยกพอร์ตฐานข้อมูล `3306` ให้อยู่เฉพาะใน Docker Network ภายใน (ไม่เปิด Public บน Production)
3. **Security Headers:** ติดตั้ง `helmet` ใน Express เพื่อป้องกัน Clickjacking, XSS, และ MIME-type Sniffing
4. **Environment Isolation:** แยก Secret ของ Development ออกจาก Production ชัดเจน

---

## 25. Performance Considerations
- **Alpine Linux Images:** ใช้ Base Image `alpine` เพื่อลดขนาด Image Size ให้ต่ำกว่า 200MB ทำให้การ Deploy บน Railway รวดเร็ว
- **Gzip / Compression:** ติดตั้ง Compression Middleware บน Express เพื่อบีบอัดข้อมูล JSON Payload และ Static Assets

---

## 26. Architecture Risks & Mitigation Strategies

| ความเสี่ยงเชิงสถาปัตยกรรม (Risk) | ผลกระทบ | มาตรการป้องกัน (Mitigation) |
| :--- | :--- | :--- |
| **Port Conflict บนเครื่องพัฒนา** | รัน Container ไม่ขึ้น | ย้าย MySQL Host Port ไป `3307` และ Backend ไป `5001` |
| **Apple Silicon (M1/M2/M3/M4) Incompatibility** | Build Image ไม่ผ่าน | กำหนด `platform: linux/amd64` เฉพาะ Service `phpmyadmin` |
| **Database Startup Race Condition** | Backend Crash ตอนเริ่มต้น | บังคับใช้ `depends_on: { condition: service_healthy }` |
| **Data Loss เมื่อลบ Container** | ข้อมูลห้องสมุดสูญหาย | กำหนด Named Volume `mysql_data` จัดเก็บข้อมูลถาวร |
| **Host node_modules Mismatch** | คำสั่งใน Container พัง | ใช้ Anonymous Volume `/app/node_modules` แยกอิสระ |

---

## 27. Open Questions (ประเด็นสถาปัตยกรรมที่ต้องการการยืนยัน)

| ID | ประเด็นคำถามเชิงสถาปัตยกรรม | ส่วนที่ได้รับผลกระทบ | ผลกระทบ | ลำดับความสำคัญ |
| :--- | :--- | :--- | :---: | :---: |
| **OQ-INFRA-001**| บน Railway Production จะใช้งาน Railway Managed MySQL Plugin หรือรัน MySQL Container แยกเอง? | Production DB | High | High |
| **OQ-INFRA-002**| ในอนาคตต้องการให้ระบบรองรับการอัปโหลดไฟล์รูปภาพหน้าปกหนังสือขึ้น Cloud Storage (S3/Cloudinary) หรือไม่? | File Storage | Medium | Medium |
| **OQ-INFRA-003**| สำหรับ On-Premise Deployment มีการเตรียม SSL Certificate (Let's Encrypt / Custom SSL) สำหรับ Nginx หรือไม่? | Nginx Config | Low | Low |

---

## 28. Assumptions
1. สภาพแวดล้อมการพัฒนาของ Developer มีการติดตั้ง Docker Desktop หรือ Docker Engine พร้อม Docker Compose v2 ขึ้นไป
2. ระบบ Backend ทำหน้าที่ Serve Static Files ของ Frontend เมื่อทำงานบน Production (Single-Container Mode)
3. ตัวแปรสภาพแวดล้อมทั้งหมดจะถูกจ่ายผ่าน `.env` ในช่วง Dev และผ่าน Platform Environment Variables ในช่วง Production

---

## 29. Validation Checklist Report
- [x] **อ่านเอกสาร Planning `01` ถึง `08` ครบถ้วน:** สอดคล้องกับ Requirements, Roles, Workflows, Database, API, และ Frontend
- [x] **Backend Entry Point ถูกต้อง:** กำหนดเป็น `backend/src/server.js`
- [x] **Database Initialization Directory ถูกต้อง:** กำหนดเป็น `db/init/`
- [x] **Development Ports ถูกต้องตามเกณฑ์:** Frontend (5173), Backend (5001), MySQL (3307->3306), phpMyAdmin (8081->80)
- [x] **Docker Network ชัดเจน:** กำหนด Custom Bridge Network และการเชื่อมต่อผ่าน Service Name `db:3306`
- [x] **Healthcheck & Dependencies ครบ:** MySQL มี Healthcheck และ Backend รอ `service_healthy`
- [x] **Volume Strategy ชัดเจน:** มี Named Volume สำหรับ MySQL Data และ Anonymous Volume สำหรับ `node_modules`
- [x] **Production Strategy ครอบคลุม 2 Targets:** รองรับทั้ง Railway (Single-Container) และ On-Premise (Nginx)
- [x] **ไม่มี Code / Dockerfile / Compose Implementation จริง:** เป็น Architecture Blueprint Specification
- [x] **ไม่มีการเปลี่ยน Tech Stack / ไม่เพิ่ม Feature ใหม่:** ยึดตามขอบเขตที่ได้รับอนุมัติ

---

## 30. Summary
เอกสาร **Project Structure & Docker Architecture** ฉบับนี้ได้กำหนดโครงสร้างโฟลเดอร์ของโปรเจกต์ สถาปัตยกรรมคอนเทนเนอร์ 4 Services สำหรับ Development และ Multi-Stage Single-Container สำหรับ Production บน Railway พร้อมทั้งวางกลยุทธ์ด้าน Network, Volume, Security, และ Portability ไว้อย่างสมบูรณ์ เอกสารนี้พร้อมนำไปใช้เป็นรากฐานสำหรับ **PROJECT_CONTEXT.md** และ **10-implementation-plan.md** เพื่อเตรียมความพร้อมสู่ Implementation Phase ต่อไป
