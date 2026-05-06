# 🤝 Contributing Guide

Cảm ơn bạn đã quan tâm đến việc đóng góp cho dự án! Dưới đây là hướng dẫn chi tiết.

## 📋 Mục lục

1. [Code of Conduct](#code-of-conduct)
2. [Cách đóng góp](#cách-đóng-góp)
3. [Development Setup](#development-setup)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)

## Code of Conduct

- Tôn trọng mọi người
- Không spam, không quảng cáo
- Không sử dụng ngôn ngữ thô tục
- Giữ thái độ chuyên nghiệp

## Cách đóng góp

### 🐛 Báo lỗi (Bug Report)

Khi báo lỗi, hãy cung cấp:

1. **Mô tả lỗi**: Lỗi gì xảy ra?
2. **Cách tái hiện**: Các bước để tái hiện lỗi
3. **Kết quả mong đợi**: Điều gì nên xảy ra?
4. **Kết quả thực tế**: Điều gì đã xảy ra?
5. **Screenshots**: Nếu có
6. **Environment**: OS, Node version, MySQL version

**Template:**

```markdown
## Mô tả lỗi

[Mô tả ngắn gọn]

## Cách tái hiện

1. Vào trang...
2. Click vào...
3. Thấy lỗi...

## Kết quả mong đợi

[Điều gì nên xảy ra]

## Kết quả thực tế

[Điều gì đã xảy ra]

## Screenshots

[Nếu có]

## Environment

- OS: Windows 11
- Node: v18.16.0
- MySQL: 8.0.33
```

### ✨ Đề xuất tính năng (Feature Request)

Khi đề xuất tính năng mới:

1. **Mô tả tính năng**: Tính năng gì?
2. **Use case**: Dùng trong trường hợp nào?
3. **Lợi ích**: Giải quyết vấn đề gì?
4. **Mockup**: Nếu có

### 💻 Đóng góp code

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Code & test
4. Commit: `git commit -m "feat: thêm tính năng X"`
5. Push: `git push origin feature/ten-tinh-nang`
6. Tạo Pull Request

## Development Setup

### Prerequisites

- Node.js v16+
- MySQL 8.0+
- Git

### Setup

```bash
# Clone repo
git clone https://github.com/your-username/accounting-app.git
cd accounting-app

# Install dependencies
npm run install:all

# Setup database
mysql -u root -p < database/schema.sql

# Setup backend
cd backend
cp .env.example .env
# Sửa thông tin DB trong .env

# Run backend
npm run dev

# Run frontend (terminal mới)
cd frontend
npm start
```

## Coding Standards

### JavaScript/React

#### Style Guide

- **Indentation**: 2 spaces
- **Quotes**: Single quotes `'`
- **Semicolons**: Có
- **Line length**: Max 100 characters
- **Naming**:
  - Variables/Functions: `camelCase`
  - Components: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case.js` hoặc `PascalCase.jsx`

#### Examples

**✅ Good:**

```javascript
// Component
function TransactionGrid({ transactions, onUpdate }) {
  const [editing, setEditing] = useState(null);

  const handleSave = async () => {
    await onUpdate(editing);
  };

  return <div>...</div>;
}

// API call
export const getTransactions = (params) => {
  return api.get("/transactions", { params });
};

// Constants
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const LEDGER_TYPES = ["CHI_PHI", "SO_CAI", "CONG_NO"];
```

**❌ Bad:**

```javascript
// Không dùng var
var x = 10;

// Không dùng double quotes
const name = "John";

// Không dùng snake_case cho variables
const user_name = "John";

// Không dùng camelCase cho components
function transactionGrid() {}
```

### SQL

```sql
-- Table names: snake_case
CREATE TABLE accounting_rules (...);

-- Column names: snake_case
debit_account VARCHAR(20)

-- Always use explicit column names
SELECT id, name, amount FROM transactions;

-- Not: SELECT * FROM transactions;
```

### File Structure

```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── server.js     # Entry point

frontend/
├── src/
│   ├── api/          # API client
│   ├── components/   # React components
│   ├── utils/        # Utility functions
│   ├── App.jsx       # Main app
│   └── index.jsx     # Entry point
```

## Commit Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật documentation
- `style`: Format code (không ảnh hưởng logic)
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build, dependencies

### Examples

```bash
# Feature
git commit -m "feat(upload): thêm hỗ trợ file CSV"

# Bug fix
git commit -m "fix(parser): sửa lỗi parse ngày dd/mm/yyyy"

# Documentation
git commit -m "docs(readme): cập nhật hướng dẫn cài đặt"

# Refactor
git commit -m "refactor(api): tách logic phân loại ra module riêng"
```

### Commit Message Rules

- Dùng tiếng Việt hoặc tiếng Anh (nhất quán)
- Subject: max 72 characters
- Subject: lowercase, không dấu chấm cuối
- Body: giải thích **why** (không phải **what**)

## Pull Request Process

### Before submitting

1. **Test locally**

   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm start
   ```

2. **Check code style**
   - Indentation đúng
   - Không có console.log
   - Không có commented code

3. **Update documentation**
   - README.md (nếu cần)
   - API.md (nếu thêm API)
   - Comments trong code

### PR Template

```markdown
## Mô tả

[Mô tả ngắn gọn về thay đổi]

## Loại thay đổi

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist

- [ ] Code đã test locally
- [ ] Đã update documentation
- [ ] Đã follow coding standards
- [ ] Không có breaking changes (hoặc đã ghi chú)

## Screenshots

[Nếu có thay đổi UI]

## Related Issues

Closes #123
```

### Review Process

1. Maintainer sẽ review trong vòng 2-3 ngày
2. Nếu có yêu cầu sửa, hãy update PR
3. Sau khi approve, PR sẽ được merge

## Testing

### Manual Testing

Trước khi submit PR, hãy test:

1. **Upload file**
   - PDF, CSV, XLSX
   - File lớn (>10MB)
   - File sai format

2. **Phân loại**
   - Kiểm tra rules hoạt động
   - Bóc tách thông tin đúng

3. **CRUD operations**
   - Tạo/Sửa/Xóa transactions
   - Tạo/Sửa/Xóa rules

4. **Edge cases**
   - File rỗng
   - Dữ liệu không hợp lệ
   - Network errors

### Automated Testing (Future)

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Questions?

Nếu có câu hỏi:

1. Đọc README.md và SETUP.md
2. Tìm trong Issues
3. Tạo issue mới với label `question`

## Recognition

Contributors sẽ được ghi nhận trong:

- README.md
- CHANGELOG.md
- Release notes

---

**Cảm ơn bạn đã đóng góp! 🎉**
