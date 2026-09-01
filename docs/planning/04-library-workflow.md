# Library Workflow Specification: Online Library Management System

**Project:** Online Library Management System (ระบบจัดการห้องสมุดออนไลน์)  
**Document ID:** `04-library-workflow.md`  
**Phase:** Phase 1 — Planning Only (Step 4: Library Workflow)  
**Status:** Under Review  
**Date:** 2026-08-28  

---

## 1. Purpose
เอกสารฉบับนี้จัดทำขึ้นเพื่อออกแบบและวิเคราะห์กระบวนการทำงานทางธุรกิจ (Business Workflows), วงจรสถานะของข้อมูล (State Lifecycles), เงื่อนไขการเปลี่ยนสถานะ (State Transitions), การจัดการข้อยกเว้น (Exception Handling), และการรักษาความถูกต้องของข้อมูลพร้อมกัน (Data Consistency & Concurrency) สำหรับ **Online Library Management System** เพื่อใช้เป็นกรอบมาตรฐานในการออกแบบโครงสร้างฐานข้อมูล (Database Schema), การกำหนด API Contract, และการพัฒนา Frontend Interaction ในลำดับถัดไป

---

## 2. Reference Documents
เอกสารที่ใช้อ้างอิงร่วมในการออกแบบ Workflow:
1. `docs/planning/01-system-overview.md` — วัตถุประสงค์ ขอบเขต และภาพรวมระบบ
2. `docs/planning/02-requirements.md` — ข้อกำหนดความต้องการ (FR-001 ถึง FR-034, BR-001 ถึง BR-008)
3. `docs/planning/03-roles-permissions.md` — ขอบเขตบทบาท สิทธิ์ และการควบคุมการเข้าถึง (RBAC)
4. `docs/planning/00-tech-stack-decision.md` — เทคโนโลยีและสถาปัตยกรรมที่ได้รับอนุมัติ

---

## 3. Workflow Overview
กระบวนการทำงานหลักของระบบห้องสมุดถูกเชื่อมโยงกันอย่างเป็นระบบตั้งแต่การค้นหา การยืม การคืน การจอง การคิดค่าปรับ และการแจ้งเตือน โดยมีแผนภาพกระบวนการระดับสูงดังนี้:

```text
               ┌──────────────────────────────────────────────┐
               ▼                                              │
    [ 1. Search & Catalog ]                                   │
               │                                              │
               ├─────────────────────────┐                    │
               ▼ (Available > 0)         ▼ (Available = 0)    │
     [ 2. Borrowing Flow ]      [ 3. Reservation Flow ]       │
               │                         │                    │
               ▼                         ▼ (When Returned)    │
    [ 4. Active Borrowing ] ◄──── [ 5. Available to Claim ]   │
               │                                              │
               ├─────────────────────────┐                    │
               ▼ (On-time)               ▼ (Past Due Date)    │
     [ 6. Normal Return ]        [ 7. Overdue Flow ]          │
               │                         │                    │
               │                         ▼                    │
               │               [ 8. Fine Calculation ]        │
               │                         │                    │
               │                         ▼                    │
               │               [ 9. Fine Settlement ]         │
               │                         │                    │
               └────────────┬────────────┘                    │
                            ▼                                 │
                 [ 10. Update Stock & Queue ] ────────────────┘
```

---

## 4. Actors & Responsibilities in Workflows
1. **Member (สมาชิก):** ผู้ค้นหาหนังสือ ทำรายการขอยืมหนังสือ จองหนังสือ ยกเลิกการจอง ตรวจสอบวันส่งคืน และรับการแจ้งเตือน
2. **Librarian (เจ้าหน้าที่):** ผู้ตรวจสอบความถูกต้อง ดำเนินการยืม-คืนที่เคาน์เตอร์ จัดสรรหนังสือจอง และบันทึกการรับชำระค่าปรับ
3. **Admin (ผู้ดูแลระบบ):** ผู้กำกับดูแลกระบวนการ กำหนดค่านโยบายของระบบ (ระยะเวลายืม/อัตราค่าปรับ) และตรวจสอบ Audit Logs
4. **System Scheduler (ระบบอัตโนมัติ):** ทำหน้าที่ตรวจสอบวันครบกำหนดส่ง ตรวจจับรายการ Overdue คำนวณค่าปรับเบื้องต้น และส่งการแจ้งเตือนตามรอบเวลา

