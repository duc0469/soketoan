# 🚀 Hướng dẫn Setup Chi tiết

## Yêu cầu hệ thống

- **Node.js**: v16+ (khuyến nghị v18+)
- **MySQL**: v8.0+
- **npm** hoặc **yarn**

## Bước 1: Cài đặt MySQL

### Windows

1. Download MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Chạy installer, chọn "Developer Default"
3. Thiết lập root password
4. Khởi động MySQL Server

### macOS

```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

## Bước 2: Tạo Database

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database (hoặc chạy file schema.sql)
CREATE DATABASE accounting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Import schema
mysql -u root -p accounting_db < database/schema.sql
```

Kiểm tra:

```bash
mysql -u root -p accounting_db -e "SHOW TABLES;"
```

Kết quả mong đợi:

```
+---------------------------+
| Tables_in_accounting_db   |
+---------------------------+
| accounting_rules          |
| ledgers                   |
| transactions              |
| upload_batches            |
+---------------------------+
```

## Bước 3: Setup Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env
```

Sửa file `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=accounting_db
```

Kiểm tra kết nối:

```bash
# Chạy server
npm run dev
```

Nếu thành công, bạn sẽ thấy:

```
✅ Backend running on http://localhost:5000
```

Test API:

```bash
curl http://localhost:5000/api/health
# Kết quả: {"status":"ok","time":"2026-05-06T..."}
```

## Bước 4: Setup Frontend

Mở terminal mới:

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy app
npm start
```

Trình duyệt sẽ tự động mở `http://localhost:3000`

## Bước 5: Test Upload

### Tạo file Excel mẫu

Tạo file `test-sao-ke.xlsx` với nội dung:

| Ngày       | Nội dung                             | Số tiền   | Số dư    |
| ---------- | ------------------------------------ | --------- | -------- |
| 01/05/2026 | LUONG THANG 4 NHAN VIEN NGUYEN VAN A | -15000000 | 50000000 |
| 02/05/2026 | THU TIEN KHACH HANG KH001234         | 20000000  | 70000000 |
| 03/05/2026 | THANH TOAN TIEN DIEN THANG 4 EVN     | -2000000  | 68000000 |
| 05/05/2026 | PHI CHUYEN TIEN NHANH                | -5500     | 67994500 |
| 10/05/2026 | THANH TOAN NCC ABC CONG TY           | -10000000 | 57994500 |

### Upload qua giao diện

1. Mở `http://localhost:3000`
2. Kéo thả file `test-sao-ke.xlsx` vào Upload Zone
3. Chờ xử lý (vài giây)
4. Kiểm tra kết quả phân loại tự động

### Kết quả mong đợi

| Nội dung                | TK Nợ | TK Có | Loại sổ | Trạng thái |
| ----------------------- | ----- | ----- | ------- | ---------- |
| LUONG...                | 334   | 112   | CHI_PHI | PENDING    |
| THU TIEN KH...          | 112   | 131   | CONG_NO | PENDING    |
| THANH TOAN TIEN DIEN... | 642   | 112   | CHI_PHI | PENDING    |
| PHI CHUYEN TIEN...      | 642   | 112   | CHI_PHI | PENDING    |
| THANH TOAN NCC...       | 331   | 112   | CONG_NO | PENDING    |

## Bước 6: Test Workflow

### 1. Chỉnh sửa giao dịch

- Click nút ✏️ trên dòng bất kỳ
- Sửa TK Nợ/Có hoặc Loại sổ
- Click 💾 để lưu

### 2. Xác nhận giao dịch

- Tick chọn các giao dịch cần xác nhận
- Click "✓ Xác nhận (n)"
- Trạng thái chuyển sang "Đã xác nhận"

### 3. Xem sổ kế toán

- Chuyển sang tab "📊 Sổ kế toán"
- Xem tổng hợp theo loại sổ
- Lọc theo khoảng thời gian

### 4. Quản lý Rules

- Chuyển sang tab "⚙️ Rules"
- Click "+ Thêm Rule"
- Điền thông tin:
  - Tên: "Mua văn phòng phẩm"
  - Từ khóa: `VAN PHONG PHAM|VPP|MUA VAN PHONG`
  - TK Nợ: `642`
  - TK Có: `112`
  - Loại sổ: `CHI_PHI`
- Click "➕ Tạo mới"

## Troubleshooting

### Lỗi: "Cannot connect to MySQL"

**Nguyên nhân**: Thông tin kết nối sai hoặc MySQL chưa chạy

**Giải pháp**:

```bash
# Kiểm tra MySQL đang chạy
# Windows
net start MySQL80

# macOS
brew services list

# Linux
sudo systemctl status mysql

# Test kết nối
mysql -u root -p -e "SELECT 1;"
```

### Lỗi: "Port 5000 already in use"

**Giải pháp**:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Hoặc đổi port trong backend/.env
PORT=5001
```

### Lỗi: "Cannot parse file"

**Nguyên nhân**: Format file không đúng

**Giải pháp**:

1. Kiểm tra file có header row (Ngày, Nội dung, Số tiền)
2. Đảm bảo cột Ngày có định dạng ngày hợp lệ
3. Cột Số tiền phải là số (không có chữ)
4. Thử với file mẫu trước

### Lỗi: "npm install failed"

**Giải pháp**:

```bash
# Xóa cache
npm cache clean --force

# Xóa node_modules
rm -rf node_modules package-lock.json

# Cài lại
npm install
```

### Lỗi: "Module not found"

**Giải pháp**:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Kiểm tra hoàn tất

Checklist:

- [ ] MySQL đang chạy
- [ ] Database `accounting_db` đã tạo
- [ ] 4 bảng đã tồn tại (transactions, accounting_rules, ledgers, upload_batches)
- [ ] Backend chạy tại http://localhost:5000
- [ ] Frontend chạy tại http://localhost:3000
- [ ] Upload file thành công
- [ ] Phân loại tự động hoạt động
- [ ] Chỉnh sửa giao dịch hoạt động
- [ ] Xác nhận giao dịch hoạt động
- [ ] Xem sổ kế toán hoạt động
- [ ] Quản lý rules hoạt động

## Next Steps

1. **Tùy chỉnh Rules**: Thêm rules phù hợp với nghiệp vụ của bạn
2. **Import dữ liệu thực**: Upload file sao kê thật
3. **Backup Database**:
   ```bash
   mysqldump -u root -p accounting_db > backup.sql
   ```
4. **Deploy Production**: Xem file DEPLOYMENT.md (nếu có)

## Hỗ trợ

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs trong terminal
2. Kiểm tra browser console (F12)
3. Xem lại các bước setup
4. Tạo issue trên GitHub (nếu có)

---

**Chúc bạn setup thành công! 🎉**
