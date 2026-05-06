# 📁 Project Structure

## Cấu trúc thư mục đầy đủ

```
accounting-app/
│
├── 📄 README.md                    # Hướng dẫn tổng quan
├── 📄 SETUP.md                     # Hướng dẫn cài đặt chi tiết
├── 📄 API.md                       # API documentation
├── 📄 ARCHITECTURE.md              # Kiến trúc hệ thống
├── 📄 CHANGELOG.md                 # Lịch sử thay đổi
├── 📄 CONTRIBUTING.md              # Hướng dẫn đóng góp
├── 📄 LICENSE                      # MIT License
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package.json                 # Root package.json (scripts)
│
├── 📂 backend/                     # Backend Node.js
│   ├── 📄 package.json             # Backend dependencies
│   ├── 📄 .env.example             # Environment variables template
│   └── 📂 src/
│       ├── 📄 server.js            # Entry point
│       ├── 📂 config/
│       │   └── 📄 db.js            # MySQL connection pool
│       ├── 📂 routes/
│       │   ├── 📄 upload.js        # POST /api/upload
│       │   ├── 📄 transactions.js  # CRUD transactions
│       │   ├── 📄 ledgers.js       # GET ledgers & summary
│       │   └── 📄 rules.js         # CRUD rules
│       └── 📂 utils/
│           ├── 📄 parser.js        # Parse PDF/CSV/XLSX
│           └── 📄 ruleEngine.js    # Classification logic
│
├── 📂 frontend/                    # Frontend React
│   ├── 📄 package.json             # Frontend dependencies
│   ├── 📂 public/
│   │   └── 📄 index.html           # HTML template
│   └── 📂 src/
│       ├── 📄 index.jsx            # Entry point
│       ├── 📄 index.css            # Global styles
│       ├── 📄 App.jsx              # Main app component
│       ├── 📂 api/
│       │   └── 📄 client.js        # Axios API client
│       ├── 📂 components/
│       │   ├── 📄 UploadZone.jsx   # File upload component
│       │   ├── 📄 TransactionGrid.jsx      # Transaction table container
│       │   ├── 📄 TransactionRow.jsx       # Transaction row component
│       │   ├── 📄 TransactionToolbar.jsx   # Toolbar with actions
│       │   ├── 📄 LedgerView.jsx           # Ledger view container
│       │   ├── 📄 LedgerFilter.jsx         # Ledger filter component
│       │   ├── 📄 LedgerSummary.jsx        # Ledger summary cards
│       │   └── 📄 RulesManager.jsx         # Rules CRUD
│       └── 📂 utils/
│           └── 📄 format.js        # Format helpers
│
├── 📂 database/                    # Database
│   └── 📄 schema.sql               # MySQL schema + seed data
│
└── 📂 sample-data/                 # Sample files
    └── 📄 README.md                # Sample data guide
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

### Sample Data

#### `sample-data/README.md`

- Hướng dẫn tạo file mẫu
- Dữ liệu test
- Kết quả mong đợi
- Test cases

## Dependencies

### Backend

```json
{
  "cors": "^2.8.5", // CORS middleware
  "dotenv": "^16.4.5", // Environment variables
  "express": "^4.19.2", // Web framework
  "express-async-errors": "^3.1.1", // Async error handling
  "multer": "^1.4.5-lts.1", // File upload
  "mysql2": "^3.9.7", // MySQL client
  "pdf-parse": "^1.1.1", // PDF parser
  "uuid": "^9.0.1", // UUID generator
  "xlsx": "^0.18.5" // Excel parser
}
```

### Frontend

```json
{
  "@tanstack/react-query": "^5.40.0", // Data fetching
  "axios": "^1.7.2", // HTTP client
  "date-fns": "^3.6.0", // Date utilities
  "react": "^18.3.1", // React library
  "react-dom": "^18.3.1", // React DOM
  "react-hot-toast": "^2.4.1", // Toast notifications
  "react-scripts": "5.0.1" // CRA scripts
}
```

## Component Architecture

### TransactionGrid Module (Container/Presentation Pattern)

```
TransactionGrid (Container)
├── State: editingId, editData, selected
├── Logic: handleEdit, handleSave, toggleSelect
└── Children:
    ├── TransactionToolbar (Presentation)
    │   └── Props: selectedCount, totalCount, onConfirmSelected
    └── Table
        └── TransactionRow[] (Presentation)
            └── Props: transaction, isEditing, editData, isSelected, handlers
```

### LedgerView Module (Container/Presentation Pattern)

```
LedgerView (Container)
├── State: ledgers, summary, filters, loading
├── Logic: loadData, data fetching
└── Children:
    ├── LedgerFilter (Presentation)
    │   └── Props: filters, onFilterChange, onApply
    ├── LedgerSummary (Presentation)
    │   └── Props: summary
    └── Table
        └── Ledger rows[]
```

### Design Principles

- **Single Responsibility**: Each component has one clear purpose
- **Container/Presentation**: Separate logic from UI
- **Reusability**: Components can be reused in different contexts
- **Props Interface**: Clear and minimal props
- **Composition**: Build complex UIs from simple components

## Key Features by File

### Upload & Parse

- `backend/src/routes/upload.js`: Upload endpoint
- `backend/src/utils/parser.js`: Parse logic
- `frontend/src/components/UploadZone.jsx`: Upload UI

### Classification

- `backend/src/utils/ruleEngine.js`: Rule matching
- `backend/src/routes/rules.js`: Rules CRUD
- `frontend/src/components/RulesManager.jsx`: Rules UI

### Transaction Management

- `backend/src/routes/transactions.js`: Transaction CRUD
- `frontend/src/components/TransactionGrid.jsx`: Transaction UI

### Ledger View

- `backend/src/routes/ledgers.js`: Ledger queries
- `frontend/src/components/LedgerView.jsx`: Ledger UI

## Code Statistics

```
Backend:
- 6 route files
- 2 utility files
- ~800 lines of code
- 4 main routes
- 1 maintenance script (fix-priorities.js)

Frontend:
- 8 component files (4 containers + 4 presentations)
- 1 API client
- 1 utility file
- ~1200 lines of code
- Modular architecture

Database:
- 1 schema file
- 4 tables
- 14 default rules

Documentation:
- 12 essential markdown files
- ~4000 lines
- Focused and relevant
```

## Development Workflow

```
1. Edit code in src/
2. Backend auto-reload (nodemon)
3. Frontend auto-reload (react-scripts)
4. Test in browser
5. Commit changes
6. Push to repo
```

## Build & Deploy

### Development

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start
```

### Production

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
# Serve build/ folder with nginx/apache
```

---

**Total Files**: 35+  
**Total Lines**: ~6000+  
**Languages**: JavaScript, SQL, HTML, CSS, Markdown  
**Architecture**: Modular, Component-based, Container/Presentation Pattern  
**Last Updated**: 2026-05-06 (v1.0.3 - After Cleanup & Refactoring)