---

## 5. Book Search Workflow

```text
[ Member / Guest ] ──► [ ป้อนคำค้นหา / กรองหมวดหมู่ ]
                             │
                             ▼
                    [ ระบบประมวลผลคำค้น ]
                             │
             ┌───────────────┴───────────────┐
             ▼                               ▼
     [ พบรายการหนังสือ ]             [ ไม่พบรายการ (Empty State) ]
             │                               │
             ▼                               ▼
   [ แสดงรายการและสถานะสต็อก ]       [ แสดงปุ่มเคลียร์ตัวกรอง / แนะนำคำค้น ]
             │
             ▼
   [ เลือกดูรายละเอียดเล่ม ]
             │
     ┌───────┴───────┐
     ▼               ▼
[ สต็อกว่าง > 0 ]  [ สต็อกว่าง = 0 ]
  (ปุ่ม "ยืม")      (ปุ่ม "จอง")
```

- **Actor:** Member, Librarian, Admin, Guest (Public)
- **Input:** Keyword (Title, Author, ISBN), Category Filter, Availability Filter, Sort Order
- **Process:** ตรวจสอบคำค้น คัดกรองข้อมูล และดึงจำนวนสำเนาพร้อมยืมแบบ Realtime
- **Expected Result:** แสดงรายการหนังสือพร้อมสถานะความพร้อมและปุ่ม Action ที่สอดคล้องกับสต็อก
- **Exceptions:** ป้อนคำค้นหาว่าง (แสดงหนังสือยอดนิยม/ล่าสุด), ไม่พบข้อมูล (แสดง Empty State ที่เป็นมิตร)

---

## 6. Borrowing Workflow

```text
[ Member / Librarian ] ──► [ เลือกหนังสือที่ต้องการยืม ]
                                   │
                                   ▼
                       [ ตรวจสอบสถานะสมาชิก (Active) ]
                                   │
                                   ▼
                       [ ตรวจสอบโควตา & ยอดค้างส่ง/ค่าปรับ ]
                                   │
                                   ▼
                       [ ตรวจสอบสต็อกหนังสือ (Available > 0) ]
                                   │
                                   ▼
                     [ สร้าง Borrow Record & ตัดสต็อก 1 เล่ม ]
                                   │
                                   ▼
                     [ คำนวณวันครบกำหนดส่ง (Due Date) ]
                                   │
                                   ▼
                [ ปรับสถานะเป็น "Borrowed" & ส่งการแจ้งเตือน ]
```

- **Actor:** Member (Self-request), Librarian (Counter Checkout), System
- **Preconditions:** สมาชิกเข้าสู่ระบบ สถานะ Active, ไม่มียอดหนี้หรือรายการค้างส่งเกินเกณฑ์, หนังสือมีสำเนาว่าง
- **Validation:** ตรวจสอบโควตาสูงสุด, ตรวจสอบว่าไม่เคยยืมเล่มเดียวกันซ้ำที่ยังไม่คืน
- **Process:** ทำงานภายใต้ Database Transaction (สร้าง Borrow Record -> ตัด Available Stock -> คำนวณ Due Date -> ส่ง Notification)
- **Result:** ได้รับรายการยืมสถานะ `Borrowed` พร้อมวันครบกำหนดส่ง

---

## 7. Returning Workflow

