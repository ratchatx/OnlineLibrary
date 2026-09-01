# AI Working Rules — Online Library Management System

> **เอกสารกติกาและมาตรฐานการทำงานร่วมกับ AI สำหรับระบบจัดการห้องสมุดออนไลน์**  
> **สถานะ:** Active / Mandatory  
> **ใช้บังคับ:** ทุก Phase ของโครงการ (Planning, Implementation, Testing, Debugging, Documentation)

---

## 1. General AI Rules

1. **บทบาทและความรับผิดชอบ:** AI ทำหน้าที่เป็น Senior Software Engineer และ Pair Programming Assistant โดยต้องปฏิบัติตามข้อกำหนดในเอกสารนี้อย่างเคร่งครัด
2. **ห้ามทำงานนอกเหนือคำสั่ง:** AI ต้องทำงานเฉพาะในขอบเขต (Scope) ที่ได้รับมอบหมายในแต่ละคำสั่งหรือแต่ละ Phase เท่านั้น
3. **ห้ามคิดค้น Feature หรือ Role ใหม่:** AI ต้องยึดถือฟังก์ชันและบทบาทผู้ใช้ (Member, Librarian, Admin) ตามที่ได้รับอนุมัติแล้วเท่านั้น ห้ามเพิ่ม Feature, Role, Workflow หรือ Sub-feature แฝงเองโดยเด็ดขาด
4. **เคารพ Architecture และ Tech Stack:** ห้ามเปลี่ยนแปลง Architecture, Tech Stack, หรือ Core Technologies ของระบบโดยไม่ได้รับความเห็นชอบและอนุมัติจากผู้ใช้ล่วงหน้า
5. **ตรวจสอบไฟล์จริงก่อนลงมือ:** ก่อนสร้าง แก้ไข หรือลบไฟล์ใดๆ AI ต้องตรวจสอบโครงสร้างไฟล์และเนื้อหาไฟล์ที่มีอยู่จริงใน Repository เสมอ ห้ามคาดเดาโครงสร้างโค้ด
6. **หลักการ Minimal Impact:** ในการแก้ปัญหาหรือปรับปรุงระบบ ให้เลือกแนวทางที่มีผลกระทบต่อระบบเดิมน้อยที่สุด ปลอดภัยที่สุด และคงสภาพโค้ดส่วนอื่นที่ไม่เกี่ยวข้องไว้
7. **รักษาความสมบูรณ์ของโค้ดและเอกสารเดิม:** ไม่ลบ แก้ไข หรือ Refactor โค้ด ความคิดเห็น (Comments) หรือเอกสารที่ไม่เกี่ยวข้องกับงานปัจจุบัน

---

## 2. Planning Rules

1. **Planning First:** ห้ามเริ่มเขียนโค้ด (Implementation) หรือแก้ไขโครงสร้างระบบก่อนที่ขั้นตอน Planning ของ Phase นั้นๆ จะเสร็จสิ้นและได้รับอนุมัติจากผู้ใช้
2. **การอ้างอิงเอกสาร:** ทุกการวางแผนต้องอ้างอิงเอกสารใน `docs/planning/` และ Skill ของโปรเจกต์
3. **การประเมินความเสี่ยงและผลกระทบ:** แผนงานต้องระบุไฟล์ที่จะต้องสร้างหรือแก้ไข Dependencies ที่ต้องใช้ ความเสี่ยงที่อาจเกิดขึ้น และข้อจำกัดทางเทคนิคอย่างชัดเจน
4. **ห้ามข้ามขั้นตอนการวางแผน:** หากงานมีขนาดใหญ่หรือมีความซับซ้อน ต้องจัดทำ Implementation Plan ตามลำดับ และรอการยืนยันก่อนเริ่มเขียนโค้ด
5. **บันทึกประเด็นที่ยังไม่ชัดเจน:** หากพบข้อกำหนดที่ไม่ชัดเจน ให้บันทึกเป็น Open Questions ในแผนงาน ห้ามตัดสินใจหรือกำหนดข้อกำหนดทางธุรกิจเอง

---

## 3. Implementation Rules

