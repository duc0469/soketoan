# 📊 Tóm Tắt Dự Án - Hệ Thống Kế Toán Tự Động

## 🎯 Mục Đích

Hệ thống kế toán tự động giúp doanh nghiệp:

- Upload sao kê ngân hàng (PDF, CSV, Excel)
- Tự động phân loại giao dịch theo rules
- Tạo sổ kế toán theo chuẩn VAS
- Xuất báo cáo Excel

---

## 🏗️ Kiến Trúc

### Tech Stack

**Frontend:**

- React 18
- TanStack Query (React Query)
- React Hot Toast

**Backend:**

- Node.js + Express
- MySQL 8.0
- Multer (file upload)
- XLSX, PDF-parse (parsing)

**Deployment:**

- Frontend: Port 3000
- Backend: Port 5000
- Database: MySQL Port 3306

---

## 📁 Cấu Trúc Dự Án

```
accounting-system/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MySQL connection
│   │   ├── routes/               # API routes
│   │   │   ├── upload.js         # Upload & parse
│   │   │   ├── transactions.js   # CRUD transactions
│   │   │   ├── rules.js          # CRUD rules
│   │   │   ├── ledgers.js        # View ledgers
│   │   │   └── export.js         # Export Excel
│   │   ├── utils/
│   │   │   ├── parser.js         # Parse PDF/CSV/Excel
│   │   │   └── ruleEngine.js     # Classification logic
│   │   └── server.js             # Express app
│   ├── clear-data.js             # Utility: Clear database
│   ├── fix-priorities.js         # Utility: Fix rule priorities
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js         # API client
│   │   ├── components/
│   │   │   ├── UploadZone.jsx
│   │   │   ├── TransactionGrid.jsx
│   │   │   ├── TransactionRow.jsx
│   │   │   ├── TransactionToolbar.jsx
│   │   │   ├── LedgerView.jsx
│   │   │   ├── LedgerFilter.jsx
│   │   │   ├── LedgerSummary.jsx
│   │   │   ├── DeductibleExpensesView.jsx
│   │   │   ├── ExportButton.jsx
│   │   │   └── RulesManager.jsx
│   │   ├── utils/format.js       # Format helpers
│   │   ├── App.jsx               # Main app
│   │   └── index.jsx
│   └── package.json
│
├── database/
│   ├── schema.sql                # Database schema
│   └── migration-*.sql           # Migration scripts
│
└── Documentation/
    ├── README.md                 # Main documentation
    ├── SETUP.md                  # Setup guide
    ├── QUICKSTART.md             # Quick start
    ├── API.md                    # API documentation
    ├── ARCHITECTURE.md           # Architecture
    ├── PROJECT_STRUCTURE.md      # Project structure
    ├── CHANGELOG.md              # Change history
    ├── FAQ.md                    # FAQ
    ├── TROUBLESHOOTING.md        # Troubleshooting
    ├── TODO.md                   # Future tasks
    └── PROJECT_SUMMARY.md        # This file
```

---

## 🚀 Tính Năng Chính

### 1. Upload & Parse

- ✅ Hỗ trợ PDF, CSV, XLSX, XLS
- ✅ Tự động detect header row
- ✅ Parse ngày nhiều định dạng
- ✅ Xử lý "Tiền ra" / "Tiền vào" riêng biệt
- ✅ Bỏ qua dòng không hợp lệ

### 2. Phân Loại Tự Động

- ✅ 13+ rules mặc định
- ✅ Rule engine với priority
- ✅ Tự động gán TK Nợ/Có
- ✅ Phân loại sổ (Chi phí, Công nợ, Tiền mặt)

### 3. Quản Lý Giao Dịch

- ✅ View/Edit/Delete transactions
- ✅ Bulk select & confirm
- ✅ Inline editing
- ✅ Status tracking (PENDING/CONFIRMED)

### 4. Sổ Kế Toán

- ✅ **Sổ Cái**: Tất cả giao dịch
- ✅ **Sổ Chi Phí**: Tất cả trừ công nợ
- ✅ **Sổ Công Nợ**: Chỉ công nợ
- ✅ **Chi Phí Được Trừ**: Chi phí khấu trừ thuế (TK Nợ 6xx)
- ✅ Filter theo ngày, loại sổ
- ✅ Tổng hợp thống kê

### 5. Export Excel

- ✅ 4 sheets riêng biệt
- ✅ Tách "Tiền ra" / "Tiền vào"
- ✅ Dòng "TỔNG CỘNG" tự động
- ✅ Format đẹp, dễ đọc

### 6. Quản Lý Rules

- ✅ CRUD rules
- ✅ Priority management
- ✅ Test rule với sample text
- ✅ Enable/Disable rules

---

## 📊 Database Schema

### Tables

1. **upload_batches** - Lưu thông tin file upload
2. **transactions** - Giao dịch từ sao kê
3. **ledgers** - Sổ kế toán (sau khi confirm)
4. **rules** - Rules phân loại

### Key Relationships

```
upload_batches (1) ──→ (N) transactions
transactions (1) ──→ (1) ledgers
rules (1) ──→ (N) transactions (via rule_id)
```

---

## 🎨 UI/UX Highlights

### Navigation

```
 Giao dịch  │  Sổ kế toán  │   Chi phí được trừ  │  Rules
```

### Color Coding

- 🔴 **Chi phí**: Red (#ef4444)
- 🔵 **Sổ cái**: Blue (#3b82f6)
- 🟡 **Công nợ**: Orange (#f59e0b)
- 🟣 **Tiền mặt**: Purple (#8b5cf6)
- 🟢 **Tiền vào**: Green (#10b981)

### Status Badges

- 🟡 **PENDING**: Chờ xác nhận
- 🟢 **CONFIRMED**: Đã xác nhận
- 🔴 **REJECTED**: Từ chối

---

## 🔄 Workflow

### User Flow

```
1. Upload file sao kê
   ↓
2. Hệ thống parse & phân loại tự động
   ↓
3. User review & edit (nếu cần)
   ↓
4. Confirm transactions
   ↓
5. Xem sổ kế toán
   ↓
6. Export Excel để lưu trữ
```

### Data Flow

```
File Upload → Parser → Rule Engine → Transactions (PENDING)
                                            ↓
                                      User Confirm
                                            ↓
                                    Ledgers (CONFIRMED)
                                            ↓
                                      Excel Export


```