```text
[ Librarian / Member ] ──► [ ทำรายการคืนหนังสือตาม Borrow ID ]
                                   │
                                   ▼
                       [ ตรวจสอบสถานะรายการยืม ]
                                   │
                                   ▼
                  [ เปรียบเทียบ วันที่คืนจริง vs Due Date ]
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
         [ คืนตรงเวลา / ก่อนกำหนด ]           [ คืนเกินกำหนด (Overdue) ]
                  │                                 │
                  │                                 ▼
                  │                       [ คำนวณค่าปรับอัตโนมัติ ]
                  │                                 │
                  │                                 ▼
                  │                       [ สร้าง Fine Record "Unpaid" ]
                  │                                 │
                  └────────────────┬────────────────┘
                                   ▼
                 [ ปรับสถานะรายการยืมเป็น "Returned" ]
                                   │
                                   ▼
                       [ เพิ่มสต็อกหนังสือคืน 1 เล่ม ]
                                   │
                                   ▼
                     [ ตรวจสอบคิวการจอง (Reservation) ]
                                   │
                  ┌────────────────┴────────────────┐
                  ▼                                 ▼
           [ มีคิวจองรออยู่ ]                [ ไม่มีคิวจอง ]
                  │                                 │
                  ▼                                 ▼
     [ ล็อคให้คิวแรก & แจ้งเตือนผู้จอง ]      [ คืนสต็อกสู่สถานะพร้อมยืมทั่วไป ]
```

- **Actor:** Librarian (Counter Return), Member, System
- **Process:** บันทึกวันที่คืนจริง คืนสต็อก ตรวจสอบความล่าช้า หากเกินกำหนดสร้างรายการค่าปรับ และตรวจสอบคิวจองต่อทันที

---

## 8. Overdue Workflow

```text
[ System Scheduler (Daily Check) ]
               │
               ▼
[ ดึงรายการยืมสถานะ "Borrowed" ที่พ้น Due Date ]
               │
               ▼
[ ปรับสถานะรายการเป็น "Overdue" ]
               │
               ▼
[ ส่งการแจ้งเตือน Overdue Alert ไปยัง Member ]
               │
               ▼
[ คำนวณยอดค่าปรับสะสมเบื้องต้นแบบ Realtime ]
               │
               ▼
[ ติดตามจนกระทั่งสมาชิกนำหนังสือมาคืน ]
```

- **Trigger:** Background Scheduler ทำงานตรวจสอบทุกวันเวลาเที่ยงคืน (00:00 น.)
- **Status Change:** `Borrowed` -> `Overdue`
- **Notification:** ส่ง In-App Notification แจ้งเตือนสถานะเกินกำหนดและยอดค่าปรับที่กำลังสะสม

---

## 9. Fine Workflow

```text
[ ตรวจพบการคืนเกินกำหนด (Overdue Return) ]
               │
               ▼
[ คำนวณจำนวนวันที่เกินกำหนด (Return Date - Due Date) ]
               │
               ▼
[ คำนวณยอดเงินค่าปรับ = วันที่เกิน x อัตราค่าปรับต่อวัน ]
               │
               ▼
[ บันทึก Fine Record สถานะ "Unpaid" ]
               │
               ▼
[ สมาชิกชำระค่าปรับที่เคาน์เตอร์ / เจ้าหน้าที่บันทึกรับชำระ ]
               │
               ▼
[ ปรับสถานะ Fine เป็น "Paid" (หรือ "Waived" โดย Admin) ]
               │
               ▼
[ ปลดล็อคสิทธิ์สมาชิกสู่สถานะปกติ ]
```

> **ข้อกำหนด:** ในเฟสนี้ไม่มีระบบ Payment Gateway ตัดบัตรออนไลน์ การรับชำระเงินจะบันทึกผ่านเจ้าหน้าที่ Librarian หรือ Admin เท่านั้น

---

## 10. Reservation Workflow

