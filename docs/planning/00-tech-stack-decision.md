# Tech Stack Decision & Architecture Blueprint
**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `00-tech-stack-decision.md`  
**Phase:** Phase 0 — Technical Guidelines & Context Setup  
**Status:** Approved  

---

## 1. Project Name
**Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)**

---

## 2. Purpose of the System
ระบบเว็บแอปพลิเคชันสำหรับการบริหารจัดการงานห้องสมุดแบบครบวงจร เพื่ออำนวยความสะดวกให้แก่สมาชิกในการค้นหา ยืม คืน และจองหนังสือ พร้อมทั้งสนับสนุนการปฏิบัติงานของเจ้าหน้าที่และผู้ดูแลระบบในการจัดการทรัพยากรหนังสือ สมาชิก ติดตามสถานะการยืม-คืน คำนวณค่าปรับ และการแจ้งเตือนต่างๆ ให้เป็นไปอย่างมีประสิทธิภาพและถูกต้องแม่นยำ

---

## 3. Initial System Scope
ขอบเขตการทำงานเบื้องต้นของระบบครอบคลุมฟังก์ชันหลักดังต่อไปนี้:
* **การค้นหาและเข้าถึงข้อมูล:** ค้นหาหนังสือ และดูรายละเอียดหนังสือ
* **ธุรกรรมการยืม-คืน-จอง:** 
  * ยืมหนังสือ
  * คืนหนังสือ
  * จองหนังสือ
  * ติดตามสถานะการยืมและการจอง
  * ดูประวัติการยืม-คืน
* **การแจ้งเตือนและค่าปรับ:**
  * แจ้งเตือนวันครบกำหนดคืนหนังสือ
  * แจ้งเตือนหนังสือเกินกำหนด
  * แจ้งเตือนเมื่อหนังสือที่จองพร้อมให้ยืม
  * คำนวณค่าปรับจากการคืนหนังสือเกินกำหนด
* **การบริหารจัดการทรัพยากรและผู้ใช้:**
  * จัดการหนังสือ (ข้อมูลหนังสือ, รายการเล่ม)
  * จัดการหมวดหมู่หนังสือ
  * จัดการสมาชิก
  * Admin จัดการข้อมูลหลักของระบบ (System Master Data & Configurations)

---

## 4. Initial User Roles
ขอบเขตระดับสูงของผู้ใช้งานในระบบแบ่งออกเป็น 3 กลุ่ม:

1. **Member (สมาชิกห้องสมุด):**
   * ค้นหาและดูรายละเอียดหนังสือ
   * ทำรายการยืม คืน และจองหนังสือ
   * ตรวจสอบสถานะการยืม-คืน-จอง และประวัติของตนเอง
   * รับการแจ้งเตือน (เตือนครบกำหนด, เตือนเกินกำหนด, หนังสือจองพร้อมยืม)
   * ตรวจสอบยอดค่าปรับคงค้าง (ถ้ามี)

2. **Librarian (เจ้าหน้าที่ห้องสมุด):**
   * ตรวจสอบและดำเนินการยืม-คืน-จองหนังสือให้แก่สมาชิก
   * จัดการข้อมูลหนังสือและหมวดหมู่หนังสือ
   * ติดตามสถานะหนังสือค้างส่งและตรวจสอบการคิดค่าปรับ
   * ตรวจสอบและจัดการคิวการจองหนังสือ

3. **Admin (ผู้ดูแลระบบ):**
   * บริหารจัดการบัญชีผู้ใช้งานและกำหนดสิทธิ์ (สมาชิก และ เจ้าหน้าที่)
   * จัดการข้อมูลหลักของระบบ (Master Data และ System Configuration)
   * กำหนดค่าระบบ (เช่น กฎเกณฑ์การยืม อัตราค่าปรับ ระยะเวลาการยืม)

---

## 5. Selected Tech Stack

