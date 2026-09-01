---
name: online-library-dev
description: Master development guide, coding standards, architecture rules, and phase workflow for Online Library Management System using React 18, Node.js 20, Express 4, MySQL 8, and Docker.
---

# Online Library Management System - Project Skill & AI Working Guidelines

## 1. Purpose
เอกสาร `SKILL.md` นี้ทำหน้าที่เป็นคู่มือและกติกาหลักสำหรับ AI ในการทำงาน พัฒนา และดูแลรักษาโปรเจกต์ **Online Library Management System** ภายใต้สภาพแวดล้อม Antigravity IDE

AI ที่อ่านเอกสารนี้ต้องเข้าใจถึงขอบเขตระบบ Tech Stack สถาปัตยกรรม วิธีการทำงานเป็น Phase กฎการเขียนโค้ด การทดสอบ และสิ่งที่ห้ามทำเด็ดขาด เพื่อรักษามาตรฐานและความปลอดภัยของระบบ

---

## 2. When to Use
AI ต้องใช้ Skill นี้เมื่อ:
- พัฒนา Frontend, Backend, Database, API
- แก้ไข Bug
- เขียน Test
- ทำงานกับ Docker
- อัปเดต Documentation
- ทำงานตาม Implementation Phase
- Refactor Code ที่ได้รับอนุมัติ

---

## 3. When NOT to Use
ห้ามใช้ Skill นี้กับ:
- โปรเจกต์อื่น
- งานที่ไม่เกี่ยวข้องกับ Online Library Management System
- Feature ที่ไม่ได้อยู่ใน Planning
- Architecture ที่ไม่ได้รับอนุมัติ
- งานที่อยู่นอก Scope

---

## 4. Project Working Principles
1. **Plan Before Code**: ต้องมีแผนงานที่ชัดเจนและได้รับอนุมัติก่อนเริ่มเขียนโค้ด
2. **Work One Phase at a Time**: ทำงานและส่งมอบทีละ Phase ไม่ทำข้าม Phase
3. **Inspect Before Modify**: ทำความเข้าใจโครงสร้างไฟล์ โค้ดเดิม ก่อนแก้ไข
4. **Minimize Unrelated Changes**: แก้ไขเฉพาะไฟล์ที่เกี่ยวข้องโดยตรงกับการทำงานใน Phase นั้น
5. **Verify Before Completion**: ทดสอบการทำงานจริงทุกครั้งก่อนรายงานว่าเสร็จสิ้น
6. **Do Not Assume Unclear Requirements**: ไม่เดาความต้องการที่คลุมเครือ ให้ระบุเป็น Open Question
7. **Preserve Existing Architecture**: รักษาโครงสร้าง Layer ตามที่กำหนด
8. **Follow Approved Planning**: ปฏิบัติตามเอกสาร Planning ที่ได้รับอนุมัติ
9. **Backend Is the Source of Truth**: Business Logic สำคัญต้องอยู่ที่ Backend
10. **Preserve Database Consistency**: รักษาความถูกต้องของข้อมูล (Foreign Keys, Transactions)
11. **Security and Validation Must Not Be Skipped**: ห้ามข้ามกระบวนการ Authentication, Authorization และ Input Validation

---

## 5. AI General Rules
- อ่าน `SKILL.md` ก่อนเริ่มงานทุกครั้ง
- อ่าน Planning Documents ที่เกี่ยวข้อง
- ตรวจสอบ Project Structure และไฟล์จริงก่อนแก้ไขหรือสร้าง
- ทำเฉพาะงานที่ผู้ใช้มอบหมาย และเฉพาะ Phase ปัจจุบัน
- ไม่เริ่ม Phase ถัดไปเอง
- ไม่เพิ่ม Feature, ไม่เพิ่ม Role
- ไม่เปลี่ยน Tech Stack, ไม่เปลี่ยน Architecture โดยพลการ
- ไม่แก้ไฟล์ที่ไม่เกี่ยวข้อง
- ไม่เดา Requirement สำคัญ
- ต้องรายงานไฟล์ที่สร้างหรือแก้ไข และทดสอบก่อนรายงานว่างานเสร็จ

---

## 6. Planning Rules
- ห้ามเขียน Code ก่อน Planning ที่เกี่ยวข้องเสร็จ
- ก่อน Implementation ต้องอ่าน `docs/planning/PROJECT_CONTEXT.md`
- ก่อนแต่ละ Phase ต้องอ่าน `docs/planning/10-implementation-plan.md`
- ทำเฉพาะ Phase ที่ได้รับมอบหมาย ห้ามข้าม Phase หรือเริ่ม Phase ถัดไปล่วงหน้า
- ห้ามเพิ่ม Feature นอก Planning และห้ามเปลี่ยน Requirement เอง
- Requirement ที่ไม่ชัดเจนต้องเป็น Open Question
- Assumption ต้องแยกจาก Confirmed Requirement
- หากคำถามมีผลต่อ Phase ปัจจุบัน ต้องถามก่อนเริ่ม Implementation

