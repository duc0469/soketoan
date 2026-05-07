# Project Structure

## Cấu trúc thư mục đầy đủ

```
accounting-app/
│
├── README.md                    # Hướng dẫn tổng quan
├── SETUP.md                     # Hướng dẫn cài đặt chi tiết
├── API.md                       # API documentation
├── ARCHITECTURE.md              # Kiến trúc hệ thống
├── CHANGELOG.md                 # Lịch sử thay đổi
├── CONTRIBUTING.md              # Hướng dẫn đóng góp
├── LICENSE                      # MIT License
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package.json (scripts)
│
├── backend/                     # Backend Node.js
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment variables template
│   └── src/
│       ├── server.js            # Entry point
│       ├── config/
│       │   └── db.js            # MySQL connection pool
│       ├── routes/
│       │   ├── upload.js        # POST /api/upload
│       │   ├── transactions.js  # CRUD transactions
│       │   ├── ledgers.js       # GET ledgers & summary
│       │   └── rules.js         # CRUD rules
│       └── utils/
│           ├── parser.js        # Parse PDF/CSV/XLSX
│           └── ruleEngine.js    # Classification logic
│
├── frontend/                    # Frontend React
│   ├── package.json             # Frontend dependencies
│   ├── public/
│   │   └── index.html           # HTML template
│   └── src/
│       ├── index.jsx            # Entry point
│       ├── index.css            # Global styles
│       ├── App.jsx              # Main app component
│       ├── api/
│       │   └── client.js        # Axios API client
│       ├── components/
│       │   ├── UploadZone.jsx   # File upload component
│       │   ├── TransactionGrid.jsx      # Transaction table container
│       │   ├── TransactionRow.jsx       # Transaction row component
│       │   ├── TransactionToolbar.jsx   # Toolbar with actions
│       │   ├── LedgerView.jsx           # Ledger view container
│       │   ├── LedgerFilter.jsx         # Ledger filter component
│       │   ├── LedgerSummary.jsx        # Ledger summary cards
│       │   └── RulesManager.jsx         # Rules CRUD
│       └── utils/
│           └── format.js        # Format helpers
│
├── database/                    # Database
│   └── schema.sql               # MySQL schema + seed data
│
└── sample-data/                 # Sample files
    └── README.md                # Sample data guide
```

## File Descriptions

### Root Level

| File              | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `README.md`       | Tổng quan dự án, tính năng, cách chạy             |
| `SETUP.md`        | Hướng dẫn cài đặt chi tiết + troubleshooting      |
| `API.md`          | API endpoints documentation                       |
| `ARCHITECTURE.md` | Kiến trúc hệ thống, data flow                     |
| `CHANGELOG.md`    | Lịch sử thay đổi theo version                     |
| `CONTRIBUTING.md` | Hướng dẫn đóng góp code                           |
| `LICENSE`         | MIT License                                       |
| `.gitignore`      | Files/folders không commit                        |
| `package.json`    | Scripts tiện ích (install:all, dev:backend, etc.) |

### Backend

#### `backend/src/server.js`

- Entry point của backend
- Setup Express app
- Mount routes
- Error handling middleware

#### `backend/src/config/db.js`

- MySQL connection pool
- Database configuration
- Export pool instance

#### `backend/src/routes/upload.js`

- **POST /api/upload**: Upload file
- Multer middleware (memory storage)
- Parse file (PDF/CSV/XLSX)
- Classify transactions
- Bulk insert to DB

#### `backend/src/routes/transactions.js`

- **GET /api/transactions**: List transactions (with filters)
- **GET /api/transactions/batches**: Upload history
- **PUT /api/transactions/:id**: Update transaction
- **POST /api/transactions/confirm**: Bulk confirm
- **DELETE /api/transactions/:id**: Delete transaction

#### `backend/src/routes/ledgers.js`

- **GET /api/ledgers**: List ledgers (with filters)
- **GET /api/ledgers/summary**: Summary by type & account

#### `backend/src/routes/rules.js`

- **GET /api/rules**: List rules
- **POST /api/rules**: Create rule
- **PUT /api/rules/:id**: Update rule
- **DELETE /api/rules/:id**: Delete rule

#### `backend/src/utils/parser.js`

- `parseXlsx()`: Parse Excel files
- `parseCsv()`: Parse CSV files
- `parsePdf()`: Parse PDF files
- `parseDate()`: Normalize date formats
- `parseAmount()`: Normalize amount formats
- `normalizeText()`: Uppercase & trim
- `detectColumns()`: Auto-detect header columns

#### `backend/src/utils/ruleEngine.js`

- `classifyTransaction()`: Classify single transaction
- `classifyBatch()`: Classify multiple transactions
- `extractCustomerCode()`: Extract KH/NCC codes
- `extractFeeType()`: Extract fee types
- `extractCounterparty()`: Extract counterparty names
- `loadRules()`: Load rules from DB (cached)
- `clearRuleCache()`: Clear cache when rules change

### Frontend

#### `frontend/src/index.jsx`

- React entry point
- Render `<App />` to DOM

#### `frontend/src/App.jsx`

- Main app component
- Tab navigation
- State management
- Route components

#### `frontend/src/api/client.js`

- Axios instance
- API functions:
  - `uploadFile()`
  - `getTransactions()`
  - `updateTransaction()`
  - `confirmTransactions()`
  - `deleteTransaction()`
  - `getLedgers()`
  - `getLedgerSummary()`
  - `getRules()`
  - `createRule()`
  - `updateRule()`
  - `deleteRule()`

#### `frontend/src/components/UploadZone.jsx`

- Drag & drop file upload
- Progress bar
- File type validation
- Call `uploadFile()` API

#### `frontend/src/components/TransactionGrid.jsx`

- Container component for transaction table
- State management (editing, selection)
- Orchestrate child components
- Handle bulk operations

#### `frontend/src/components/TransactionRow.jsx`

- Render single transaction row
- Display mode vs Edit mode
- Inline editing for all fields
- Action buttons (edit, delete)

#### `frontend/src/components/TransactionToolbar.jsx`

- Toolbar with bulk actions
- Confirm selected button
- Transaction counter
- Reusable component

#### `frontend/src/components/LedgerView.jsx`

- Container component for ledger view
- Data fetching and state management
- Orchestrate filter and summary components
- Display ledger table

#### `frontend/src/components/LedgerFilter.jsx`

- Filter form component
- Ledger type selector
- Date range inputs
- Apply filter button

#### `frontend/src/components/LedgerSummary.jsx`

- Summary cards component
- Display totals by ledger type
- Color-coded cards
- Transaction count

#### `frontend/src/components/RulesManager.jsx`

- List rules
- Create/Edit/Delete rules
- Toggle active/inactive
- Form validation

#### `frontend/src/utils/format.js`

- `formatCurrency()`: Format VND
- `formatDate()`: Format dd/mm/yyyy
- `LEDGER_TYPE_LABELS`: Type labels & colors
- `STATUS_LABELS`: Status labels & colors

### Database

#### `database/schema.sql`

- Create database `accounting_db`
- Create 4 tables:
  - `transactions`: Sao kê + phân loại
  - `accounting_rules`: Rules
  - `ledgers`: Sổ kế toán
  - `upload_batches`: Upload history
- Insert 13 default rules
- Indexes & foreign keys
