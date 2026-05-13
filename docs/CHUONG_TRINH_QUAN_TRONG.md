# CÁC MODULE VÀ FILE QUAN TRỌNG CỦA DỰ ÁN

## 🏗️ KIẾN TRÚC TỔNG QUAN

```
accounting-system/
├── frontend/          # React.js Client
├── backend/           # Node.js + Express Server
├── database/          # MySQL Schema & Migrations
└── docs/             # Documentation
```

---

## 📁 I. FRONTEND MODULE (React.js)

### 🎯 **Chức năng chính:** Giao diện người dùng, tương tác với API

### 📂 **Cấu trúc thư mục:**

```
frontend/src/
├── components/        # UI Components
├── api/              # API Client
├── utils/            # Utilities
├── App.jsx           # Root Component
└── index.jsx         # Entry Point
```

### 🔑 **File quan trọng:**

#### **1. Entry Point & Root**

- **`frontend/src/index.jsx`** - Điểm khởi đầu ứng dụng React
- **`frontend/src/App.jsx`** - Component gốc, quản lý routing và state toàn cục

#### **2. API Communication**

- **`frontend/src/api/client.js`** - HTTP client, tất cả API calls
  ```javascript
  // Chức năng: Axios instance, interceptors, API functions
  export const uploadFile = (file, onProgress) => { ... }
  export const getTransactions = (params) => { ... }
  export const confirmTransactions = (ids) => { ... }
  ```

#### **3. Core Components**

##### **Upload & File Processing**

- **`frontend/src/components/UploadZone.jsx`** - Upload file sao kê
  ```javascript
  // Chức năng: Drag & drop, file validation, progress bar
  const handleFile = async (file) => { ... }
  ```

##### **Transaction Management**

- **`frontend/src/components/TransactionGrid.jsx`** - Hiển thị và quản lý giao dịch

  ```javascript
  // Chức năng: Data grid, filtering, pagination, bulk operations
  const filtered = useMemo(() => { ... })
  ```

- **`frontend/src/components/TransactionRow.jsx`** - Dòng giao dịch với inline editing

  ```javascript
  // Chức năng: Inline edit, validation, status display
  const handleSave = async () => { ... }
  ```

- **`frontend/src/components/TransactionToolbar.jsx`** - Thanh công cụ bulk actions
  ```javascript
  // Chức năng: Bulk select, confirm, delete
  const handleConfirmSelected = () => { ... }
  ```

##### **Ledger & Reporting**

- **`frontend/src/components/LedgerView.jsx`** - Xem sổ kế toán

  ```javascript
  // Chức năng: Display ledgers, filtering, summary
  const loadLedgers = async () => { ... }
  ```

- **`frontend/src/components/LedgerSummary.jsx`** - Tổng hợp số liệu

  ```javascript
  // Chức năng: Summary cards, statistics
  const summaryData = useMemo(() => { ... })
  ```

- **`frontend/src/components/DeductibleExpensesView.jsx`** - Chi phí được trừ thuế
  ```javascript
  // Chức năng: Tax deductible expenses (TK 6xx)
  ```

##### **Configuration Management**

- **`frontend/src/components/RulesManager.jsx`** - Quản lý rules phân loại

  ```javascript
  // Chức năng: CRUD rules, priority management, test rules
  const handleSaveRule = async () => { ... }
  ```

- **`frontend/src/components/PartnersManager.jsx`** - Quản lý đối tác
  ```javascript
  // Chức năng: CRUD partners, keyword management
  const handleSavePartner = async () => { ... }
  ```

##### **Authentication**

- **`frontend/src/components/AuthPage.jsx`** - Đăng nhập/đăng ký
- **`frontend/src/components/UserMenu.jsx`** - Menu người dùng

#### **4. Utilities**

- **`frontend/src/utils/format.js`** - Format helpers
  ```javascript
  // Chức năng: Format currency, date, labels
  export const formatCurrency = (amount) => { ... }
  export const LEDGER_TYPE_LABELS = { ... }
  ```

---

## 🖥️ II. BACKEND MODULE (Node.js + Express)

### 🎯 **Chức năng chính:** API Server, Business Logic, Database Operations

### 📂 **Cấu trúc thư mục:**

```
backend/src/
├── routes/           # API Routes
├── utils/            # Business Logic
├── middleware/       # Middleware
├── config/           # Configuration
└── server.js         # Entry Point
```

### 🔑 **File quan trọng:**

#### **1. Server Entry Point**

- **`backend/src/server.js`** - Express server setup
  ```javascript
  // Chức năng: App configuration, middleware, routes mounting
  app.use("/api/upload", authMiddleware, uploadRoutes);
  app.use("/api/transactions", authMiddleware, transactionRoutes);
  ```

#### **2. Configuration**

- **`backend/src/config/db.js`** - MySQL connection pool
  ```javascript
  // Chức năng: Database connection, pool management
  const pool = mysql.createPool({ ... });
  ```