```text
[ Member ] ──► [ เลือกหนังสือที่สต็อกว่าง = 0 ]
                     │
                     ▼
         [ ตรวจสอบสิทธิ์การจอง ]
                     │
                     ▼
         [ สร้างรายการจองสถานะ "Pending" (เข้าคิว) ]
                     │
                     ▼
    ... รอจนกระทั่งมีผู้คืนหนังสือเล่มนั้น ...
                     │
                     ▼
[ ระบบล็อคหนังสือให้คิวแรก & ปรับสถานะเป็น "Available" ]
                     │
                     ▼
     [ กำหนดวันหมดสิทธิ์รับ (Hold Expiration Date) ]
                     │
                     ▼
       [ ส่งแจ้งเตือน "หนังสือพร้อมให้ยืม" ]
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[ สมาชิกมารับหนังสือภายในกำหนด ]  [ พ้นกำหนดวันรับหนังสือ (Expired) ]
       │                           │
       ▼                           ▼
[ แปลงเป็นรายการยืม (Fulfilled) ] [ ปรับสถานะเป็น "Expired" ]
                                   │
                                   ▼
                         [ ส่งมอบสิทธิ์ให้คิวถัดไป ]
```

- **Cancellation by Member:** สมาชิกสามารถกดยกเลิกการจองของตนเองได้ตลอดเวลาขณะที่สถานะเป็น `Pending` โดยระบบจะปรับสถานะเป็น `Cancelled` และเลื่อนคิวถัดไปขึ้นมาแทน

---

## 11. Notification Workflow

| ประเภทการแจ้งเตือน (Type) | เหตุการณ์กระตุ้น (Trigger Event) | ผู้รับ (Recipient) | ข้อความ / เนื้อหาแจ้งเตือน | สถานะเริ่มต้น |
| :--- | :--- | :--- | :--- | :---: |
| **Borrow Success** | ยืมหนังสือสำเร็จ | Member | ยืมหนังสือสำเร็จ กำหนดส่งคืนวันที่ [Due Date] | `Unread` |
| **Due Date Reminder** | ก่อนถึง Due Date 1-2 วัน | Member | แจ้งเตือน: หนังสือ [Title] ใกล้ครบกำหนดส่งในวันที่ [Due Date] | `Unread` |
| **Overdue Alert** | พ้น Due Date แล้วยังไม่คืน | Member | ด่วน: หนังสือ [Title] เกินกำหนดส่งแล้ว โปรดนำส่งคืนเพื่อหลีกเลี่ยงค่าปรับ | `Unread` |
| **Reservation Available** | หนังสือจองถูกส่งคืนและถึงคิว | Member | หนังสือ [Title] ที่ท่านจองพร้อมให้ยืมแล้ว โปรดมารับภายในวันที่ [Expiry Date] | `Unread` |
| **Fine Issued** | บันทึกการคืนหนังสือล่าช้า | Member | มีการบันทึกค่าปรับจำนวน [Amount] บาท จากการคืนหนังสือเกินกำหนด | `Unread` |
| **Fine Paid** | เจ้าหน้าที่บันทึกรับเงินค่าปรับ | Member | บันทึกการชำระค่าปรับจำนวน [Amount] บาท เรียบร้อยแล้ว | `Unread` |

---

## 12. Workflow Status Definitions

### 12.1 Borrow Status
- `Borrowed`: หนังสือถูกยืมออกไปแล้วและอยู่ระหว่างระยะเวลาการยืมปกติ
- `Overdue`: หนังสือยังไม่ถูกส่งคืนและพ้นวันครบกำหนดส่ง (Due Date) แล้ว
- `Returned`: สมาชิกส่งคืนหนังสือเรียบร้อยแล้วและปิดรายการยืมสมบูรณ์

### 12.2 Reservation Status
- `Pending`: รายการจองอยู่ในคิว รอหนังสือถูกส่งคืน
- `Available`: หนังสือพร้อมให้มารับ โดยสิทธิ์ถูกล็อคไว้ให้สมาชิกตามระยะเวลาที่กำหนด
- `Fulfilled`: สมาชิกมารับหนังสือและถูกแปลงเป็นรายการยืมสำเร็จ
- `Cancelled`: สมาชิกยกเลิกการจองด้วยตนเอง
- `Expired`: สมาชิกไม่มารับหนังสือภายในระยะเวลาที่กำหนด สิทธิ์ตกเป็นของคิวถัดไป