| Layer / Component | Technology | Specification / Version |
| :--- | :--- | :--- |
| **Frontend Framework** | React | React 18 |
| **Frontend Build Tool** | Vite | Vite 5 |
| **UI Component Library** | Material-UI (MUI) | MUI 5 |
| **Backend Runtime** | Node.js | Node.js 20 LTS |
| **Backend Framework** | Express | Express 4 |
| **Database** | MySQL | MySQL 8.0 (InnoDB, `utf8mb4`) |
| **Dev Environment** | Docker | Docker Compose (Compose Spec v2) |
| **Dev Database Tool** | phpMyAdmin | Latest (`platform: linux/amd64`) |
| **Production Target** | Railway | Single-container multi-stage build |

---

## 6. Reason for Each Technology

* **React 18:** รองรับ Component-based Architecture, มี Ecosystem กว้างขวาง, รองรับ Concurrent Features ช่วยให้ UI มีความลื่นไหลและตอบสนองได้รวดเร็ว
* **Vite 5:** เครื่องมือ Build & Dev Server ที่มีประสิทธิภาพสูง รองรับ Hot Module Replacement (HMR) รวดเร็วระดับมิลลิวินาที ทำให้ประสบการณ์การพัฒนา (DX) มีประสิทธิภาพสูง
* **MUI 5 (Material UI):** มีชุด Component มาตรฐานระดับองค์กรครบถ้วน รองรับระบบ Theming, Typography, Responsive Grid และ Accessibility ช่วยลดระยะเวลาในการออกแบบและสร้าง UI ให้สวยงามเป็นมาตรฐาน
* **Node.js 20 LTS:** แพลตฟอร์มที่เสถียร มีการสนับสนุนระยะยาว (Long-Term Support) เหมาะสำหรับ I/O-bound Application และทำงานร่วมกับ JavaScript/JSON ได้อย่างเป็นธรรมชาติ
* **Express 4:** เว็บเฟรมเวิร์กที่เรียบง่าย ยืดหยุ่น มีเสถียรภาพสูง มี Middleware ในการจัดการ Request/Response ครบครัน และเรียนรู้ได้ง่าย
* **MySQL 8.0:** Relational Database Management System (RDBMS) ที่รองรับ ACID Transactions เหมาะสำหรับระบบที่ต้องการความถูกต้องแม่นยำสูง เช่น การยืม-คืน การตัดสต็อกหนังสือ และการคำนวณค่าปรับ พร้อมรองรับ Full Unicode (`utf8mb4`)
* **Docker Compose (Dev):** ควบคุมและจำลองสภาพแวดล้อมการพัฒนาให้เหมือนกันทุกเครื่อง (Reproducibility) แยก Container ชัดเจนระหว่าง App, Database และ Database Management Tool
* **phpMyAdmin (Dev):** เครื่องมือ GUI สำหรับจัดการฐานข้อมูล MySQL ในช่วงการพัฒนา ช่วยให้ทีมตรวจสอบ Schema และ Seed Data ได้สะดวก
* **Railway (Production Deployment Target):** PaaS ที่รองรับ Dockerfile Deployment โดยอัตโนมัติ จัดการ SSL Termination, Domain และ Continuous Deployment ได้ง่าย ไม่ต้องดูแล Infrastructure หนัก

---

## 7. Development Environment
* **Frontend:**
  * ใช้ Vite รันบน Port `5173` รองรับ Hot Module Replacement (HMR)
  * คอนฟิก Server ให้ผูกกับ Host `0.0.0.0` เพื่อให้เรียกใช้งานผ่าน Container ได้
* **Backend:**
  * ใช้ Express รันบน Port `5001` (เลี่ยง Port `5000` ของ macOS AirPlay Receiver)
  * ใช้ `nodemon` รองรับ Hot Reload เมื่อมีการแก้ไขโค้ด
* **Database & Tool:**
  * MySQL 8.0: ภายใน Container ใช้ Port `3306` และ Map ออกมายัง Host ที่ Port `3307`
  * phpMyAdmin: ภายใน Container ใช้ Port `80` และ Map ออกมายัง Host ที่ Port `8081`