---

## 7. Implementation by Phase Rules
**ก่อนเริ่ม Phase ให้ระบุ:**
- Phase, Objective, Scope, Out of Scope, Planning References, Files to Inspect, Files Expected to Change, Dependencies, Risks, Open Questions, Implementation Plan

**ระหว่างทำ:**
- ทำเฉพาะ Scope แก้เฉพาะไฟล์ที่เกี่ยวข้อง
- ไม่เพิ่ม Feature ไม่ข้าม Phase
- ตรวจสอบผลกระทบ และ Test ตาม Acceptance Criteria

**หลังทำ:**
- Run, Test, ตรวจ Acceptance Criteria
- Report Changes, Report Known Issues
- เสนอ Git Commit Message
- หยุดและรอคำสั่งจากผู้ใช้

---

## 8. Frontend Development Rules
- **Tech Stack**: React 18 + Vite 5 + MUI 5 (Port `5173`)
- Component ต้องมีหน้าที่ชัดเจน นำกลับมาใช้ซ้ำได้เมื่อเหมาะสม และหลีกเลี่ยง Duplicate Code
- แยก UI และ Data Access ตาม Architecture
- ต้องมี Loading State, Error State, Empty State เมื่อเหมาะสม
- ตรวจสอบ Authentication และ Authorization
- ห้ามเก็บ Secret ใน Frontend ห้าม Hardcode Environment-specific Configuration
- Business Logic สำคัญต้องไม่พึ่ง Frontend เพียงอย่างเดียว

---

## 9. Backend Development Rules
- **Tech Stack**: Node.js 20 LTS + Express 4 (Port `5001`)
- แยก Route, Controller, Service, Database Access
- Validate Input ทุกจุด
- มีการจัดการ Authentication, Authorization, Error Handling, Logging ตามความเหมาะสม
- Business Logic สำคัญอยู่ Backend เป็น Source of Truth
- ห้ามเชื่อข้อมูลจาก Frontend โดยไม่ Validate
- ห้ามส่ง Password หรือ Secret กลับ Client
- ตรวจสอบสถานะก่อนเปลี่ยนข้อมูล
- ใช้ Transaction เมื่อจำเป็น

---

## 10. Database Development Rules
- **Tech Stack**: MySQL 8 (Port `3306`, Host `3307`)
- ใช้ Charset `utf8mb4` หรือรองรับภาษาไทย
- รักษา Data Consistency, ใช้ Primary Key / Foreign Key ตาม Planning
- ใช้ Index ตามความเหมาะสม
- ห้ามเปลี่ยน Schema เอง หรือลบข้อมูลสำคัญโดยไม่ได้รับอนุญาต Schema Change ต้องผ่าน Planning
- ป้องกัน Duplicate Data ใช้ Transaction เมื่อจำเป็น

---

## 11. API Development Rules
- API ต้องตรงกับ API Contract ห้ามเพิ่ม Endpoint เองนอก Planning
- Validate Request
- Authentication & Authorization
- Consistent Error Response
- ไม่เปิดเผยข้อมูลเกินความจำเป็น
- Backend ต้องตรวจสอบ Business Rules
- API Contract Change ต้องแจ้งก่อน

---

## 12. Library Business Rules
- ห้ามยืมหนังสือที่ไม่มีสำเนาพร้อมให้ยืม (จำนวนหนังสือคงเหลือต้องไม่ติดลบ)
- ต้องตรวจสอบสถานะก่อนยืม คืน หรือจอง
- ป้องกันการจองซ้ำตาม Business Rules
- ต้องตรวจสอบวันที่คืนจริง และค่าปรับต้องคำนวณจาก Backend
- Member ต้องเข้าถึงข้อมูลของตนเองตามสิทธิ์
- Librarian และ Admin ต้องผ่าน Authorization
- Business Rule ที่ยังไม่ถูกกำหนดใน Planning ห้าม AI ตัดสินใจเอง

---

## 13. Docker Development Rules
- ใช้ `docker-compose.yml` สำหรับ Development ไม่ใส่ `version`
- ใช้ Custom Docker Bridge Network ให้ทุก Service ที่เกี่ยวข้องอยู่ใน Network เดียวกัน
- Backend และ phpMyAdmin ติดต่อ Database ผ่าน `db:3306` (ห้ามใช้ `localhost` จาก Container เพื่อเชื่อมต่อ MySQL)
- ใช้ Bind Mount สำหรับ Source Code, Anonymous Volume สำหรับ `node_modules`
- MySQL ต้องมี Healthcheck, Service ที่พึ่งพา MySQL ต้องรอ `service_healthy`
- Apple Silicon สามารถพิจารณา `platform: linux/amd64` เฉพาะ Service ที่จำเป็น
- เมื่อเพิ่ม Dependency ต้องระบุว่าต้อง Rebuild หรือ Restart หรือไม่

