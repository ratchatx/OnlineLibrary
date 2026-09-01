# Git Workflow & Commit Rules

## 1. Purpose
เอกสารฉบับนี้กำหนดมาตรฐาน Git Workflow, Branch Strategy, และ Commit Convention สำหรับการพัฒนาระบบ **Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)** 

วัตถุประสงค์หลัก:
- สร้างจุดย้อนกลับ (Checkpoint / Rollback Point) ที่ชัดเจนในแต่ละขั้นตอน
- แยกประวัติการทำงานในแต่ละ Planning Step และ Implementation Phase อย่างเป็นระบบ
- ป้องกันความเสี่ยงจากการที่ AI ทำการแก้ไขหรือ Commit โค้ดนอกขอบเขต
- ป้องกันการหลุดรั่วของ Secret, Credentials หรือไฟล์ชั่วคราวขึ้นสู่ Version Control
- รองรับการทำงานร่วมกันระหว่าง Developer และ AI Coding Assistant บน GitHub

---

## 2. Git Repository Structure
Repository ประกอบด้วยโครงสร้างหลักที่ต้องควบคุมการเปลี่ยนแปลง:
- `docs/planning/`: เอกสารแผนงาน การออกแบบสถาปัตยกรรม และข้อกำหนดทางธุรกิจ
- `docs/testing/`: แผนและผลการทดสอบระบบ
- `docs/deployment/`: เอกสารและคู่มือการ Deploy
- `.agents/skills/`: Custom Skills และ Working Rules สำหรับ AI
- `frontend/`: โค้ดส่วน Frontend (React 18 + Vite 5 + MUI 5)
- `backend/`: โค้ดส่วน Backend (Node.js 20 LTS + Express 4)
- `database/`: Database Init Scripts, Seeders และ Migrations (MySQL 8)
- `docker-compose.yml`, `Dockerfile`: โครงสร้าง Environment และ Production Build

---

## 3. Branch Strategy
สำหรับโปรเจกต์นี้ แนะนำรูปแบบ **Feature Branch Workflow (Trunk-based with Feature Branches)** ซึ่งเหมาะสมที่สุดสำหรับการพัฒนาแบบ Phase-based และ AI-assisted Development:

```text
main (Production / Stable Branch)
 │
 ├── docs/setup-planning-foundation
 ├── feature/phase-1-project-setup
 ├── feature/phase-2-database-foundation
 ├── feature/phase-3-auth-members
 ├── feature/phase-4-book-management
 ├── feature/phase-5-borrow-return-workflow
 ├── fix/fine-calculation-rounding
 └── chore/update-docker-healthcheck
```

### รายละเอียดประเภทของ Branch:
- **`main`**: สาขาหลักที่เก็บโค้ดที่ผ่านการทดสอบและทำงานได้เสร็จสมบูรณ์ในแต่ละ Phase เป็น Single Source of Truth สำหรับ Production Deploy บน Railway
- **`feature/*`**: สาขาสำหรับพัฒนาแต่ละ Implementation Phase หรือ Feature ย่อยตาม Planning
- **`fix/*`**: สาขาสำหรับแก้ปัญหา Bug หรือข้อผิดพลาดที่พบหลังจากการทดสอบ
- **`docs/*`**: สาขาสำหรับการเพิ่มหรือปรับปรุงเอกสาร Planning / Architecture
- **`refactor/*`**: สาขาสำหรับปรับโครงสร้างโค้ดโดยไม่เปลี่ยนแปลงพฤติกรรมของระบบ
- **`chore/*`**: สาขาสำหรับงานจัดการทั่วไป เช่น อัปเดต Docker Config, Package Dependencies

### กติกาการใช้งาน Branch:
- สร้าง Branch ใหม่แยกออกจาก `main` ล่าสุดเสมอ
- หนึ่ง Branch รับผิดชอบเฉพาะ Scope ของงานหรือ Phase นั้น
- เมื่อเสร็จสิ้นการทดสอบและผ่าน Acceptance Criteria ให้ทำ Pull Request (หรือ Merge) เข้าสู่ `main` แล้วลบ Branch ย่อยทิ้ง

---

## 4. Branch Naming Convention
- ใช้ตัวพิมพ์เล็กทั้งหมด (**lowercase**)
- ใช้เครื่องหมายขีดกลาง (**`-`**) คั่นคำ
- ระบุ Prefix ตามประเภทของงาน ตามด้วยชื่องานที่กระชับและสื่อความหมาย

### ตัวอย่างชื่อ Branch:
- `feature/book-search`
- `feature/borrow-workflow`
- `feature/book-reservation`
- `feature/fine-calculation`
- `fix/database-connection-retry`
- `fix/overdue-notification-trigger`
- `docs/add-git-workflow`
- `docs/update-api-contract`
- `chore/update-docker-compose`