#### **3. Authentication & Security**

- **`backend/src/middleware/auth.js`** - JWT authentication middleware
  ```javascript
  // Chức năng: Token verification, user authentication
  const authenticateToken = (req, res, next) => { ... }
  ```

#### **4. API Routes**

##### **File Upload & Processing**

- **`backend/src/routes/upload.js`** - File upload endpoint
  ```javascript
  // Chức năng: Multer file upload, parse files, classify transactions
  router.post("/", upload.single("file"), async (req, res) => {
    // 1. Validate file
    // 2. Parse content (PDF/CSV/Excel)
    // 3. Apply rule engine
    // 4. Save to database
  });
  ```

##### **Transaction Management**

- **`backend/src/routes/transactions.js`** - Transaction CRUD
  ```javascript
  // Chức năng: List, update, confirm, delete transactions
  router.get("/", async (req, res) => { ... });      // List with filters
  router.put("/:id", async (req, res) => { ... });   // Update single
  router.post("/confirm", async (req, res) => { ... }); // Bulk confirm
  ```

##### **Ledger Operations**

- **`backend/src/routes/ledgers.js`** - Ledger views and summary
  ```javascript
  // Chức năng: Get ledgers, summary statistics
  router.get("/", async (req, res) => { ... });      // List ledgers
  router.get("/summary", async (req, res) => { ... }); // Summary stats
  ```

##### **Rules Management**

- **`backend/src/routes/rules.js`** - Rules CRUD
  ```javascript
  // Chức năng: Manage classification rules
  router.post("/", async (req, res) => {
    // Create rule + clear cache
    clearRuleCache();
  });
  ```

##### **Partners Management**

- **`backend/src/routes/partners.js`** - Partners CRUD
  ```javascript
  // Chức năng: Manage partners for auto-detection
  router.post("/test", async (req, res) => { ... }); // Test matching
  ```

##### **Export Functionality**

- **`backend/src/routes/export.js`** - Excel export
  ```javascript
  // Chức năng: Generate Excel reports
  router.post("/excel", async (req, res) => { ... });
  ```

#### **5. Core Business Logic**

##### **File Parser Engine**

- **`backend/src/utils/parser.js`** - 🔥 **CORE MODULE** - File parsing

  ```javascript
  // Chức năng: Parse PDF, CSV, Excel files

  // Main functions:
  function parseXlsx(buffer) {
    // 1. Read Excel workbook
    // 2. Find header row automatically
    // 3. Detect column positions
    // 4. Parse and validate data rows
    // 5. Normalize format
  }

  function findHeaderAndColumns(rawData) {
    // Auto-detect header containing "Ngày" and "Nội dung"
  }

  function parseDate(raw) {
    // Handle multiple date formats: dd/mm/yyyy, Excel serial, etc.
  }
  ```

##### **Rule Engine & Classification**

- **`backend/src/utils/ruleEngine.js`** - 🔥 **CORE MODULE** - Classification logic

  ```javascript
  // Chức năng: Automatic transaction classification

  // Main functions:
  async function classifyTransaction(transaction) {
    // 1. Load rules from cache/database
    // 2. Apply rules by priority
    // 3. Match keywords and amount sign
    // 4. Extract additional info (customer code, fee type)
    // 5. Return classification result
  }

  async function matchPartner(description) {
    // Auto-detect partner names from transaction description
  }

  function extractFeeType(description) {
    // Extract fee types: PHI CHUYEN TIEN, PHI SMS, etc.
  }
  ```

---

## 🗄️ III. DATABASE MODULE (MySQL)

### 🎯 **Chức năng chính:** Data Storage, Schema Management

### 📂 **Cấu trúc thư mục:**

```
database/
├── schema.sql                    # Main database schema
├── migration-auth.sql            # Authentication tables
└── migration-new-features.sql    # Partners & new features
```

### 🔑 **File quan trọng:**

#### **1. Main Schema**

- **`database/schema.sql`** - 🔥 **CORE DATABASE** - Main tables

  ```sql
  -- Core tables:
  CREATE TABLE transactions (
    -- Raw transaction data from bank statements
    id, upload_batch, trans_date, description, amount,
    debit_account, credit_account, ledger_type, status
  );

  CREATE TABLE accounting_rules (
    -- Classification rules with keywords and priority
    keywords, debit_account, credit_account, priority
  );

  CREATE TABLE ledgers (
    -- Final accounting entries after confirmation
    transaction_id, ledger_type, entry_date, amount
  );
  ```

#### **2. Authentication Schema**

- **`database/migration-auth.sql`** - User management
  ```sql
  CREATE TABLE users (
    id, username, email, password_hash, role
  );
  ```

#### **3. Extended Features**

