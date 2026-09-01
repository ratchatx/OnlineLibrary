# Production Deployment & Operation Guide

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `01-deployment-guide.md`  
**Phase:** Phase 20 — Production Deployment & Release  
**Status:** Approved for Production  
**Date:** 2026-08-30  

---

## 1. Overview
คู่มือฉบับนี้อธิบายขั้นตอนการติดตั้ง ส่งมอบ และดูแลรักษาระบบ **Online Library Management System** ในสภาพแวดล้อมจริง (Production Environment) โดยรองรับ 2 สถาปัตยกรรมหลัก:
- **Target A (Primary):** Railway Cloud (Single-Container Multi-Stage Build + Managed MySQL)
- **Target B (Alternative):** On-Premise Ubuntu Server (Nginx Reverse Proxy + Multi-Container Compose)

---

## 2. Production Architecture Comparison

| คุณสมบัติ (Feature) | Target A (Railway Cloud) | Target B (On-Premise Server) |
|---|---|---|
| **รูปแบบ Container** | Single Container (Backend serves Static SPA) | Multi-Container (`app`, `db`, `nginx`) |
| **ฐานข้อมูล** | Railway Managed MySQL Plugin | MySQL 8.0 Container พร้อม Named Volume |
| **เว็บเซิร์ฟเวอร์ภายนอก**| Railway Edge Load Balancer | Nginx Alpine Container |
| **SSL / HTTPS** | Automatic via Railway Edge | Nginx Let's Encrypt / Custom Certificate |
| **ไฟล์ Configuration** | `Dockerfile`, `railway.toml` | `docker-compose.prod.yml`, `nginx/default.conf` |

---

## 3. Target A: Railway Deployment Instructions

### Step 1: เตรียม Repository
ตรวจสอบให้แน่ใจว่าไฟล์ `Dockerfile` และ `railway.toml` อยู่ที่ Root ของ Repository

### Step 2: สร้างโปรเจกต์บน Railway
1. เข้าสู่ระบบ [Railway.app](https://railway.app)
2. กดปุ่ม **New Project** -> เลือก **Deploy from GitHub repo**
3. เลือก Repository `Online_LibraryManagementSystem`

### Step 3: เพิ่ม MySQL Database บน Railway
1. ภายใน Project Dashboard กด **+ New** -> เลือก **Database** -> เลือก **MySQL**
2. Railway จะสร้าง Managed MySQL Service พร้อม Environment Variables อัตโนมัติ:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

### Step 4: กำหนดค่า Environment Variables บน Application Service
ไปที่เมนู **Variables** ของ Application Service และกำหนดตัวแปรดังนี้:

```env
NODE_ENV=production
PORT=5001
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
JWT_SECRET=production_strong_jwt_secret_key_change_me_2026
JWT_EXPIRES_IN=7d
```

### Step 5: นำเข้า Schema & Initial Data
เชื่อมต่อไปยัง MySQL ของ Railway ผ่าน MySQL Client หรือ DBeaver แล้วรันสคริปต์:
1. `db/init/01-schema.sql`
2. `db/init/02-seed.sql`

### Step 6: Deploy & ตรวจสอบสถานะ
1. Railway จะเริ่มรัน Multi-Stage Build โดยอัตโนมัติ
2. ตรวจสอบสถานะผ่าน Healthcheck: `https://<your-railway-domain>/api/v1/health`
3. เข้าใช้งานระบบผ่านเว็บเบราว์เซอร์: `https://<your-railway-domain>/`

---

## 4. Target B: On-Premise Deployment Instructions

### ข้อกำหนดระบบ (Prerequisites)
- Ubuntu 22.04 LTS / Debian 12 / RHEL 9
- Docker Engine v24.0+ และ Docker Compose v2.20+
- พอร์ต `80` และ `443` เปิดใช้งาน

### Step 1: Clone Repository & สร้าง `.env`
```bash
git clone https://github.com/your-org/Online_LibraryManagementSystem.git
cd Online_LibraryManagementSystem

# คัดลอก Template .env
cp .env.example .env
```

### Step 2: กำหนดค่าใน `.env` สำหรับ Production
```env
NODE_ENV=production
MYSQL_ROOT_PASSWORD=SecureRootPassword_2026!
MYSQL_DATABASE=library_db
MYSQL_USER=library_user
MYSQL_PASSWORD=SecureUserPassword_2026!
JWT_SECRET=production_super_strong_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
PROD_HTTP_PORT=80
```

### Step 3: สั่งรัน Production Containers
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Step 4: ตรวจสอบสถานะ Container
```bash
docker compose -f docker-compose.prod.yml ps
```
ผลลัพธ์ที่ถูกต้อง:
- `library_prod_db` -> Healthy (Up)
- `library_prod_app` -> Up
- `library_prod_nginx` -> Up (0.0.0.0:80->80/tcp)

### Step 5: ตรวจสอบ Health Check
```bash
curl http://localhost/health
```

---

## 5. Maintenance & Operations

### การสำรองข้อมูล (Database Backup)
```bash
# Target B On-Premise Backup
docker exec library_prod_db mysqldump -u root -pSecureRootPassword_2026! library_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### การดู Logs แบบ Realtime
```bash
# Target B Logs
docker compose -f docker-compose.prod.yml logs -f app
```

### การอัปเดตระบบ (Zero-Downtime Re-deploy)
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build --no-deps app
```
