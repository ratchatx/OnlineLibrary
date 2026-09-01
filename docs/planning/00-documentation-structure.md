# Documentation Structure & Planning File

## 1. Documentation Root Structure
โครงสร้างหลักของเอกสารอ้างอิงในระบบ **Online Library Management System** ประกอบด้วย:

```text
docs/
├── planning/
├── testing/
├── deployment/
└── README.md
```

- **`docs/planning/`**: เก็บ System Planning, Requirement, Architecture, Workflow, Database Design, API Contract, Frontend Structure, Dashboard, Notification, Docker Architecture และ Implementation Plan
- **`docs/testing/`**: เก็บ Test Strategy, Test Cases, Integration Tests, End-to-End Tests, Acceptance Tests และ Test Reports
- **`docs/deployment/`**: เก็บ Deployment Guide, Production Configuration, Railway Deployment, Environment Configuration, Deployment Checklist และ Rollback / Recovery Documentation
- **`docs/README.md`**: จุดเริ่มต้นในการอธิบาย Documentation ทั้งหมดของโปรเจกต์

---

## 2. Planning Structure

ไฟล์ที่ใช้สำหรับกระบวนการ Planning ทั้งหมดจะถูกเก็บไว้ที่ `docs/planning/` โดยมีจุดประสงค์ดังนี้:

| File | Purpose |
| --- | --- |
| `00-tech-stack-decision.md` | บันทึก Technology Stack และเหตุผลในการเลือก |
| `00-ai-working-rules.md` | กฎการทำงานของ AI |
| `00-documentation-structure.md` | โครงสร้างและกติกาของ Documentation |
| `01-system-overview.md` | ภาพรวมระบบ |
| `02-requirements.md` | Functional / Non-functional Requirements |
| `03-roles-permissions.md` | Roles และ Permissions |
| `04-library-workflow.md` | Workflow ของระบบห้องสมุด |
| `05-database-design.md` | Database Design |
| `06-api-contract.md` | API Contract |
| `07-frontend-pages.md` | Frontend Pages และ UI Structure |
| `08-dashboard-report-notification.md` | Dashboard, Report และ Notification |
| `09-project-docker-architecture.md` | Docker และ Deployment Architecture |
| `PROJECT_CONTEXT.md` | Context กลางของ Project |
| `10-implementation-plan.md` | Implementation Plan และ Phase |

---

## 3. Testing Documentation Structure

เก็บไว้ใน `docs/testing/` ประกอบด้วย:

```text
docs/testing/
├── 00-test-strategy.md       (แนวทางและระดับการทดสอบ)
├── 01-test-plan.md           (แผนการทดสอบ)
├── 02-test-cases.md          (Test Cases)
├── 03-api-testing.md         (API Testing)
├── 04-ui-testing.md          (UI Testing)
├── 05-integration-testing.md (Integration Testing)
├── 06-e2e-testing.md         (End-to-End Testing)
├── 07-acceptance-testing.md  (Acceptance Testing)
└── test-reports/             (ผลการทดสอบ)
```

> *หมายเหตุ: ไม่จำเป็นต้องสร้าง Testing Files ทั้งหมดใน Phase 0 หาก Implementation Plan ยังไม่ถึงขั้นตอนนั้น*

---

## 4. Deployment Documentation Structure

เก็บไว้ใน `docs/deployment/` ประกอบด้วย:

```text
docs/deployment/
├── 00-deployment-overview.md
├── 01-local-development.md
├── 02-docker-development.md
├── 03-railway-deployment.md
├── 04-environment-configuration.md
├── 05-deployment-checklist.md
└── 06-troubleshooting.md
```

---

## 5. Document Naming Convention
- ใช้ lowercase
- ใช้ `-` คั่นคำ
- ใช้ `.md` นามสกุลไฟล์
- ใช้ตัวเลขนำหน้าสำหรับเอกสารที่มีลำดับ:
  - `00-` ใช้สำหรับ Foundation / Configuration
  - `01-09` ใช้สำหรับ Planning Topics
  - `10-` ใช้สำหรับ Implementation Plan