- **`database/migration-new-features.sql`** - Partners & audit trail

  ```sql
  CREATE TABLE partners (
    -- Partner auto-detection
    partner_name, keywords, partner_type
  );

  CREATE TABLE transaction_logs (
    -- Audit trail for changes
    transaction_id, field_changed, old_value, new_value
  );
  ```

---

## ⚙️ IV. CHỨC NĂNG CHÍNH VÀ LUỒNG XỬ LÝ

### 🔄 **1. File Upload & Processing Flow**

```
User Upload → UploadZone.jsx → /api/upload → parser.js → ruleEngine.js → Database
```

**File liên quan:**

- `frontend/src/components/UploadZone.jsx` - UI upload
- `backend/src/routes/upload.js` - API endpoint
- `backend/src/utils/parser.js` - File parsing logic
- `backend/src/utils/ruleEngine.js` - Classification logic

### 📊 **2. Transaction Management Flow**

```
TransactionGrid.jsx ↔ /api/transactions ↔ Database
```

**File liên quan:**

- `frontend/src/components/TransactionGrid.jsx` - Main UI
- `frontend/src/components/TransactionRow.jsx` - Row editing
- `backend/src/routes/transactions.js` - CRUD operations

### 📋 **3. Ledger Generation Flow**

```
Confirm Transactions → Create Ledgers → LedgerView.jsx
```

**File liên quan:**

- `backend/src/routes/transactions.js` - Confirm endpoint
- `backend/src/routes/ledgers.js` - Ledger operations
- `frontend/src/components/LedgerView.jsx` - Display ledgers

### 🎛️ **4. Rules Management Flow**

```
RulesManager.jsx ↔ /api/rules ↔ ruleEngine.js (cache)
```

**File liên quan:**

- `frontend/src/components/RulesManager.jsx` - Rules UI
- `backend/src/routes/rules.js` - Rules CRUD
- `backend/src/utils/ruleEngine.js` - Rules application

---

## 🎯 V. FILE QUAN TRỌNG NHẤT (TOP 10)

### **🔥 Mức độ quan trọng: CRITICAL**

1. **`backend/src/utils/parser.js`** - Core file parsing engine
2. **`backend/src/utils/ruleEngine.js`** - Core classification logic
3. **`backend/src/server.js`** - Server entry point
4. **`frontend/src/App.jsx`** - Frontend root component
5. **`database/schema.sql`** - Main database schema

### **⚡ Mức độ quan trọng: HIGH**

6. **`backend/src/routes/upload.js`** - File upload API
7. **`frontend/src/components/TransactionGrid.jsx`** - Main transaction UI
8. **`backend/src/routes/transactions.js`** - Transaction CRUD API
9. **`frontend/src/api/client.js`** - API communication layer
10. **`backend/src/config/db.js`** - Database connection

---

## 📈 VI. DEPENDENCIES VÀ LIBRARIES QUAN TRỌNG

### **Frontend Dependencies:**

```json
// frontend/package.json
{
  "react": "^18.x", // UI Framework
  "@tanstack/react-query": "^4.x", // Server state management
  "axios": "^1.x", // HTTP client
  "react-hot-toast": "^2.x" // Notifications
}
```

### **Backend Dependencies:**

```json
// backend/package.json
{
  "express": "^4.x", // Web framework
  "mysql2": "^3.x", // Database driver
  "multer": "^1.x", // File upload
  "xlsx": "^0.18.x", // Excel parsing
  "pdf-parse": "^1.x", // PDF parsing
  "jsonwebtoken": "^9.x", // Authentication
  "bcryptjs": "^2.x" // Password hashing
}
```

---

## 🔧 VII. CONFIGURATION FILES

### **Environment & Config:**

- **`backend/.env`** - Environment variables (DB credentials, JWT secret)
- **`frontend/package.json`** - Frontend dependencies & scripts
- **`backend/package.json`** - Backend dependencies & scripts
- **`.gitignore`** - Git ignore rules

### **Development:**

- **`frontend/public/index.html`** - HTML template
- **`frontend/src/index.css`** - Global styles

---

## 📝 VIII. CÁCH SỬ DỤNG THÔNG TIN NÀY TRONG LUẬN VĂN

### **Chương 3: Thiết kế hệ thống**

```
"Hệ thống được chia thành 3 module chính:
- Frontend Module (React.js): Giao diện người dùng tại frontend/src/
- Backend Module (Node.js): API server tại backend/src/
- Database Module (MySQL): Schema tại database/"
```

### **Chương 4: Cài đặt và triển khai**

```
"Module xử lý file được cài đặt trong backend/src/utils/parser.js
với các function chính: parseXlsx(), parseCsv(), parseDate()..."
```

### **Phụ lục: Source code**

- Liệt kê đường dẫn các file quan trọng
- Mô tả chức năng từng file
- Highlight các thuật toán core

Thông tin này sẽ giúp bạn trình bày rõ ràng cấu trúc và vai trò của từng thành phần trong hệ thống! 🎯