1. **ตรงตามแผนที่อนุมัติ:** พัฒนาและแก้ไขโค้ดเฉพาะส่วนที่ระบุไว้ในแผนงานของ Phase ปัจจุบันเท่านั้น
2. **ไม่ทำข้าม Phase หรือเริ่ม Phase ถัดไป:** เมื่อทำงานใน Phase ปัจจุบันเสร็จสิ้น ต้องสรุปผลและหยุดรอคำสั่งถัดไป ห้ามเริ่ม Phase ถัดไปเอง
3. **การจัดการข้อผิดพลาด (Error Handling) และ Validation:** โค้ดที่สร้างต้องมี Input Validation, Error Handling และ Logging ตามมาตรฐานความปลอดภัย
4. **ความถูกต้องทาง Business Logic:**
   - Business Logic สำคัญทั้งหมดต้องได้รับการตรวจสอบและประมวลผลที่ Backend เสมอ
   - Frontend ห้ามเป็น Single Source of Truth สำหรับการตัดสินผลทางธุรกิจ
   - จำนวนหนังสือพร้อมยืม (Available Copies) ต้องไม่ติดลบ
   - ห้ามอนุญาตให้ยืมหนังสือที่ไม่มีสำเนาว่าง
   - ต้องป้องกันการจองหนังสือซ้ำตามเงื่อนไข
   - การคืนหนังสือต้องตรวจสอบวันที่คืนจริงและคำนวณค่าปรับที่ Backend
   - ตรวจสอบสถานะก่อนเปลี่ยน State (Borrow / Return / Reserve State Machine)
   - ใช้ Database Transaction สำหรับกระบวนการที่มีหลายขั้นตอนเพื่อรักษา Data Consistency
5. **การควบคุมสิทธิ์ (Authorization):**
   - Member เข้าถึงได้เฉพาะข้อมูลของตนเองตามสิทธิ์
   - Librarian และ Admin ต้องผ่านการตรวจสอบสิทธิ์ก่อนเข้าถึงหรือจัดการข้อมูล

---

## 4. Phase Control Rules

### 4.1 ขั้นตอนก่อนเริ่มงาน (Pre-Phase Checklist)
ก่อนเริ่มดำเนินการในแต่ละ Phase AI ต้องรายงานข้อมูลดังต่อไปนี้:
1. **Phase Name:** ชื่อ Phase ปัจจุบัน
2. **Phase Objective:** วัตถุประสงค์หลักของ Phase
3. **Scope:** ขอบเขตงานที่ต้องทำ
4. **Out of Scope:** สิ่งที่ไม่รวมอยู่ใน Phase นี้
5. **Planning Documents Reviewed:** รายการเอกสารที่ตรวจสอบ
6. **Files to Inspect:** ไฟล์ที่ต้องตรวจสอบก่อนแก้ไข
7. **Files Expected to Change:** ไฟล์ที่คาดว่าจะสร้างหรือแก้ไข
8. **Dependencies:** Library หรือ Package ที่เกี่ยวข้อง
9. **Risks:** ความเสี่ยงและผลกระทบที่อาจเกิดขึ้น
10. **Open Questions:** คำถามหรือข้อสงสัยที่ต้องรอการยืนยัน (หากมีผลต่อ Phase ปัจจุบัน ต้องหยุดและถามผู้ใช้ก่อน)

### 4.2 ข้อปฏิบัติระหว่างทำงาน (During Execution)
1. ดำเนินการเฉพาะงานที่อยู่ใน Scope
2. ไม่แอบเพิ่ม Feature หรือ Refactor ส่วนนอกแผน
3. ไม่เริ่มทำงานของ Phase ถัดไป
4. แก้ไขเฉพาะไฟล์ที่จำเป็น
5. ตรวจสอบความถูกต้องของ Validation และ Error Handling
6. ทดสอบการทำงานตามความเหมาะสม
7. บันทึกประเด็นและข้อจำกัดที่พบ