- ชื่อไฟล์ต้องสื่อความหมาย และห้ามใช้ชื่อที่คลุมเครือ เช่น `doc.md`, `test.md`

---

## 6. Markdown Writing Rules
- ใช้ Markdown มาตรฐาน
- มี `<h1>` (หรือ `#`) เพียงหนึ่งหัวข้อหลัก
- ใช้ `<h2>` (`##`) สำหรับ Section และ `<h3>` (`###`) สำหรับ Subsection
- ใช้ Table เมื่อข้อมูลเหมาะกับการเปรียบเทียบ
- ใช้ Checklist สำหรับ Acceptance Criteria
- ใช้ Code Block เฉพาะเมื่อจำเป็น
- Requirement สำคัญควรมี ID
- หลีกเลี่ยงข้อมูลซ้ำซ้อน หากข้อมูลอยู่ในเอกสารอื่น ให้ Reference ถึง

---

## 7. Document Dependency Rules

ลำดับความสัมพันธ์ที่ไม่อนุญาตให้ AI ข้ามโดยไม่มีเหตุผล:

```text
00-tech-stack-decision
        ↓
00-ai-working-rules
        ↓
00-documentation-structure
        ↓
01-system-overview
        ↓
02-requirements
        ↓
03-roles-permissions
        ↓
04-library-workflow
        ↓
05-database-design
        ↓
06-api-contract
        ↓
07-frontend-pages
        ↓
08-dashboard-report-notification
        ↓
09-project-docker-architecture
        ↓
PROJECT_CONTEXT
        ↓
10-implementation-plan
```

---

## 8. AI Documentation Workflow

AI ต้องปฏิบัติตามขั้นตอนต่อไปนี้:
- **ก่อน Planning**: อ่าน `00-tech-stack-decision.md`, `00-ai-working-rules.md`, `00-documentation-structure.md`
- **ก่อนวิเคราะห์ System**: อ่าน `01-system-overview.md`, `02-requirements.md`
- **ก่อนกำหนด Permission**: อ่าน Requirements และ `03-roles-permissions.md`
- **ก่อนออกแบบ Workflow**: อ่าน Requirements, Roles & Permissions, `04-library-workflow.md`
- **ก่อนออกแบบ Database**: อ่าน Overview, Requirements, Roles, Workflow, `05-database-design.md`
- **ก่อนออกแบบ API**: อ่าน Requirements, Roles, Workflow, Database, `06-api-contract.md`
- **ก่อนทำ Frontend**: อ่าน Requirements, Roles, Workflow, API Contract, `07-frontend-pages.md`
- **ก่อน Implementation**: ต้องอ่าน `SKILL.md`, `PROJECT_CONTEXT.md`, `10-implementation-plan.md` และ Planning ที่เกี่ยวข้อง

---

## 9. Phase Documentation Rules
ในทุก Phase AI ต้องระบุ:
Phase Objective, Scope, Out of Scope, Dependencies, Files, Tasks, Testing, Acceptance Criteria, Definition of Done, Git Commit Message

หลังจบ Phase ต้องสร้าง **Phase Completion Report** เสมอ

---

## 10. Source of Truth
หากข้อมูลขัดแย้งกัน **AI ต้องหยุดและแจ้งผู้ใช้ก่อนดำเนินการต่อ** โดยอ้างอิงจากตาราง Source of Truth:

| Information | Source |
| --- | --- |
| Technology | `00-tech-stack-decision.md` |
| AI Rules | `00-ai-working-rules.md` |
| Documentation Rules | `00-documentation-structure.md` |
| System Scope | `01-system-overview.md` |
| Requirements | `02-requirements.md` |
| Roles | `03-roles-permissions.md` |
| Workflow | `04-library-workflow.md` |
| Database | `05-database-design.md` |
| API | `06-api-contract.md` |
| Frontend | `07-frontend-pages.md` |
| Dashboard / Notification | `08-dashboard-report-notification.md` |
| Docker | `09-project-docker-architecture.md` |
| Project Context | `PROJECT_CONTEXT.md` |
| Implementation | `10-implementation-plan.md` |