---

## 14. Testing Rules
ทุก Phase ต้องมี วิธี Run, วิธี Test, และ Acceptance Criteria Checklist
ต้องพิจารณา:
- Happy Path, Validation, Error Case
- Authentication, Authorization
- Business Logic, Data Consistency, Regression
**ห้ามรายงานว่า Feature เสร็จหาก Acceptance Criteria ยังไม่ผ่าน**

---

## 15. Debugging Rules
ใช้กระบวนการ 10 ขั้นตอน:
1. Reproduce
2. Identify Error
3. Inspect Relevant Files
4. Inspect Logs
5. Check Configuration
6. Identify Root Cause
7. Propose Fix
8. Apply Minimal Fix
9. Test Again
10. Report Result

**ห้าม:**
- เดาสาเหตุ
- ลบ Validation
- ปิด Error Handling
- เปลี่ยน Architecture โดยไม่จำเป็น
- Refactor ขนาดใหญ่โดยไม่มีเหตุผล

---

## 16. Documentation Rules
หากมีการเปลี่ยนแปลงสำคัญ ต้องพิจารณาอัปเดตเอกสารที่เกี่ยวข้อง:
- `SKILL.md`, `PROJECT_CONTEXT.md`, `10-implementation-plan.md`, `README.md`, API Documentation, Database Documentation
(รวมถึงหาก Architecture, Port, Service, Environment Variable หรือ Convention เปลี่ยน)

---

## 17. Git / GitHub Rules
ใช้ Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
ก่อน Commit:
- ตรวจสอบ `git status` ไฟล์ที่เปลี่ยน `.env` Secret และไฟล์ที่ไม่เกี่ยวข้อง
**ห้าม Commit:**
- `.env`, Password จริง, Token, API Key, Production Credentials, Secret, Personal Data จริง
ทุก Phase ต้องมี Recommended Git Commit Message

---

## 18. Security Rules
- Password ต้อง Hash ห้ามเก็บเป็น Plain Text
- Validate Input ทุกครั้ง
- ตรวจสอบ Authentication, Authorization, Resource Ownership
- ป้องกัน SQL Injection
- ไม่เปิดเผย Secret ไม่เปิดเผยข้อมูลผู้ใช้นอกสิทธิ์
- Error Response ไม่ควรเปิดเผยข้อมูลภายในระบบเกินความจำเป็น

---

## 19. Environment & Secret Handling
- ใช้ `.env` สำหรับ Local Development (ต้องไม่ถูก Commit)
- ใช้ `.env.example` สำหรับตัวอย่าง (ต้องไม่มี Secret จริง)
- Production ใช้ Platform Environment Variables (Railway Variables)
- ห้าม Hardcode Secret
- ห้ามแสดง Secret จริงใน AI Response
- Environment-specific Configuration ต้องไม่ฝังใน Source Code

---

## 20. Forbidden Actions
AI ห้ามทำสิ่งเหล่านี้โดยเด็ดขาด:
- เขียน Code ก่อน Planning พร้อม
- ทำงานข้าม Phase หรือเริ่ม Phase ถัดไปเอง
- เพิ่ม Feature หรือเพิ่ม Role
- เปลี่ยน Tech Stack หรือเปลี่ยน Architecture โดยไม่ได้รับอนุญาต
- เปลี่ยน Database Schema หรือเปลี่ยน API Contract โดยไม่ได้รับอนุญาต
- ลบข้อมูลสำคัญโดยไม่ได้รับอนุญาต
- Commit Secret หรือ Commit `.env`
- Hardcode Password, Hardcode Token, Hardcode API Key
- Refactor งานที่ไม่เกี่ยวข้อง
- ข้าม Testing หรือรายงานว่างานเสร็จโดยไม่มีผลการทดสอบ

---

## 21. Required Response Format
ก่อนเริ่ม Phase ให้ AI รายงาน:
### Phase
### Objective
### Scope
### Out of Scope
### Planning References
### Files to Inspect
### Files Expected to Change
### Dependencies
### Risks
### Open Questions
### Implementation Plan

หลังดำเนินการให้รายงาน:
### What Changed
### Files Created
### Files Modified
### Tests Performed
### Test Results
### Acceptance Criteria
### Known Issues
### Recommended Git Commit Message

---

## 22. Phase Completion Report Format
เมื่อจบ Phase ต้องรายงานตามหัวข้อ:
### Phase Name
### Objective
### Completed Scope
### Files Created
### Files Modified
### Database Changes
### API Changes
### Environment Changes
### Dependencies Added or Changed
### Docker Changes
### How to Run
### Tests Performed
### Test Results
### Acceptance Criteria Checklist
### Known Issues
### Recommended Git Commit Message
### Next Phase
### Not Included

หลังจากรายงานเสร็จ: **ห้ามเริ่ม Phase ถัดไปเอง ต้องรอคำสั่งจากผู้ใช้**