* **Docker Setup Rules:**
  * ใช้ Bind Mounts สำหรับโฟลเดอร์ Source Code ของ Frontend และ Backend เพื่อความสามารถในการ Hot Reload
  * ใช้ Anonymous Volume สำหรับ `node_modules` (`/app/node_modules`) เพื่อป้องกัน Host overwrite
  * ทุก Service เชื่อมต่อกันผ่าน Custom Docker Bridge Network
  * Backend และ phpMyAdmin เชื่อมต่อไปยัง Database โดยใช้ชื่อ Service `db` ที่ Port `3306` (ห้ามใช้ `localhost`)
  * Database มี Healthcheck (`mysqladmin ping`) และ Service อื่นรอความพร้อมด้วย `depends_on` + `condition: service_healthy`
  * ใช้ SQL Init Script ในโฟลเดอร์ `db/init/01-init.sql` โดยใช้ Charset `utf8mb4` และ Collation `utf8mb4_unicode_ci`

---

## 8. Production Environment
* **Deployment Target:** Railway เป็นเป้าหมายหลัก
* **Single-Container Multi-Stage Architecture:**
  * ใช้ Root `Dockerfile` แบบ Multi-Stage Build
  * **Stage 1 (Frontend Build):** Build React App เป็น Static Files (HTML, JS, CSS)
  * **Stage 2 (Backend Production):** เตรียม Node.js Production Dependencies และ Source Code
  * **Stage 3 (Final Runner):** คัดลอก Static Assets จาก Frontend มาไว้ใน Backend เพื่อให้ Express ทำหน้าที่ Serve Static Files และ API ร่วมกันใน Container เดียว (Single Container) โดยไม่ต้องพึ่งพา Nginx แยก
* **Network & SSL:** Railway ให้บริการ Reverse Proxy และ SSL/TLS Certificate อัตโนมัติ
* **On-Premise / Ubuntu Compatibility:** Container Image เดียวกันนี้สามารถนำไปรันบนเซิร์ฟเวอร์ On-Premise หรือ VM ร่วมกับ MySQL และ Nginx Reverse Proxy ได้ โดยไม่มีการผูกโค้ดเข้ากับ Cloud Provider ใดโดยเฉพาะ
* **Data & File Storage Constraint:** ระบบ Filesystem ของ Railway มีลักษณะเป็น **Ephemeral** (ข้อมูลจะหายไปเมื่อ Container รีสตาร์ตหรือ Deploy ใหม่) ดังนั้นหากมีฟีเจอร์อัปโหลดรูปภาพปกหนังสือหรือไฟล์ในอนาคต ต้องใช้ Railway Volume หรือ Cloud Object Storage (เช่น S3 / Cloud Storage)
* **Configuration & Security:** ห้ามใส่ Secret Keys, รหัสผ่าน หรือ Production Config ใน Source Code โดยเด็ดขาด ต้องส่งผ่าน Environment Variables ของ Platform เท่านั้น

---

## 9. Tools Required
* **Runtime & Package Managers:**
  * Node.js 20 LTS
  * npm (เวอร์ชันที่มาพร้อม Node 20)
* **Containerization:**
  * Docker Desktop (รองรับ Docker Engine 24+ และ Docker Compose v2)
* **Development IDE & Extensions:**
  * Visual Studio Code (หรือ IDE ที่เทียบเท่า)
  * Docker Extension
  * ESLint & Prettier
* **API Testing & Database Clients:**
  * Web Browser (Chrome, Firefox, Edge, Safari)
  * phpMyAdmin (รันผ่าน Docker) / DBeaver / TablePlus (อุปกรณ์เสริม)
  * Postman / Thunder Client / Insomnia สำหรับทดสอบ REST API

---

## 10. Folder Strategy เบื้องต้น

