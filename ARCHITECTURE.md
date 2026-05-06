# 🏗️ Architecture Overview

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (Web Browser)                            │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      FRONTEND                               │
│                     React.js                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components                                          │  │
│  │  - UploadZone      - TransactionGrid                │  │
│  │  - LedgerView      - RulesManager                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  State Management                                    │  │
│  │  - TanStack Query (Server State)                    │  │
│  │  - React useState (Local State)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Client (Axios)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      BACKEND                                │
│                     Node.js + Express                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes (API Endpoints)                              │  │
│  │  - /api/upload       - /api/transactions            │  │
│  │  - /api/ledgers      - /api/rules                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic                                      │  │
│  │  - Parser (PDF/CSV/XLSX)                            │  │
│  │  - Rule Engine (Classification)                     │  │
│  │  - Data Extraction (Regex)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database Layer (mysql2)                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ SQL
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     DATABASE                                │
│                      MySQL 8.0                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables                                              │  │
│  │  - transactions      - accounting_rules             │  │
│  │  - ledgers           - upload_batches               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Upload & Parse Flow

```
User uploads file
      ↓
Frontend: UploadZone component
      ↓
POST /api/upload (multipart/form-data)
      ↓
Backend: Multer middleware (memory storage)
      ↓
Parser utility (parseXlsx/parseCsv/parsePdf)
      ↓
Normalized data: [{ trans_date, description, amount, balance, ref_no }]
      ↓
Rule Engine: classifyBatch()
      ↓
For each transaction:
  - Match keywords with rules (priority order)
  - Extract customer_code, fee_type, counterparty
  - Assign debit_account, credit_account, ledger_type
      ↓
Bulk INSERT into transactions table (status = PENDING)
      ↓
Return transactions to frontend
      ↓
Display in TransactionGrid
```

### 2. Classification Flow

```
Transaction { description, amount }
      ↓
Load rules from DB (cached 1 minute)
      ↓
For each rule (priority order):
  - Check amount_sign (POSITIVE/NEGATIVE/ANY)
  - Check keywords (OR logic)
  - If match: apply rule and break
      ↓
If no rule matched:
  - Fallback: amount > 0 → TK 112/131 (SO_CAI)
  - Fallback: amount < 0 → TK 642/112 (CHI_PHI)
      ↓
Extract additional info:
  - customer_code: KH\d+, NCC\d+, CTY\d+
  - fee_type: PHI CHUYEN TIEN, PHI SMS, etc.
  - counterparty: CONG TY ABC, NCC XYZ, etc.
      ↓
Return classification result
```

### 3. Confirm Flow

```
User selects transactions & clicks "Xác nhận"
      ↓
POST /api/transactions/confirm { ids: [1,2,3] }
      ↓
Backend: Load transactions WHERE id IN (ids) AND status = PENDING
      ↓
Bulk INSERT into ledgers table
      ↓
UPDATE transactions SET status = CONFIRMED
      ↓
Return success
      ↓
Frontend: Update local state
      ↓
User can view in Ledger tab
```

## Component Architecture

### Frontend Components

```
App.jsx (Root)
├── Header
├── Tabs Navigation
└── Content Area
    ├── Transactions Tab
    │   ├── UploadZone
    │   └── TransactionGrid
    │       ├── Edit inline
    │       ├── Bulk select
    │       └── Confirm button
    ├── Ledgers Tab
    │   └── LedgerView
    │       ├── Filters
    │       ├── Summary cards
    │       └── Ledger table
    └── Rules Tab
        └── RulesManager
            ├── Rules list
            └── Create/Edit form
```

### Backend Modules

```
server.js (Entry point)
├── Middleware
│   ├── cors
│   ├── express.json
│   └── express-async-errors
├── Routes
│   ├── /api/upload       → routes/upload.js
│   ├── /api/transactions → routes/transactions.js
│   ├── /api/ledgers      → routes/ledgers.js
│   └── /api/rules        → routes/rules.js
├── Utils
│   ├── parser.js         → Parse PDF/CSV/XLSX
│   └── ruleEngine.js     → Classification logic
└── Config
    └── db.js             → MySQL connection pool
```

## Database Schema

### Entity Relationship

```
upload_batches (1) ──< (N) transactions (1) ──< (N) ledgers
                              │
                              │ (N)
                              │
                              ▼ (1)
                       accounting_rules
```

### Tables Detail

#### transactions

- **Purpose**: Lưu dữ liệu sao kê gốc + kết quả phân loại
- **Status**: PENDING → CONFIRMED → ledgers
- **Key fields**:
  - `upload_batch`: Group transactions by upload
  - `status`: Workflow state
  - `rule_id`: Which rule was applied
  - `is_manual`: User edited or not

#### accounting_rules

- **Purpose**: Định nghĩa rules phân loại
- **Matching**: Keywords (OR logic) + amount_sign
- **Priority**: Lower number = higher priority
- **Cache**: 1 minute TTL

#### ledgers

- **Purpose**: Sổ kế toán chính thức (sau khi confirm)
- **Immutable**: Không sửa/xóa sau khi tạo
- **Foreign key**: transaction_id (CASCADE delete)

#### upload_batches

- **Purpose**: Lịch sử upload, tracking
- **Status**: PROCESSING → DONE/ERROR

## Deployment Architecture

### Development

```
localhost:3000 (Frontend) → localhost:5000 (Backend) → localhost:3306 (MySQL)
```

### Production (Recommended)

```
                    ┌─────────────┐
                    │   Nginx     │
                    │ (Reverse    │
                    │  Proxy)     │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         ┌────▼─────┐            ┌─────▼────┐
         │ Frontend │            │ Backend  │
         │ (Static) │            │ (Node.js)│
         └──────────┘            └─────┬────┘
                                       │
                                 ┌─────▼────┐
                                 │  MySQL   │
                                 │ (Master) │
                                 └──────────┘
```

## Alternative Architectures

### Microservices

```
API Gateway
├── Upload Service (File processing)
├── Classification Service (Rule engine)
├── Ledger Service (Accounting logic)
└── Auth Service (Authentication)
```

### Serverless

```
Frontend (S3 + CloudFront)
Backend (Lambda functions)
Database (RDS/Aurora)
File Storage (S3)
```

### Event-Driven

```
Upload → Queue → Parser → Queue → Classifier → Queue → DB
```