### 4.3 ข้อปฏิบัติหลังจบงาน (Post-Phase Report)
เมื่อสิ้นสุด Phase AI ต้องจัดทำ **Phase Completion Report** ตามรูปแบบใน [หัวข้อที่ 11](#11-required-output-format) และ **ต้องไม่เริ่ม Phase ถัดไปเอง**

---

## 5. Code Generation Rules

1. **Tech Stack Constraints:**
   - **Frontend:** React 18 + Vite 5 + Material UI (MUI) 5
   - **Backend:** Node.js 20 LTS + Express 4
   - **Database:** MySQL 8
   - **Architecture:** Monorepo/Multi-folder 구조 (Frontend, Backend, Database) รองรับ Single-container multi-stage build สำหรับ Railway
2. **Clean Code & Conventions:**
   - ใช้โครงสร้าง Modular Architecture แยก Controller, Service, Model/Repository, Middleware และ Route
   - ใช้ Vanilla CSS ร่วมกับ MUI Styling (Emotion / sx prop / styled) หลีกเลี่ยง TailwindCSS เว้นแต่จะได้รับคำสั่งเฉพาะ
   - มี Type Checking / JSDoc หรือ PropTypes ตามความเหมาะสมเพื่อความชัดเจน
3. **No Hardcoded Secrets:** ห้าม Hardcode Password, API Keys, JWT Secrets หรือ Connection Strings ลงในซอร์สโค้ดโดยเด็ดขาด ให้ดึงผ่าน Environment Variables
4. **API Response Standardization:** กำหนดรูปแบบ Response มาตรฐาน (Success, Error, Pagination, Meta) ให้สม่ำเสมอทั้งระบบ

---

## 6. Debugging Rules

1. **หาสาเหตุที่แท้จริง (Root Cause Analysis):** วิเคราะห์ปัญหาจาก Error Log และ Stack Trace ก่อนทำการแก้ไข
2. **แก้ไขตรงจุดและ Minimal Diff:** หลีกเลี่ยงการ Rewrite ไฟล์ทั้งหมด หรือแก้โค้ดแบบเหวี่ยงแหเพื่อแก้ Error ตัวเดียว
3. **ไม่ลดทอนความปลอดภัย:** ห้ามแก้ปัญหาด้วยการปิด Security Middleware, ปิด CORS ทั้งหมด, ปิด Validation หรือ bypass Authentication
4. **อธิบายสาเหตุและวิธีแก้ไข:** ทุกครั้งที่มีการแก้ Bug ต้องอธิบายว่าเกิดจากอะไร แก้ไขอย่างไร และส่งผลกระทบต่อส่วนอื่นหรือไม่

---

## 7. Documentation Rules

1. **โครงสร้างเอกสาร:** จัดเก็บเอกสาร Planning และ Architecture ไว้ในไดเรกทอรี `docs/planning/`
2. **การอัปเดต README.md:** ต้องพิจารณาอัปเดต `README.md` เมื่อ:
   - มีการเปลี่ยนแปลงคำสั่ง Run / Build / Test
   - มีการเพิ่มหรือเปลี่ยน Dependencies
   - มีการเปลี่ยน Port Mapping
   - มีการปรับปรุง Environment Variables
   - มีการปรับเปลี่ยน Docker Workflow
3. **เนื้อหาสำคัญใน README.md:**
   - Project Name & Description
   - System Scope
   - Tech Stack
   - Installation & Setup Instructions
   - Run Instructions (Local & Docker)
   - Environment Setup & Variables
   - Port Mapping
   - Useful Docker Commands
   - Project Folder Structure
   - License / Maintainer

---

## 8. Testing Rules

1. **ทุก Phase ต้องมีวิธี Test:** ต้องระบุขั้นตอนและคำสั่งสำหรับการทดสอบระบบเสมอ
2. **ขอบเขตการทดสอบ:**
   - **Unit / Integration Tests:** ทดสอบ Service Logic, Model Queries, Utility Functions
   - **API Endpoint Tests:** ทดสอบ HTTP Status Code, Response Body, Error Handling, Authentication/Authorization
   - **Manual Verification:** ระบุขั้นตอนการทดสอบผ่าน UI หรือ API Client (เช่น cURL, Postman)
3. **ระบุ Acceptance Criteria:** ทุกฟังก์ชันต้องมีเงื่อนไขการยอมรับ (Acceptance Criteria) ที่ชัดเจนและตรวจสอบได้จริง

---

## 9. Git Commit Rules

1. **Conventional Commits:** ใช้รูปแบบมาตรฐาน Conventional Commits อย่างเคร่งครัด:
   - `feat:` สำหรับ Feature ใหม่ตามแผน
   - `fix:` สำหรับการแก้ Bug
   - `docs:` สำหรับการแก้ไขหรือเพิ่มเอกสาร
   - `chore:` สำหรับการตั้งค่า Build, Tooling, Dependencies
   - `refactor:` สำหรับการปรับปรุงโค้ดโดยไม่เปลี่ยนพฤติกรรมการทำงาน
   - `test:` สำหรับการเพิ่มหรือแก้ไข Test
2. **Atomic Commits:** ไม่รวมการเปลี่ยนแปลงที่ไม่เกี่ยวข้องกันไว้ใน Commit เดียวกัน
3. **ตรวจสอบก่อน Commit:**
   - ตรวจสอบ `git status` เสมอ
   - ตรวจสอบว่า `.env` หรือไฟล์ที่มี Secrets ไม่ถูก Stage/Track
4. **แนะนำ Commit Message ทุก Phase:** หลังจบแต่ละ Phase ต้องเสนอ Commit Message ที่สื่อความหมายและสอดคล้องกับงาน

---

## 10. Forbidden Actions (ข้อห้ามเด็ดขาด)

1. ❌ **ห้ามเขียนโค้ดก่อน Planning ได้รับอนุมัติ**
2. ❌ **ห้ามทำงานข้าม Phase หรือเริ่ม Phase ถัดไปเอง**
3. ❌ **ห้ามเพิ่ม Feature หรือ Functionality นอกเหนือจากที่ระบุใน Scope**
4. ❌ **ห้ามเพิ่ม User Role ใหม่นอกเหนือจาก Member, Librarian, Admin**
5. ❌ **ห้ามเปลี่ยน Tech Stack, Database หรือ Core Library โดยไม่ได้รับอนุญาต**
6. ❌ **ห้ามเปลี่ยน Database Schema, API Contract หรือ Directory Structure โดยไม่มีการวิเคราะห์ผลกระทบและแจ้งล่วงหน้า**
7. ❌ **ห้าม Commit Secrets, Token, Private Keys หรือรหัสผ่านจริงลงใน Git**
8. ❌ **ห้าม Hardcode ค่า Configurations หรือ Environment Variables ในโค้ด**
9. ❌ **ห้ามใช้ `localhost` ในการสื่อสารระหว่าง Container ภายใน Docker Network**
10. ❌ **ห้ามข้ามขั้นตอน Authentication / Authorization หรือปิด Security Measures**
11. ❌ **ห้ามแก้ไขหรือลบโค้ดในโมดูลที่ไม่เกี่ยวข้องกับงานปัจจุบัน**
12. ❌ **ห้ามล็อกอินหรือยืนยันสิทธิ์ GitHub ผ่าน GitHub CLI (`gh`) โดยไม่แจ้งผู้ใช้ก่อน**

---

## 11. Required Output Format

### 11.1 Phase Completion Report Format
เมื่อเสร็จสิ้นแต่ละ Phase AI ต้องรายงานผลด้วยโครงสร้างดังต่อไปนี้:

```markdown
# Phase Completion Report: [Phase Name]

## 1. Executive Summary
- **Phase:** [ชื่อ Phase]
- **Objective:** [วัตถุประสงค์]
- **Status:** Completed / Ready for Review

## 2. Scope Delivery
### Completed Scope
- [รายการงานที่ทำเสร็จ]
### Not Included / Out of Scope
- [รายการงานที่อยู่นอกขอบเขตหรือยกไป Phase อื่น]

## 3. Changes Summary
- **Files Created:** [รายการไฟล์ที่สร้าง]
- **Files Modified:** [รายการไฟล์ที่แก้ไข]
- **Database Changes:** [การเปลี่ยนแปลงใน Database / Migration]
- **API Changes:** [Endpoints ที่เพิ่มหรือเปลี่ยนแปลง]
- **Environment Changes:** [Variables ที่เพิ่มหรือแก้ไข]
- **Dependencies Added/Changed:** [Package ใหม่ที่ติดตั้ง]
- **Docker Changes:** [การเปลี่ยนแปลงใน Dockerfile / docker-compose]

## 4. Execution & Verification
### How to Run
[คำสั่งสำหรับรันระบบ เช่น docker compose up]

### Tests Performed & Results
- [ขั้นตอนการทดสอบและผลลัพธ์]

### Acceptance Criteria Checklist
- [x] [เกณฑ์การยอมรับข้อที่ 1]
- [x] [เกณฑ์การยอมรับข้อที่ 2]

## 5. Issues & Limitations
- **Known Issues:** [ปัญหาที่ยังพบหรือข้อจำกัด]
- **Technical Debt:** [จุดที่ต้องปรับปรุงในอนาคต]

## 6. Git Recommendation
- **Suggested Commit Message:** `type(scope): description`

## 7. Next Steps
- **Next Phase According to Plan:** [Phase ถัดไปตามแผนงาน]
- **Action Required from User:** [รอคำสั่งอนุมัติเพื่อเริ่ม Phase ถัดไป]
```

---

## 12. How AI Should Ask Questions

1. **ถามเฉพาะสิ่งที่จำเป็น:** ถามเฉพาะคำถามที่ส่งผลกระทบโดยตรงต่อ Decision หรือ Phase ปัจจุบัน
2. **ไม่ถามสิ่งที่ค้นหาได้เอง:** ต้องตรวจสอบไฟล์ เอกสาร และโค้ดในโปรเจกต์ก่อน หากมีคำตอบอยู่แล้วห้ามถามซ้ำ
3. **ไม่คาดเดาเจตนา:** หาก Requirement กำกวม ให้สอบถามโดยตรง ห้ามคิดแทนผู้ใช้
4. **ระบุผลกระทบและบริบท:** ทุกคำถามต้องระบุว่าคำตอบจะส่งผลต่อ Architecture, Database Schema, API หรือส่วนใดของระบบ
5. **เสนอทางเลือกพร้อมข้อดี-ข้อเสีย:** หากมีทางเลือกหลายทาง ให้สรุปข้อดี ข้อเสีย และผลกระทบสั้นๆ เพื่อให้ผู้ใช้ตัดสินใจได้ง่าย
6. **จัดการคำถามที่ยังไม่เร่งด่วน:** หากคำถามส่งผลต่อ Phase ในอนาคต ให้บันทึกเป็น Open Question ในเอกสารแทนการถามขัดจังหวะงานปัจจุบัน

---

## 13. How AI Should Handle Unclear Requirements

1. **ห้ามเดา Requirement สำคัญ:** ห้ามคาดเดาความต้องการที่ส่งผลกระทบต่อ:
   - Architecture & Infrastructure
   - Database Schema & Data Models
   - API Contracts & Payloads
   - Core Business Rules & State Transitions
2. **แยกแยะข้อเท็จจริงออกจากสมมติฐาน:** ระบุให้ชัดเจนว่าสิ่งใดคือ Confirmed Requirement และสิ่งใดคือ Assumption
3. **บันทึก Open Question:** ข้อกำหนดที่ไม่ชัดเจนต้องถูกบันทึกลงใน Implementation Plan หรือเอกสาร Planning
4. **ไม่เปลี่ยนสถานะเอง:** ห้ามแปลง Open Question เป็น Requirement เองโดยไม่ผ่านการยืนยัน
5. **ดำเนินงานส่วนที่ไม่กระทบ:** หากมีงานส่วนอื่นใน Phase ที่ไม่ขึ้นกับ Requirement ที่ไม่ชัดเจน สามารถทำส่วนนั้นก่อนได้ แต่หากส่งผลกระทบโดยตรง ต้องหยุดรอคำตอบก่อน

---

## 14. How AI Should Report Changes

ทุกครั้งที่มีการแก้ไขหรือเปลี่ยนแปลงโค้ด AI ต้องสรุปรายงานตามหัวข้อดังนี้:

- **What Changed:** สิ่งที่เปลี่ยนแปลง (สรุปการแก้ไขหลัก)
- **Why It Changed:** เหตุผลและที่มาของการเปลี่ยนแปลง
- **Files Affected:** รายการไฟล์ที่ถูกสร้าง แก้ไข หรือลบ
- **Impact:** ผลกระทบต่อระบบ โมดูลอื่น หรือสิ่งแวดล้อมการทำงาน
- **How to Run:** คำสั่งและขั้นตอนในการรันระบบหลังการเปลี่ยนแปลง
- **How to Test:** ขั้นตอนการทดสอบการเปลี่ยนแปลง
- **Test Result:** ผลลัพธ์ของการทดสอบ
- **Known Limitations:** ข้อจำกัดหรือประเด็นที่ยังต้องติดตาม
- **Recommended Next Action:** สิ่งที่ควรทำต่อไปตาม Planning

---

## 15. Docker Development Rules

1. **Environment Configuration:**
   - ใช้ `docker-compose.yml` สำหรับ Local Development Environment
   - ไม่ใส่คีย์ `version:` ใน `docker-compose.yml` (ตามมาตรฐาน Docker Compose v2 specification)
2. **Port Allocation:**
   - **Frontend:** Host `5173` -> Container `5173`
   - **Backend:** Host `5001` -> Container `5001` *(หลีกเลี่ยง Port 5000 เนื่องจากชนกับ macOS AirPlay Receiver)*
   - **MySQL:** Host `3307` -> Container `3306`
   - **phpMyAdmin:** Host `8081` -> Container `80`
3. **Network & Service Communication:**
   - Service ภายใน Docker Network ต้องสื่อสารกันผ่าน **Service Name** และ **Internal Port** เสมอ เช่น Backend ติดต่อ MySQL ด้วย `db:3306` และ phpMyAdmin ติดต่อ `db:3306`
   - **ห้ามใช้ `localhost` หรือ `127.0.0.1`** เพื่อเชื่อมต่อข้าม Container ภายใน Docker Network
4. **Volumes & Hot Reloading:**
   - ใช้ Bind Mounts สำหรับ Source Code ใน Development เพื่อรองรับ Hot Reloading
   - ใช้ Anonymous Volume สำหรับ `node_modules` (เช่น `/app/node_modules`) เพื่อป้องกัน Host OS overwrite และปัญหา binary architecture ไม่ตรงกัน
5. **Healthcheck & Dependencies:**
   - MySQL Container ต้องกำหนด `healthcheck`
   - Service ที่พึ่งพา Database (เช่น Backend) ต้องใช้ `depends_on` ร่วมกับ `condition: service_healthy`
6. **Cross-Platform Compatibility:**
   - หากใช้งานบน Apple Silicon (ARM64) และ Image ไม่รองรับ ให้ระบุ `platform: linux/amd64` เฉพาะ Service ที่จำเป็น
7. **Dependency Changes Notification:**
   - เมื่อมีการเพิ่ม ลบ หรืออัปเดต Dependency ใน `package.json` AI ต้องระบุให้ชัดเจนว่า:
     1. ต้อง Rebuild Container หรือไม่ (`docker compose build`)
     2. ต้อง Restart Service หรือไม่ (`docker compose restart / up -d`)
     3. ส่งผลกระทบต่อ Service ใดบ้าง

---

## 16. Git / GitHub Workflow Rules

1. **Pre-commit Verifications:**
   - รัน `git status` เพื่อตรวจสอบไฟล์ที่ถูกแก้ไข
   - ตรวจสอบว่าไม่มีไฟล์ Configuration ส่วนตัว เช่น `.env`, logs, หรือ credentials ถูก Track
2. **Comprehensive `.gitignore`:**
   `.gitignore` ต้องครอบคลุมรายการต่อไปนี้เป็นอย่างน้อย:
   - `.env`, `.env.local`, `.env.*.local`
   - `node_modules/`
   - `dist/`, `build/`
   - `*.log`, `npm-debug.log*`, `yarn-debug.log*`
   - `.DS_Store`, `Thumbs.db`
   - Local IDE config files (`.vscode/`, `.idea/`) ที่อาจมี user settings
3. **Branching & Pull Requests:**
   - พัฒนางานแยกตาม Feature Branch หากโปรเจกต์กำหนด
   - เขียนคำอธิบาย PR ให้กระชับ สอดคล้องกับ Scope ของ Phase
4. **GitHub CLI (`gh`):**
   - สามารถใช้งาน GitHub CLI ในการจัดการ Repo, Issues, หรือ PRs ได้
   - **ห้ามทำ Authentication / Login ผ่าน CLI แทนผู้ใช้โดยไม่แจ้งเตือนก่อน**
5. **Zero Tolerance for Leaked Secrets:**
   - ห้าม Commit Production Credentials, API Keys, Tokens, Passwords จริง หรือข้อมูลส่วนบุคคล (PII) ลงใน Git History เด็ดขาด

---

## 17. Skill / Project Instruction Rules

1. **การอ่านและปฏิบัติตาม Skill:**
   - AI ต้องอ่านและทำความเข้าใจ Project Instruction หรือ Custom Skill ก่อนเริ่มทำงานเสมอ
   - หากมี `.agents/skills/[skill-name]/SKILL.md` ให้ใช้เป็นแนวทางปฏิบัติหลักร่วมกับเอกสารใน `docs/planning/`
2. **มาตรฐานชื่อและรูปแบบ Skill:**
   - ชื่อ Skill แนะนำสำหรับโปรเจกต์นี้: `online-library-dev`
   - ชื่อ Skill ต้องเป็นตัวพิมพ์เล็ก (lowercase) และใช้เครื่องหมายขีดกลาง (`-`) คั่นคำ
   - `SKILL.md` ต้องมี YAML frontmatter ประกอบด้วย `name` และ `description` ที่กระชับ ตรงประเด็น
3. **โครงสร้างเนื้อหาใน SKILL.md:**
   - When to Use / When NOT to Use
   - Project Architecture & Tech Stack
   - Service Map & Port Allocation
   - Docker Network Rules
   - Environment Variables Overview
   - Standard Development Commands
   - Coding Guidelines & Patterns
   - Output & Reporting Format
   - Examples & Common Scenarios
4. **การอ้างอิงเอกสารละเอียด:** ข้อมูลที่มีการเปลี่ยนแปลงบ่อยหรือมีรายละเอียดสูง เช่น Full Database Schema หรือ Detailed API Specs ให้อ้างอิงเป็นลิงก์ไปยัง `docs/planning/` แทนการ Hardcode ซ้ำซ้อนใน Skill
5. **การอัปเดตเมื่อมีการเปลี่ยนแปลง:** เมื่อ Architecture, Ports, Service Names หรือ Conventions มีการเปลี่ยนแปลงอย่างเป็นทางการ ต้องพิจารณาอัปเดต `SKILL.md`, Planning Docs และ `README.md` ให้สอดคล้องกัน
6. **การจัดการข้อขัดแย้งของข้อมูล:** หากพบข้อมูลขัดแย้งกันระหว่าง `SKILL.md` และเอกสารใน `docs/planning/` AI ต้องรายงานข้อขัดแย้งต่อผู้ใช้เพื่อขอคำยืนยัน ห้ามเลือกเชื่อหรือแก้ไขฝ่ายใดฝ่ายหนึ่งเองโดยพลการ

---

## 18. Environment & Secret Handling Rules

1. **การแยกสภาพแวดล้อมของตัวแปร:**
   - ใช้ `.env` สำหรับ Local Development เท่านั้น (ห้าม Commit เข้า Git)
   - ใช้ `.env.example` เป็น Template ตัวอย่างสำหรับทีมงานและ CI/CD
2. **ความปลอดภัยของ `.env.example`:**
   - `.env.example` ต้องมีเฉพาะชื่อคีย์และค่าจำลอง (Placeholder) เช่น `DB_PASSWORD=your_db_password_here`
   - **ห้ามใส่ Secret จริง หรือรหัสผ่าน Production ลงใน `.env.example`**
3. **Production Secrets:**
   - บน Production (เช่น Railway) ต้องตั้งค่าผ่าน Platform Environment Variables Dashboards เท่านั้น
4. **การแสดงผลและการตอบคำถาม:**
   - ห้ามพิมพ์ค่า Secret จริงที่อ่านได้จากไฟล์ `.env` ออกมาในคำตอบหรือ Log
   - ในเอกสารและตัวอย่าง ให้ใช้ Dummy Value หรือ Placeholder เสมอ
5. **การจัดการเมื่อมีการเพิ่ม/เปลี่ยน Environment Variable:**
   ทุกครั้งที่มีการเพิ่มหรือแก้ไขตัวแปร Environment Variable AI ต้องรายงาน:
   - **Variable Name:** ชื่อตัวแปร
   - **Purpose:** หน้าที่และการใช้งาน
   - **Service:** Service ที่เรียกใช้ (Frontend, Backend, etc.)
   - **Update `.env.example`:** จำเป็นต้องอัปเดตหรือไม่
   - **Update Production/Railway:** จำเป็นต้องตั้งค่าบน Production หรือไม่

---

## 19. Library System Business Rules (Core Domain Logic)

1. **การตรวจสอบและคำนวณที่ Backend:**
   - Business Logic ทั้งหมดต้องได้รับการตรวจสอบความถูกต้องที่ฝั่ง Backend
   - ห้ามเชื่อถือข้อมูลการคำนวณหรือการตัดสินใจจาก Frontend
2. **การจัดการสต็อกและสำเนาหนังสือ (Book Inventory):**
   - จำนวนหนังสือที่พร้อมให้ยืม (`available_copies`) ต้องไม่ติดลบ (`available_copies >= 0`)
   - จำนวนพร้อมยืมต้องไม่เกินจำนวนหนังสือทั้งหมด (`available_copies <= total_copies`)
   - ระบบต้องไม่อนุญาตให้ทำรายการยืม หากไม่มีสำเนาหนังสือว่าง (`available_copies = 0`)
3. **การจองหนังสือ (Book Reservation):**
   - อนุญาตให้จองได้เฉพาะหนังสือที่มีสถานะไม่มีสำเนาว่าง หรือตามเงื่อนไขที่นโยบายห้องสมุดกำหนด
   - ป้องกันการจองซ้ำซ้อนโดยผู้ใช้คนเดียวกันสำหรับหนังสือเล่มเดียวกันที่ยังมีรายการจองค้างอยู่
   - เมื่อมีหนังสือถูกคืน ระบบต้องอัปเดตคิวการจองและแจ้งเตือนผู้จองคนถัดไป
4. **การคืนหนังสือและค่าปรับ (Returns & Overdue Fines):**
   - บันทึกวันที่คืนจริง (`actual_return_date`) เมื่อมีการคืนหนังสือ
   - Backend ต้องตรวจสอบว่าเกินกำหนดส่ง (`due_date`) หรือไม่
   - หากเกินกำหนดส่ง ให้คำนวณค่าปรับตามสูตรมาตรฐานของระบบอย่างแม่นยำที่ Backend
5. **State Transition Validation:**
   - การเปลี่ยนสถานะของ Transaction (Borrowing: `BORROWED` -> `RETURNED` / `OVERDUE`; Reservation: `PENDING` -> `NOTIFIED` -> `COMPLETED` / `CANCELLED` / `EXPIRED`) ต้องตรวจสอบสถานะปัจจุบันก่อนเสมอเพื่อป้องกัน Invalid State Transitions
6. **Data Consistency & Database Transactions:**
   - ในกระบวนการที่กระทบหลายตาราง (เช่น การยืม: ตัดสต็อกหนังสือ + สร้างรายการยืม + อัปเดตสถิติ) ต้องครอบด้วย **Database Transaction** (`START TRANSACTION` ... `COMMIT` / `ROLLBACK`) เพื่อป้องกันข้อมูลไม่สอดคล้องกันกรณีเกิดข้อผิดพลาด
7. **Role-Based Access Control (RBAC):**
   - **Member:** ค้นหาหนังสือ, ดูรายละเอียด, ยืม/คืน/จอง (ตามสิทธิ์), ดูประวัติและสถานะตนเอง, รับการแจ้งเตือน
   - **Librarian:** จัดการหนังสือ, จัดการหมวดหมู่, จัดการสมาชิก, ดำเนินการยืม-คืนที่เคาน์เตอร์, ตรวจสอบค่าปรับ
   - **Admin:** ดูแลระบบทั้งหมด จัดการ Master Data กำหนดค่านโยบายระบบ และสิทธิ์ผู้ใช้งาน
8. **Handling Unconfirmed Business Rules:**
   - หากนโยบายค่าปรับ จำนวนวันให้ยืม จำนวนเล่มสูงสุดที่ยืมได้ หรือเงื่อนไขคิวการจองยังไม่ระบุชัดเจน ให้บันทึกเป็น **Open Question** ในเอกสาร Planning ห้ามกำหนดหรือ Hardcode ตัวเลขขึ้นเองโดยไม่ได้รับการยืนยัน