### 12.3 Fine Status
- `Unpaid`: ค่าปรับถูกคำนวณและบันทึกค้างชำระในระบบ
- `Paid`: สมาชิกชำระค่าปรับครบถ้วนเรียบร้อยแล้ว
- `Waived`: ค่าปรับได้รับการยกเว้นหรือปรับลดโดย Admin ด้วยเหตุจำเป็น

### 12.4 Notification Status
- `Unread`: ข้อความแจ้งเตือนยังไม่ถูกเปิดอ่าน
- `Read`: สมาชิกเปิดอ่านข้อความแจ้งเตือนแล้ว

---

## 13. State Transition Matrix

### 13.1 Borrowing State Transitions

| Current Status | Event / Action | Actor | Next Status | เงื่อนไขการเปลี่ยนสถานะ (Condition) |
| :--- | :--- | :--- | :--- | :--- |
| *(None)* | Create Borrow | Member / Librarian | `Borrowed` | สมาชิก Active, สต็อกว่าง > 0, ไม่มียอดหนี้ค้าง |
| `Borrowed` | Pass Due Date | System Scheduler | `Overdue` | วันปัจจุบัน > Due Date และยังไม่คืน |
| `Borrowed` | Return Book | Librarian / Member | `Returned` | วันปัจจุบัน <= Due Date |
| `Overdue` | Return Book | Librarian / Member | `Returned` | มีการส่งคืนหนังสือพร้อมบันทึกค่าปรับ |

### 13.2 Reservation State Transitions

| Current Status | Event / Action | Actor | Next Status | เงื่อนไขการเปลี่ยนสถานะ (Condition) |
| :--- | :--- | :--- | :--- | :--- |
| *(None)* | Create Reservation | Member | `Pending` | สต็อกว่าง = 0, ไม่เคยจองเล่มนี้ค้างไว้ |
| `Pending` | Book Returned (Top Queue) | System | `Available` | มีการคืนหนังสือและเป็นคิวลำดับแรก |
| `Pending` | Cancel Reservation | Member / Librarian | `Cancelled` | สมาชิกขอยกเลิกขณะยังไม่ถึงคิว |
| `Available` | Claim / Borrow Book | Member / Librarian | `Fulfilled` | สมาชิกมารับหนังสือภายใน Expiration Date |
| `Available` | Expiration Passed | System Scheduler | `Expired` | สมาชิกไม่มารับภายในเวลาที่กำหนด |

---

## 14. Exception / Error Workflows

| เหตุการณ์ผิดปกติ (Exception) | ผลกระทบ | การจัดการในระดับกระบวนการ (Business Handling) |
| :--- | :--- | :--- |
| **ยืมหนังสือขณะสต็อกเป็น 0** | สต็อกติดลบ | ปฏิเสธคำขอ แจ้งข้อความเตือน และเสนอให้สมาชิกทำรายการ "จอง" แทน |
| **สมาชิกมียอดหนี้ค่าปรับค้างชำระ** | เสี่ยงต่อหนี้สูญ | บล็อคการทำรายการยืมเล่มใหม่ชั่วคราว แจ้งให้สมาชิกชำระค่าปรับเดิมก่อน |
| **จองหนังสือซ้ำเล่มเดิม** | แย่งคิวสมาชิกอื่น | ปฏิเสธคำขอจอง แจ้งเตือนว่ามีรายการจองหนังสือเล่มนี้อยู่แล้ว |
| **ผู้จองไม่มารับหนังสือตามกำหนด** | หนังสือค้างสต็อก | ปรับสถานะเป็น `Expired` ส่งต่อสิทธิ์ให้คิวลำดับถัดไป หรือคืนสต็อกพร้อมยืมทั่วไป |
| **คืนหนังสือที่ไม่พบรายการยืม** | ข้อมูลผิดพลาด | ปฏิเสธการคืน และแจ้งเจ้าหน้าที่เพื่อตรวจสอบประวัติทางกายภาพ |
| **ระบบส่ง Notification ล้มเหลว** | ข้อมูลแจ้งเตือนตกหล่น | บันทึก Error Log โดยธุรกรรมหลัก (ยืม-คืน-จอง) ยังคงสำเร็จตามปกติ |