```text
Online_LibraryManagementSystem/
├── docs/
│   └── planning/
│       └── 00-tech-stack-decision.md    # เอกสารตัดสินใจ Tech Stack และ Architecture
├── db/
│   └── init/
│       └── 01-init.sql                  # SQL Script เริ่มต้นตารางและข้อมูลตั้งต้น (utf8mb4)
├── backend/
│   ├── src/                             # โค้ดส่วน Express Server, Routers, Controllers, Config
│   ├── Dockerfile.dev                   # Dockerfile สำหรับ Development (nodemon)
│   └── package.json                     # Backend Dependencies
├── frontend/
│   ├── src/                             # โค้ดส่วน React, MUI Components, Pages
│   ├── public/                          # Static Assets
│   ├── Dockerfile.dev                   # Dockerfile สำหรับ Development (Vite HMR)
│   ├── vite.config.js                   # คอนฟิก Vite
│   └── package.json                     # Frontend Dependencies
├── .env.example                         # Template ตัวแปรสภาพแวดล้อม
├── .gitignore                           # Git Ignore rules
├── Dockerfile                           # Multi-Stage Dockerfile สำหรับ Production (Railway)
└── docker-compose.yml                   # Docker Compose สำหรับ Local Development
```

---

## 11. Constraints
* **Architectural Phase:** ปัจจุบันอยู่ใน Phase 0 (กติกาและบริบท) ยังไม่เข้าสู่การวิเคราะห์ Requirement ละเอียด, การออกแบบ Schema, API หรือการเขียนโค้ด
* **Port Limitations:** ห้ามใช้ Port `5000` สำหรับ Backend เนื่องจากจะชนกับระบบ AirPlay Receiver ของ macOS ให้ใช้ Port `5001`
* **Docker Network Isolation:** ห้ามเชื่อมต่อข้าม Service ภายใน Docker ด้วย `localhost` ต้องเชื่อมต่อผ่าน Docker DNS Service Name (`db`)
* **Storage Ephemerality:** ระบบ Deployment บน Railway มีข้อจำกัดเรื่อง Ephemeral Storage ไม่สามารถบันทึกไฟล์อัปโหลดลงใน Local Container Filesystem ได้อย่างถาวร
* **Compose Specification:** ห้ามใส่ `version` ใน `docker-compose.yml` เนื่องจากล้าสมัยและถูก Deprecated โดย Docker Compose v2 แล้ว

---

## 12. Assumptions
* ผู้พัฒนาทุกคนมี Docker และ Docker Compose พร้อมใช้งานบนเครื่อง Local
* Database Schema ใน `db/init/01-init.sql` จะถูกโหลดใช้งานอัตโนมัติเฉพาะตอนสร้าง Volume ครั้งแรกเท่านั้น
* การสื่อสารระหว่าง Frontend และ Backend ในช่วง Development จะเกิดขึ้นผ่าน REST API (JSON)
* สมาชิก, เจ้าหน้าที่ และผู้ดูแลระบบ เข้าใช้งานผ่าน Web Browser เดียวกันโดยมีระบบจำแนก Role ในการแสดงผลและเข้าถึงข้อมูล
* อัตราค่าปรับและระยะเวลาการยืมจะอ้างอิงตามนโยบายห้องสมุดที่จะกำหนดในขั้นตอนถัดไป

---

## 13. Open Questions

> [!NOTE]
> ประเด็นคำถามที่ต้องนำไปหาคำตอบและสรุปในขั้นตอน Requirement Analysis (Phase 1)

1. **ระบบ Authentication & Identity:** จะใช้ระบบ Login แบบ JWT ในตัวระบบเอง หรือรองรับ Social Login / SSO ขององค์กร?
2. **นโยบายการยืม-คืน-จอง (Business Rules):** 
   * สมาชิก 1 คนสามารถยืมหนังสือได้สูงสุดกี่เล่มพร้อมกัน?
   * ระยะเวลาการยืมมาตรฐานกี่วัน และต่ออายุการยืม (Renew) ได้หรือไม่?
   * หนังสือที่ถูกจอง มีระยะเวลาการรอรับหนังสือกี่วันก่อนคิวจะหลุดไปยังคนถัดไป?