---

## 5. Commit Convention
โปรเจกต์นี้ใช้มาตรฐาน **Conventional Commits (v1.0.0)** เพื่อให้ประวัติการเปลี่ยนแปลงอ่านง่าย ตรวจสอบย้อนหลังได้อัตโนมัติ:

| Type | Description | ตัวอย่างการใช้งาน |
| :--- | :--- | :--- |
| **`feat`** | เพิ่มความสามารถใหม่ หรือเสร็จสิ้น Phase | การสร้างระบบยืมหนังสือ, การค้นหาหนังสือ |
| **`fix`** | แก้ไข Bug หรือข้อผิดพลาด | แก้ไขสูตรคำนวณค่าปรับ, แก้ไขสิทธิ์การเข้าถึง |
| **`docs`** | เพิ่มหรือแก้ไขเอกสาร | เพิ่ม Planning Doc, อัปเดต README.md |
| **`refactor`**| ปรับปรุงโค้ดโดยไม่กระทบ Business Logic | แยก Service Layer, ย้าย Helper Functions |
| **`test`** | เพิ่มหรือแก้ไขชุดการทดสอบ | เพิ่ม Unit Test ของ Fine Calculation |
| **`chore`** | งานจัดการระบบ, Config, Dependencies | ปรับ Dockerfile, อัปเดต ESLint |
| **`build`** | การเปลี่ยนแปลงระบบ Build หรือ Bundler | ปรับการตั้งค่า Vite, Multi-stage Docker Build |
| **`ci`** | การตั้งค่า Continuous Integration / Deploy | ปรับ Workflow Railway หรือ GitHub Actions |

---

## 6. Commit Message Format
รูปแบบโครงสร้างของ Commit Message:

```text
<type>: <short description>

[optional body - รายละเอียดเพิ่มเติมหรือเหตุผลในการเปลี่ยนแปลง]

[optional footer - เช่น Issue reference หรือ Phase reference]
```

### กฎการเขียน Commit Message:
- ใช้ภาษาอังกฤษเป็นหลัก
- ใช้ Imperative Mood ใน Description (เช่น `add`, `fix`, `implement`, `update`)
- สั้น กระชับ ชัดเจน และขึ้นต้นด้วยตัวพิมพ์เล็ก (หลัง `:` ให้เว้นวรรค 1 เคาะ)
- ไม่ใส่จุด `.` ปิดท้ายประโยคในบรรทัดแรก

---

## 7. When to Commit & When NOT to Commit

### ✅ ควรทำการ Commit เมื่อ:
- จัดทำเอกสาร Planning ในแต่ละ Step เสร็จสมบูรณ์
- เสร็จสิ้นการทำงานตาม Scope ของแต่ละ Implementation Phase
- แก้ไข Bug เฉพาะเรื่องเสร็จและผ่านการทดสอบ
- ปรับปรุงการตั้งค่า Environment หรือ Docker Configuration
- เพิ่มหรือปรับปรุงชุด Test Case ที่ทำงานได้สำเร็จ

### ❌ ห้ามทำการ Commit เมื่อ:
- โค้ดยังมีข้อผิดพลาดร้ายแรง (Broken Build / Syntax Error)
- ยังไม่ได้ตรวจสอบ `git status` และ `git diff`
- มีไฟล์ที่เป็นความลับ เช่น `.env`, Token, API Key หรือ Password จริง
- รวมงานหลาย Feature ที่ไม่เกี่ยวข้องกันไว้ใน Commit เดียว
- มีไฟล์ชั่วคราวหรือ Log ติดเข้ามา

---

## 8. Commit per Planning Step
ใน Phase 0 (Planning) ควรกำหนดการ Commit แยกทีละหัวข้อเอกสาร เพื่อให้มีประวัติที่ตรวจสอบย้อนหลังได้ชัดเจน:

```text
docs: add tech stack decision
docs: add AI working rules
docs: add documentation structure
docs: add git workflow
docs: add system overview
docs: add requirements
docs: add roles and permissions
docs: add library workflow
docs: add database design
docs: add API contract
docs: add frontend pages
docs: add dashboard and notifications
docs: add docker architecture
docs: add project context
docs: add implementation plan
```

---

## 9. Commit per Implementation Phase
เมื่อจบแต่ละ Implementation Phase ให้ใช้ Commit Message ที่ระบุเลข Phase ชัดเจนตาม `docs/planning/10-implementation-plan.md`:

```text
feat: complete phase 1 project setup and docker configuration
feat: complete phase 2 database schema and migrations
feat: complete phase 3 authentication and member management
feat: complete phase 4 book catalog and search modules
feat: complete phase 5 borrowing and return workflows
feat: complete phase 6 reservation and notification modules
feat: complete phase 7 admin dashboard and report features
```

