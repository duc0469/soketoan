# ⚡ Quick Start Guide

Hướng dẫn nhanh để chạy ứng dụng trong 5 phút!

## 📋 Yêu cầu

- ✅ Node.js v16+ đã cài đặt
- ✅ MySQL 8.0+ đã cài đặt và đang chạy
- ✅ Git đã cài đặt

## 🚀 5 Bước Cài Đặt

### Bước 1: Clone Repository

```bash
git clone https://github.com/your-username/accounting-app.git
cd accounting-app
```

### Bước 2: Setup Database

```bash
# Đăng nhập MySQL
mysql -u root -p

# Chạy trong MySQL prompt:
source database/schema.sql
exit;
```

✅ **Kiểm tra**:

```bash
mysql -u root -p accounting_db -e "SHOW TABLES;"
```

Phải thấy 4 bảng: `transactions`, `accounting_rules`, `ledgers`, `upload_batches`

### Bước 3: Setup Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Sửa file .env (dùng editor bất kỳ)
# Thay your_password bằng password MySQL của bạn
```

File `.env` của bạn:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password_here
DB_NAME=accounting_db
```

### Bước 4: Setup Frontend

Mở terminal mới:

```bash
cd frontend

# Cài đặt dependencies
npm install
```

### Bước 5: Chạy Ứng Dụng

**Terminal 1 (Backend):**

```bash
cd backend
npm run dev
```

Thấy: `✅ Backend running on http://localhost:5000`

**Terminal 2 (Frontend):**

```bash
cd frontend
npm start
```

Trình duyệt tự động mở `http://localhost:3000`

## 🎉 Xong! Giờ test thử

### Test 1: Upload File Mẫu

1. Tạo file Excel `test.xlsx` với nội dung:

| Ngày       | Nội dung                     | Số tiền   | Số dư    |
| ---------- | ---------------------------- | --------- | -------- |
| 01/05/2026 | LUONG THANG 4                | -15000000 | 50000000 |
| 02/05/2026 | THU TIEN KHACH HANG KH001234 | 20000000  | 70000000 |
| 03/05/2026 | THANH TOAN TIEN DIEN EVN     | -2000000  | 68000000 |

2. Vào `http://localhost:3000`
3. Kéo thả file `test.xlsx` vào Upload Zone
4. Chờ vài giây
5. Xem kết quả phân loại tự động! 🎊

### Test 2: Chỉnh Sửa Giao Dịch

1. Click nút ✏️ trên dòng bất kỳ
2. Sửa TK Nợ thành `111`
3. Click 💾 để lưu
4. Thấy thông báo "Đã cập nhật giao dịch"

### Test 3: Xác Nhận Giao Dịch

1. Tick chọn 2-3 giao dịch
2. Click "✓ Xác nhận (n)"
3. Chuyển sang tab "📊 Sổ kế toán"
4. Thấy các giao dịch đã xác nhận

### Test 4: Quản Lý Rules

1. Chuyển sang tab "⚙️ Rules"
2. Click "+ Thêm Rule"
3. Điền:
   - Tên: `Test Rule`
   - Từ khóa: `TEST|DEMO`
   - TK Nợ: `642`
   - TK Có: `112`
   - Loại sổ: `CHI_PHI`
4. Click "➕ Tạo mới"
5. Thấy rule mới trong danh sách

## 🐛 Gặp Lỗi?

### Lỗi: "Cannot connect to MySQL"

**Giải pháp:**

```bash
# Kiểm tra MySQL đang chạy
# Windows:
net start MySQL80

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql

# Test kết nối:
mysql -u root -p -e "SELECT 1;"
```

### Lỗi: "Port 5000 already in use"

**Giải pháp:**

```bash
# Đổi port trong backend/.env
PORT=5001

# Hoặc kill process đang dùng port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Lỗi: "npm install failed"

**Giải pháp:**

```bash
# Xóa cache và cài lại
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Cannot parse file"

**Giải pháp:**

- Kiểm tra file có header row (Ngày, Nội dung, Số tiền)
- Đảm bảo cột Ngày có format ngày hợp lệ (dd/mm/yyyy)
- Cột Số tiền phải là số

## 📚 Đọc Thêm

- [README.md](README.md) - Tổng quan dự án
- [SETUP.md](SETUP.md) - Hướng dẫn chi tiết
- [API.md](API.md) - API documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - Kiến trúc hệ thống

## 💡 Tips

### Shortcut Scripts

Thêm vào `~/.bashrc` hoặc `~/.zshrc`:

```bash
# Alias cho dự án
alias acc-backend="cd ~/accounting-app/backend && npm run dev"
alias acc-frontend="cd ~/accounting-app/frontend && npm start"
alias acc-db="mysql -u root -p accounting_db"
```

Sau đó chỉ cần gõ:

```bash
acc-backend   # Chạy backend
acc-frontend  # Chạy frontend
acc-db        # Vào MySQL
```

### VS Code Extensions

Cài các extension này để code tốt hơn:

- ESLint
- Prettier
- MySQL (by Jun Han)
- Thunder Client (test API)

### Sample Data

Xem thêm file mẫu trong [sample-data/README.md](sample-data/README.md)

## 🎯 Next Steps

Sau khi chạy thành công:

1. **Tùy chỉnh Rules**: Thêm rules phù hợp với nghiệp vụ của bạn
2. **Import dữ liệu thực**: Upload file sao kê thật từ ngân hàng
3. **Khám phá tính năng**: Thử tất cả các tính năng
4. **Đọc docs**: Đọc ARCHITECTURE.md để hiểu cách hoạt động
5. **Đóng góp**: Đọc CONTRIBUTING.md nếu muốn đóng góp code

## ❓ Cần Giúp?

- 📖 Đọc [SETUP.md](SETUP.md) cho troubleshooting chi tiết
- 🐛 Tạo issue trên GitHub
- 💬 Hỏi trong Discussions

---

**Chúc bạn sử dụng vui vẻ! 🎉**

Nếu thành công, hãy cho dự án 1 ⭐ trên GitHub!