3. **การคิดค่าปรับ (Fine Calculation):**
   * อัตราค่าปรับคิดเป็นรายวันต่อเล่มเท่าใด? มีเพดานค่าปรับสูงสุดหรือไม่?
   * มีระบบรับชำระเงินออนไลน์ หรือเป็นการบันทึกสถานะการชำระเงินโดยเจ้าหน้าที่?
4. **ช่องทางการแจ้งเตือน (Notification Channels):**
   * การแจ้งเตือนจะทำผ่านระบบ In-App Notification อย่างเดียว หรือต้องส่ง Email / SMS / LINE Notify ด้วยหรือไม่?
5. **การจัดเก็บไฟล์ปกหนังสือ (File Storage for Book Covers):**
   * จะใช้การเก็บเป็น Image URL ภายนอก หรือต้องการระบบอัปโหลดไฟล์รูปภาพผ่าน Cloud Object Storage (เช่น Cloudinary / AWS S3)?

---

## 14. Key Decisions

1. **Decoupled Frontend & Backend Architecture:** แยกโค้ด Frontend (React) และ Backend (Express) เพื่อให้พัฒนาและทดสอบได้อิสระในขั้นตอน Dev แต่ Build รวมเป็น Single Image ใน Production
2. **MUI 5 Component Framework:** เลือกใช้ Material-UI v5 เพื่อเร่งความเร็วในการสร้าง UI ที่รองรับ Responsive และ Accessibility ได้มาตรฐาน
3. **Multi-Stage Single-Container for Production:** เลือกใช้วิธี Multi-Stage Dockerfile ให้ Express เป็นตัว Serve React Static Assets ช่วยลดต้นทุน Infrastructure บน Railway และไม่ต้องดูแล Nginx แยก
4. **Service-Based Internal Communication:** กำหนดให้ทุก Service คุยกันผ่าน Docker Service Name `db` เพื่อให้เป็นไปตามมาตรฐาน Container Networking
5. **Strict UTF-8 Handling:** กำหนดให้ MySQL และการเชื่อมต่อทั้งหมดใช้ `utf8mb4` เพื่อรองรับภาษาไทยและ Emoji อย่างสมบูรณ์

---

## 15. Docker Service Map & Port Mapping

| Service Name | Image / Build Source | Internal Port | Host Port | Purpose | Healthcheck / Dependency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `frontend` | `./frontend/Dockerfile.dev` | `5173` | `5173` | React + Vite Dev Server | Depends on `backend` |
| `backend` | `./backend/Dockerfile.dev` | `5001` | `5001` | Express REST API Server | Depends on `db` (condition: `service_healthy`) |
| `db` | `mysql:8.0` | `3306` | `3307` | MySQL 8.0 Database | Healthcheck: `mysqladmin ping` |
| `phpmyadmin` | `phpmyadmin:latest` | `80` | `8081` | Web Database Admin Tool | Depends on `db` (condition: `service_healthy`) |

---

## 16. Docker Network Rules
* ทุก Service (`frontend`, `backend`, `db`, `phpmyadmin`) ต้องเชื่อมต่ออยู่ภายใน Custom Bridge Network เดียวกัน (เช่น `library_net`)
* **การเชื่อมต่อระหว่าง Container (Internal):**
  * Backend เชื่อมต่อ MySQL ด้วย Host: `db` และ Port: `3306`
  * phpMyAdmin เชื่อมต่อ MySQL ด้วย Host: `db` และ Port: `3306`
* **การเชื่อมต่อจากเครื่อง Host (External):**
  * เข้าถึง Frontend ผ่าน `http://localhost:5173`
  * เข้าถึง Backend API ผ่าน `http://localhost:5001`
  * เข้าถึง phpMyAdmin ผ่าน `http://localhost:8081`
  * เข้าถึง MySQL ผ่านเครื่องมือภายนอก (เช่น DBeaver) ผ่าน `localhost:3307`

---