---

## 10. Commit after Bug Fix
การแก้ไขข้อผิดพลาดต้องระบุปัญหาที่แก้ไขอย่างเจาะจง:
- `fix: resolve backend database connection timeout`
- `fix: prevent duplicate book reservation for same member`
- `fix: correct overdue fine calculation for leap years`
- `fix: fix member profile authorization check`
- `fix: resolve mysql healthcheck exit code in docker compose`

---

## 11. Commit after Documentation Change
เมื่อมีการปรับปรุงหรือแก้ไขเอกสาร ให้ระบุส่วนที่เปลี่ยนแปลง:
- `docs: update project context for fine rate policy`
- `docs: update API contract for book search filter`
- `docs: update database design for reservation status index`
- `docs: clarify book return workflow in documentation`
- `docs: update railway deployment troubleshooting guide`

---

## 12. Commit Validation Checklist
ก่อนที่ Developer หรือ AI จะทำการเสนอหรือรันคำสั่ง Commit ต้องตรวจสอบ Checklist ดังนี้:

- [ ] รัน `git status` เพื่อดูรายการไฟล์ที่มีการเปลี่ยนแปลง
- [ ] รัน `git diff` เพื่อตรวจสอบเนื้อหาที่แก้ไขว่าตรงตาม Scope หรือไม่
- [ ] ตรวจสอบว่าไม่มีไฟล์ `.env` หรือไฟล์ที่มี Credentials จริงถูก Track
- [ ] ตรวจสอบว่าไม่มี Secrets, API Keys, JWT Secret หรือ Password ปรากฏในโค้ด
- [ ] ตรวจสอบว่าไม่มีโฟลเดอร์ `node_modules/`, `dist/`, หรือ `logs/` ติดเข้ามา
- [ ] รันการทดสอบและยืนยันว่าโค้ดผ่านเงื่อนไขตาม Acceptance Criteria
- [ ] โครงสร้าง Commit Message ถูกต้องตาม Conventional Commits

---

## 13. Rollback Strategy
กลยุทธ์การย้อนกลับเมื่อเกิดปัญหาแบ่งออกเป็น 3 ระดับ:

### 1. Working Tree Level (ยังไม่ได้ Commit)
- ใช้ `git restore <file>` เพื่อยกเลิกการแก้ไขในไฟล์ที่ไม่ต้องการ
- ใช้ `git clean -fd` เพื่อลบไฟล์ที่ไม่ได้ Track (Untracked Files) ที่เกิดขึ้นโดยไม่ตั้งใจ

### 2. Commit Level (Commit แล้ว แต่ยังไม่ได้ Push)
- ใช้ `git reset --soft HEAD~1` เพื่อยกเลิก Commit ล่าสุด โดยยังคงเก็บการเปลี่ยนแปลงไว้ใน Staging Area
- ใช้ `git reset --mixed HEAD~1` เพื่อยกเลิก Commit และนำโค้ดกลับมาที่ Working Tree

### 3. Remote / Shared Level (Push ขึ้น GitHub ไปแล้ว)
- ใช้ `git revert <commit-hash>` เพื่อสร้าง Commit ใหม่ที่ยกเลิกการเปลี่ยนแปลงเดิมอย่างปลอดภัย โดยไม่สูญเสียประวัติการพัฒนา (Preserve Git History)

---

## 14. Revert Strategy vs Reset Strategy

| Feature | `git revert` (แนะนำ) | `git reset` (ใช้ด้วยความระมัดระวัง) |
| :--- | :--- | :--- |
| **พฤติกรรม** | สร้าง Commit ใหม่ที่ลบล้างผลของ Commit เดิม | ย้าย HEAD ย้อนกลับและลบ Commit ออกจากประวัติ |
| **ความปลอดภัย** | ปลอดภัย ไม่ทำลายประวัติเก่า | เสี่ยงต่อการสูญหายของโค้ด หากใช้ `--hard` |
| **การทำงานร่วมกัน**| ปลอดภัยเมื่อ Push ไปยัง GitHub แล้ว | ห้ามใช้กับ Shared Branches เด็ดขาด |
| **คำสั่ง AI** | AI ได้รับอนุญาตให้เสนอ `git revert` | AI **ห้ามรัน `git reset --hard`** เองโดยพลการ |

---

## 15. Files That Should Be Committed
- **Source Code**: ไฟล์โค้ดจริงใน `frontend/src/`, `backend/src/`
- **Documentation**: เอกสารใน `docs/`, `README.md`, `SKILL.md`
- **Configuration Templates**: `.env.example`
- **Docker Architecture**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- **Database Scripts**: `database/init.sql`, Migration Scripts, Seeders
- **Package Manifests**: `package.json`, `package-lock.json`
- **Test Suites**: Unit Tests, Integration Tests, Mock Data