---

## 15. Data Consistency Rules
1. **Stock Invariant:** จำนวนสำเนาทั้งหมด (`Total Copies`) ต้องเท่ากับ จำนวนพร้อมยืม (`Available Copies`) + จำนวนที่ถูกยืม (`Borrowed Copies`) + จำนวนที่ถูกล็อคให้ผู้จอง (`Reserved Hold Copies`) เสมอ
2. **Non-negative Stock:** `Available Copies` ต้องไม่ต่ำกว่า 0 ในทุกกรณี
3. **Queue Integrity:** ลำดับคิวการจองต้องเรียงตามเวลาที่สร้างรายการ (`created_at`) แบบ First-Come, First-Served อย่างเคร่งครัด
4. **Transaction Atomicity:** การยืม-คืน-จองหนังสือ ต้องทำงานแบบ Atomic Operation (สำเร็จทั้งหมดหรือย้อนกลับทั้งหมด)

---

## 16. Concurrent Action Scenarios (การจัดการธุรกรรมพร้อมกัน)

| สถานการณ์ที่มีการแย่งชิงทรัพยากร (Concurrency) | ผลลัพธ์ทางธุรกิจที่ถูกต้อง (Expected Business Result) |
| :--- | :--- |
| **สมาชิก 2 คนกดยืมหนังสือเล่มสุดท้ายพร้อมกัน** | สมาชิกคนแรกที่ Request ถึงระบบก่อนจะได้รับสิทธิ์ยืม ส่วนคนที่สองจะได้รับข้อความแจ้งว่าหนังสือหมด และเสนอให้จองแทน |
| **สมาชิก 2 คนกดจองหนังสือพร้อมกัน** | ได้รับสิทธิ์จองทั้งคู่ แต่ระบบจะจัดสรรลำดับคิวตาม Timestamp ที่ละเอียดระดับมิลลิวินาที (Queue 1 และ Queue 2) |
| **Librarian บันทึกรับคืน ขณะที่ Member กดยกเลิกจอง** | การคืนหนังสือจะสำเร็จ และระบบจะตรวจสอบคิวใหม่อัตโนมัติโดยข้ามคิวที่พึ่งยกเลิกไปยังคิวถัดไป |

---

## 17. Business Workflow Rules
- **BR-WF-001 (Due Date Calculation):** วันครบกำหนดส่งต้องถูกคำนวณที่ Backend ทันทีที่มีการสร้างรายการยืม
- **BR-WF-002 (Single Active Borrow per Copy):** สำเนาหนังสือ 1 เล่มสามารถถูกยืมได้โดยสมาชิก 1 คนในเวลาเดียวกันเท่านั้น
- **BR-WF-003 (Reservation Priority):** เมื่อหนังสือที่มีคิวจองถูกส่งคืน สิทธิ์การยืมจะถูกสงวนไว้ให้ผู้จองคิวแรกเท่านั้น สมาชิกทั่วไปจะไม่สามารถกดยืมเล่มนั้นได้จนกว่าจะหมดเวลา Hold Expiration
- **BR-WF-004 (Immutable Fine History):** รายการค่าปรับที่ถูกชำระ (`Paid`) หรือยกเว้น (`Waived`) แล้ว จะไม่สามารถแก้ไขหรือลบประวัติได้

---

## 18. Requirement Traceability Matrix

| Workflow Domain | Functional Requirements | User Roles | Business Rules |
| :--- | :--- | :--- | :--- |
| **Book Search & Catalog** | `FR-011`, `FR-012`, `FR-013`, `FR-014` | Member, Librarian, Admin | `BR-002` |
| **Borrowing Workflow** | `FR-015`, `FR-016`, `FR-017` | Member, Librarian | `BR-001`, `BR-002`, `BR-003` |
| **Returning Workflow** | `FR-018`, `FR-019` | Librarian, Member | `BR-004`, `BR-007` |
| **Overdue & Fine Workflow** | `FR-023`, `FR-024`, `FR-025` | System, Librarian, Admin | `BR-004`, `BR-008` |
| **Reservation Workflow** | `FR-020`, `FR-021`, `FR-022` | Member, Librarian, System | `BR-005`, `BR-006`, `BR-007` |
| **Notification Workflow** | `FR-026`, `FR-027`, `FR-028` | System -> Member | `BR-007` |

