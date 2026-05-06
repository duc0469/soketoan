# 💼 Hệ Thống Kế Toán Tự Động

Ứng dụng web kế toán tự động giúp xử lý sao kê ngân hàng, phân loại giao dịch và tạo sổ kế toán.

## 🎯 Tính năng chính

### 1. Upload & Parse File Sao Kê

- Hỗ trợ: **PDF, CSV, XLSX, XLS**
- Tự động nhận diện cột: Ngày, Nội dung, Số tiền, Số dư
- Chuẩn hóa dữ liệu thành format thống nhất

### 2. Rule Engine - Phân loại tự động

- **Regex & Keyword matching**: Tự động điền TK Nợ/Có dựa trên nội dung giao dịch
- **Bóc tách thông tin**:
  - Mã khách hàng (KH001234, NCC123)
  - Loại phí (PHI CHUYEN TIEN, PHI SMS)
  - Đối tượng công nợ (NCC, Khách hàng)
- **Phân loại sổ**: Chi phí, Sổ cái, Công nợ, Tiền mặt

### 3. Data Grid Interface

- Hiển thị giao dịch sau khi parse
- **Chỉnh sửa trực tiếp** trên bảng:
  - TK Nợ / TK Có
  - Loại sổ
  - Đối tượng công nợ
- Xác nhận hàng loạt (bulk confirm)

### 4. Quản lý Rules

- Tạo/Sửa/Xóa rules phân loại
- Ưu tiên rules (priority)
- Bật/Tắt rules

### 5. Sổ Kế Toán

- Xem dữ liệu đã xác nhận
- Lọc theo: Loại sổ, Khoảng thời gian
- Tổng hợp theo loại sổ và tài khoản

## 🏗️ Kiến trúc

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React.js  │ ───> │   Node.js   │ ───> │    MySQL    │
│  (Frontend) │      │  (Backend)  │      │  (Database) │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Tech Stack

- **Frontend**: React 18, TanStack Query, Axios, React Hot Toast
- **Backend**: Node.js, Express, Multer, xlsx, pdf-parse
- **Database**: MySQL 8.0+

## 📊 Database Schema

### Bảng `transactions`

Lưu dữ liệu sao kê gốc + kết quả phân loại tự động

- `upload_batch`: UUID của lần upload
- `trans_date`, `description`, `amount`, `balance`
- `debit_account`, `credit_account`, `ledger_type`
- `counterparty`, `customer_code`, `fee_type`
- `status`: PENDING / CONFIRMED / REJECTED

### Bảng `accounting_rules`

Lưu rules phân loại

- `keywords`: Từ khóa (cách nhau bởi `|`)
- `debit_account`, `credit_account`, `ledger_type`
- `amount_sign`: POSITIVE / NEGATIVE / ANY
- `priority`: Độ ưu tiên (số nhỏ = cao hơn)

### Bảng `ledgers`

Lưu dữ liệu sau khi xác nhận (sổ kế toán chính thức)

### Bảng `upload_batches`

Lịch sử upload file

## 🚀 Cài đặt & Chạy

### 1. Cài đặt Database

```bash
# Import schema
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Sửa thông tin database trong .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=accounting_db

# Chạy server
npm run dev
```

Backend chạy tại: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy app
npm start
```

Frontend chạy tại: `http://localhost:3000`

## 📝 Luồng xử lý

```
1. Upload file sao kê (PDF/CSV/XLSX)
         ↓
2. Parse & Normalize dữ liệu
         ↓
3. Rule Engine phân loại tự động
         ↓
4. Lưu vào bảng transactions (status = PENDING)
         ↓
5. Hiển thị trên Data Grid
         ↓
6. Người dùng kiểm tra & chỉnh sửa (nếu cần)
         ↓
7. Xác nhận (Confirm)
         ↓
8. Đổ vào bảng ledgers (Sổ kế toán chính thức)
```

## 🔧 Ví dụ Rules

### Rule: Lương nhân viên

```
Keywords:        LUONG|SALARY|THU LAO
TK Nợ:           334 (Chi phí nhân viên)
TK Có:           112 (Tiền gửi ngân hàng)
Loại sổ:         CHI_PHI
Dấu số tiền:     NEGATIVE (chi)
```

### Rule: Thu tiền khách hàng

```
Keywords:        THU TIEN|THANH TOAN KH|KHACH HANG
TK Nợ:           112 (Tiền gửi ngân hàng)
TK Có:           131 (Phải thu khách hàng)
Loại sổ:         CONG_NO
Dấu số tiền:     POSITIVE (thu)
```

### Rule: Thanh toán hộ khách hàng

```
Keywords:        THANH TOAN HO|TT HO|CHI HO|CHI PHI HO
TK Nợ:           131 (Phải thu khách hàng)
TK Có:           112 (Tiền gửi ngân hàng)
Loại sổ:         CONG_NO
Dấu số tiền:     NEGATIVE (chi)
Giải thích:      Khi công ty chi hộ cho KH, tạo công nợ phải thu
```

### Rule: Điện nước internet

```
Keywords:        DIEN|NUOC|INTERNET|EVN|VNPT
TK Nợ:           642 (Chi phí quản lý)
TK Có:           112 (Tiền gửi ngân hàng)
Loại sổ:         CHI_PHI
Dấu số tiền:     NEGATIVE (chi)
```

## 🎨 Giao diện

### Tab Giao dịch

- Upload zone (drag & drop)
- Data grid với chức năng edit inline
- Bulk confirm

### Tab Sổ kế toán

- Bộ lọc (loại sổ, khoảng thời gian)
- Tổng hợp theo loại sổ
- Danh sách chi tiết

### Tab Rules

- Danh sách rules
- Form tạo/sửa rule
- Bật/Tắt rule

## 📌 Lưu ý

### Nội dung giao dịch

- Nội dung trong file sao kê là **CHỮ IN HOA KHÔNG DẤU**
- Rules cần viết từ khóa bằng chữ in hoa không dấu
- Ví dụ: `LUONG`, `DIEN`, `NUOC`, `THANH TOAN`

### Bóc tách thông tin

- **Mã KH**: `KH001234`, `NCC123`, `CTY456`
- **Loại phí**: `PHI CHUYEN TIEN`, `PHI SMS`, `PHI DICH VU`
- **Đối tượng**: Tự động tách từ cụm `CHO CONG TY ABC`, `TU NCC XYZ`

### Số tiền

- **Dương (+)**: Thu tiền (credit)
- **Âm (-)**: Chi tiền (debit)

## 🔐 Bảo mật

- File upload giới hạn 20MB
- Chỉ chấp nhận: PDF, CSV, XLSX, XLS
- Validation dữ liệu trước khi insert DB
- Prepared statements (SQL injection prevention)

## 🐛 Troubleshooting

### Lỗi kết nối database

```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p

# Kiểm tra thông tin trong .env
cat backend/.env
```

### Lỗi parse file

- Kiểm tra format file có đúng chuẩn
- Đảm bảo có header row (Ngày, Nội dung, Số tiền)
- Thử với file mẫu trước

### Port đã được sử dụng

```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

## 📦 Build Production

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Output: build/
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License

---

**Phát triển bởi**: Kiro AI Assistant  
**Năm**: 2026