## 17. Environment Variable Strategy
* ตัวแปรสภาพแวดล้อมทั้งหมดถูกจัดเก็บไว้ในไฟล์ `.env` ที่ Root ของโปรเจกต์
* มีไฟล์ `.env.example` เป็น Template เพื่อบันทึกเข้า Git Repository (ห้าม Commit ไฟล์ `.env` ตัวจริง)
* ใน `docker-compose.yml` ให้อ้างอิง Environment Variable ด้วยรูปแบบ `${VARIABLE:-default}` เพื่อความยืดหยุ่น
* ตัวแปรหลักที่ต้องมี:
  * Database: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_PORT`, `MYSQL_HOST_PORT`
  * Backend: `PORT`, `NODE_ENV`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  * Frontend: `FRONTEND_PORT`, `VITE_API_URL`
  * phpMyAdmin: `PMA_PORT`

---

## 18. Known Setup Risks / Lessons Learned

1. **Port 5000 Collision on macOS:**
   * macOS (ตั้งแต่ macOS Monterey เป็นต้นมา) มีฟีเจอร์ *AirPlay Receiver* ที่จองใช้งาน Port `5000` โดยปริยาย
   * *แนวทางแก้ไข:* กำหนดให้ Backend ใช้ Port `5001` แทนเพื่อป้องกันปัญหา Port ชนกัน
2. **phpMyAdmin on Apple Silicon (ARM64 / M-Series Chips):**
   * Image phpMyAdmin บางรุ่นอาจพบปัญหาความไม่เข้ากันของสถาปัตยกรรมชิป Apple Silicon
   * *แนวทางแก้ไข:* ระบุ `platform: linux/amd64` ในการตั้งค่า Service phpMyAdmin
3. **Deprecated `version` Attribute in Compose File:**
   * Docker Compose v2 (Compose Specification) ไม่จำเป็นต้องระบุฟิลด์ `version: "3.8"` อีกต่อไป และการใส่ไว้อาจก่อให้เกิด Warning
   * *แนวทางแก้ไข:* ละเว้นการใส่คีย์ `version` ใน `docker-compose.yml`
4. **Volume Mount Overwrite & Dependency Isolation:**
   * การทำ Bind Mount โฟลเดอร์ของ Host เข้า Container อาจทำให้ `node_modules` จาก Host ไปทับ `node_modules` ใน Container ซึ่งก่อให้เกิดปัญหา Binary mismatch ข้าม OS
   * *แนวทางแก้ไข:* ใช้ **Anonymous Volume** สำหรับ `/app/node_modules` ในทั้ง Frontend และ Backend และหากมีการติดตั้ง Package ใหม่ ต้องสั่ง Rebuild Container เสมอ
5. **Database Startup Race Condition:**
   * เมื่อรัน `docker compose up` ตัว Backend อาจเริ่มต้นทำงานเร็วกว่า MySQL ทำให้เชื่อมต่อ Database ล้มเหลวและ Container Crash
   * *แนวทางแก้ไข:* ตั้งค่า **Healthcheck** (`mysqladmin ping`) ที่ Service `db` และกำหนดให้ Service `backend` และ `phpmyadmin` รอผ่าน `depends_on` ด้วยเงื่อนไข `condition: service_healthy`
6. **Docker Network Name Resolution (`localhost` Trap):**
   * การใส่ `DB_HOST=localhost` ใน Backend จะทำให้ Container พยายามเชื่อมต่อกับตัวเองแทนที่จะเป็น Database Container
   * *แนวทางแก้ไข:* ต้องใช้ชื่อ Service Name คือ `db` ภายใน Docker Network เสมอ
7. **Ephemeral Filesystem on Railway:**
   * Container บน Railway ถูกออกแบบมาเป็น Stateless และมี Ephemeral Filesystem ข้อมูลไฟล์ที่อัปโหลดไว้ในเครื่องจะสูญหายทันทีเมื่อมีการ Restart หรือ Re-deploy
   * *แนวทางแก้ไข:* ห้ามจัดเก็บไฟล์ถาวรไว้ใน Container หากมีฟังก์ชันอัปโหลดปกหนังสือหรือเอกสารในอนาคต ต้องต่อขยายด้วย Railway Volume หรือ Cloud Object Storage (เช่น AWS S3 / Cloudinary)