---

## 19. Open Questions (ประเด็น Workflow ที่ต้องการการยืนยัน)

| ID | คำถาม / ข้อสงสัยเกี่ยวกับกระบวนการทำงาน | Workflows ที่เกี่ยวข้อง | ผลกระทบ | ลำดับความสำคัญ |
| :--- | :--- | :--- | :---: | :---: |
| **OQ-WF-001** | ในกระบวนการยืม เมื่อสมาชิกกดยืมผ่านเว็บ เป็นการขอยืมแล้วมารับเล่มที่เคาน์เตอร์ หรือเป็นการบันทึกยืมสำเร็จทันที? | Borrowing | High | High |
| **OQ-WF-002** | สมาชิกสามารถต่ออายุการยืมหนังสือออนไลน์ (Renew Borrowing) ด้วยตนเองได้หรือไม่ และต่อได้กี่ครั้ง? | Borrowing, Returning | Medium | High |
| **OQ-WF-003** | หากหนังสือชำรุดหรือสูญหายระหว่างการยืม มีขั้นตอนการปรับสถานะและคิดค่าชดเชยอย่างไร? | Returning, Fine | Medium | Medium |
| **OQ-WF-004** | การแจ้งเตือนก่อนวันครบกำหนด (Due Date Reminder) ควรส่งล่วงหน้ากี่วัน (เช่น ล่วงหน้า 1 วัน หรือ 2 วัน)? | Notification, Overdue | Low | Medium |

---

## 20. Assumptions
1. การส่งคืนหนังสือและการชำระค่าปรับจะดำเนินการผ่านเจ้าหน้าที่ ณ เคาน์เตอร์บริการห้องสมุดเป็นหลัก
2. การคำนวณค่าปรับจะเริ่มนับตั้งแต่วันถัดจาก Due Date จนถึงวันที่ส่งคืนจริง
3. รายการแจ้งเตือนทั้งหมดจะถูกบันทึกลงในระบบ In-App Notification เพื่อให้สมาชิกเปิดดูได้เมื่อเข้าใช้งานเว็บ

---

## 21. Risks & Mitigation Strategies
- **ความเสี่ยงการจัดสรรคิวจองผิดพลาด:** ป้องกันโดยใช้ Database Transactions และ Timestamp ระดับมิลลิวินาทีในการจัดลำดับคิว
- **ความเสี่ยงการคิดค่าปรับไม่ตรงกัน:** รวมสูตรการคำนวณค่าปรับไว้ที่ Backend Service เพียงจุดเดียว (Single Source of Truth)
- **ความเสี่ยงหนังสือถูกล็อคค้างจากคิวจอง:** กำหนดระบบ Scheduler ยกเลิกคิวที่หมดอายุ (`Expired`) อัตโนมัติทุกวัน

---

## 22. Summary
เอกสาร **Library Workflow Specification** ฉบับนี้ได้ออกแบบกระบวนการทำงานของระบบห้องสมุดออนไลน์ครอบคลุม 16 กระบวนการย่อย ทั้งในสถานการณ์ปกติ (Happy Path), สถานการณ์ผิดปกติ (Exceptions), ตารางการเปลี่ยนสถานะ (State Transitions), และกฎความถูกต้องของข้อมูล (Data Consistency) ไว้อย่างสมบูรณ์ เอกสารนี้พร้อมนำไปใช้เป็นรากฐานสำคัญสำหรับการออกแบบโครงสร้างฐานข้อมูลใน **Planning Step 5: Database Design (`05-database-design.md`)** ต่อไป