---

## 16. Files That Should NOT Be Committed
- **Environment & Secrets**: `.env`, `.env.local`, `.env.production`
- **Private Keys & Certificates**: `*.pem`, `*.key`, `id_rsa`
- **Dependencies**: `node_modules/`, `vendor/`
- **Build Artifacts**: `dist/`, `build/`, `out/`, `*.tsbuildinfo`
- **Logs & Runtime Data**: `logs/`, `*.log`, `npm-debug.log*`
- **IDE / OS Metadata**: `.vscode/`, `.idea/`, `.DS_Store`, `Thumbs.db`
- **Database Real Data**: MySQL Data Dumps ที่มีข้อมูลส่วนบุคคลจริง

---

## 17. `.gitignore` Guidelines (Reference Template)
ตัวอย่างโครงสร้างไฟล์ `.gitignore` ที่ควรนำไปกำหนดในโปรเจกต์:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build Outputs
dist/
build/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database Storage
database/data/
*.sql.gz

# Operating System & IDE
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json

# Temporary & Cache
.cache/
.eslintcache
```

---

## 18. AI Git Rules
ข้อบังคับสำหรับ AI Coding Assistant:
1. **ห้าม Commit อัตโนมัติ** โดยไม่ได้รับคำสั่งยืนยันจากผู้ใช้
2. **ห้ามรัน `git push` หรือ `git push --force`** โดยไม่ได้รับอนุญาต
3. ต้องแสดงผลการตรวจ `git status` และเสนอ **Recommended Git Commit Message** ในทุกรายงานจบ Phase
4. ห้ามรวมการแก้ไขข้าม Phase เข้าไว้ใน Commit เดียวกัน
5. ต้องหยุดการทำงานทันทีหากพบว่ามี Secret หรือ `.env` อยู่ใน Staged Changes

---

## 19. GitHub Workflow
กระบวนการพัฒนาและส่งมอบงานผ่าน GitHub:

```text
1. สร้าง Feature Branch จาก main (เช่น feature/borrow-workflow)
                 ↓
2. ดำเนินการ Implementation เฉพาะ Scope ที่ได้รับมอบหมาย
                 ↓
3. รันการทดสอบ (Unit / Integration Tests)
                 ↓
4. ตรวจสอบ git status และ git diff
                 ↓
5. Commit งานด้วย Conventional Commit Format
                 ↓
6. Push Branch ขึ้นสู่ GitHub Repository
                 ↓
7. สร้าง Pull Request (PR) ไปยัง main พร้อมกรอก PR Template
                 ↓
8. ทำการ Code Review และยืนยันผลการทดสอบ
                 ↓
9. Merge PR เข้าสู่ main (แบบ Squash & Merge หรือ Rebase)
```

---

## 20. Pull Request (PR) Rules
ทุก Pull Request ต้องมีรายละเอียดครบถ้วน:
- **Title**: ตั้งชื่อตาม Conventional Commits (เช่น `feat: implement book borrowing workflow (Phase 5)`)
- **Scope & Phase**: ระบุ Phase และสิ่งที่ทำ
- **Changes Summary**: สรุปรายการไฟล์ที่สร้างหรือแก้ไข
- **Test Evidence**: แสดงผลการทดสอบและภาพประกอบ (หากเป็น Frontend UI)
- **Acceptance Criteria**: เช็กลิสต์ความสมบูรณ์ตาม Planning
- **No Unrelated Code**: ห้ามมีโค้ดที่ไม่เกี่ยวข้องกับ Phase นั้นปนเข้ามา

---

## 21. Release / Tagging Guidelines
สำหรับการส่งมอบระบบตาม Milestone สำคัญ ให้ใช้ Git Tag (Semantic Versioning):
- `v0.1.0-alpha`: สิ้นสุด Phase 0 (Planning & Setup)
- `v0.5.0-beta`: สิ้นสุด Core Business Features (ยืม-คืน-จองหนังสือ)
- `v1.0.0`: ระบบเสร็จสมบูรณ์พร้อม Deploy ขึ้น Production (Railway)

---

## 22. AI Safety Rules & Confirmation Triggers
AI **ต้องหยุดและขอการยืนยันจากผู้ใช้ก่อนเสมอ** หากต้องเกี่ยวข้องกับคำสั่งที่มีความเสี่ยงสูงดังนี้:
- `git reset --hard`
- `git push --force` หรือ `git push --force-with-lease`
- การแก้ไขหรือ Rewrite ประวัติ Git ในอดีต (Interactive Rebase)
- การลบ Branch สำคัญหรือการลบไฟล์จำนวนมาก
- การกู้คืนข้อมูลหรือ Rollback โครงสร้าง Database
