# 🔧 Troubleshooting Guide

## Upload File Issues

### ❌ Lỗi: "Chỉ hỗ trợ file: PDF, CSV, XLSX, XLS"

**Nguyên nhân**: File extension không được hỗ trợ

**Giải pháp**:

1. Kiểm tra extension file (phải là .pdf, .csv, .xlsx, hoặc .xls)
2. Đổi tên file nếu cần (VD: `sao-ke.txt` → `sao-ke.csv`)
3. Nếu file Excel, save as `.xlsx` format

---

### ❌ Lỗi: "Không đọc được dữ liệu từ file"

**Nguyên nhân**: File không có dữ liệu hoặc format sai

**Giải pháp**:

#### 1. Kiểm tra Header Row

File **PHẢI** có header row với các cột:

- ✅ **Ngày** (hoặc Date, NGAY, NGÀY)
- ✅ **Nội dung** (hoặc Description, NOI DUNG, DIEN GIAI)
- ✅ **Số tiền** (hoặc Amount, SO TIEN, TIEN)

**Ví dụ đúng**:

```
Ngày       | Nội dung                  | Số tiền
01/05/2026 | LUONG THANG 4            | -15000000
02/05/2026 | THU TIEN KH001234        | 20000000
```

**Ví dụ sai** (thiếu header):

```
01/05/2026 | LUONG THANG 4            | -15000000
02/05/2026 | THU TIEN KH001234        | 20000000
```

#### 2. Kiểm tra Format Ngày

Ngày phải có format:

- ✅ `dd/mm/yyyy` (01/05/2026)
- ✅ `dd-mm-yyyy` (01-05-2026)
- ✅ `yyyy-mm-dd` (2026-05-01)
- ✅ Excel date serial (44682)

**Ví dụ sai**:

- ❌ `01/05/26` (năm 2 chữ số)
- ❌ `1 May 2026` (text)
- ❌ `05/01/2026` (mm/dd/yyyy - US format)

#### 3. Kiểm tra Format Số Tiền

Số tiền phải là số:

- ✅ `15000000`
- ✅ `15,000,000`
- ✅ `-15000000` (số âm)
- ✅ `15000000.50` (có thập phân)

**Ví dụ sai**:

- ❌ `15,000,000 VND` (có chữ)
- ❌ `15 triệu` (text)
- ❌ `(15,000,000)` (dấu ngoặc)

#### 4. Test File Locally

```bash
cd backend
node test-upload.js path/to/your-file.xlsx
```

Xem output để biết lỗi cụ thể.

---

### ❌ Lỗi: "Không tìm thấy cột Ngày/Nội dung/Số tiền"

**Nguyên nhân**: Header không đúng tên

**Giải pháp**: Đổi tên header thành một trong các tên sau:

| Cột      | Tên được hỗ trợ                                                        |
| -------- | ---------------------------------------------------------------------- |
| Ngày     | `NGAY`, `DATE`, `NGÀY`, `NGAY GD`, `NGAY GIAO DICH`                    |
| Nội dung | `NOI DUNG`, `DIEN GIAI`, `MO TA`, `DESCRIPTION`, `CONTENT`, `NỘI DUNG` |
| Số tiền  | `SO TIEN`, `TIEN`, `AMOUNT`, `GIAO DICH`, `PHAT SINH`, `SỐ TIỀN`       |

**Ví dụ**:

```
# ❌ Sai
Ngày GD | Diễn giải | Tiền

# ✅ Đúng
Ngày | Nội dung | Số tiền
```

---

### ❌ Lỗi: "Không có dữ liệu hợp lệ sau khi parse"

**Nguyên nhân**: Tất cả dòng bị bỏ qua do format sai

**Giải pháp**:

1. Kiểm tra **mỗi dòng** có ngày hợp lệ
2. Kiểm tra **mỗi dòng** có số tiền hợp lệ
3. Xóa dòng trống
4. Xóa dòng tổng cộng (nếu có)

---

### ❌ File PDF không parse được

**Nguyên nhân**: PDF là scan (image) hoặc format đặc biệt

**Giải pháp**:

1. **PDF phải là text-based** (không phải scan)
2. Nếu là scan, dùng OCR trước (Google Drive, Adobe)
3. Hoặc convert sang Excel thủ công

---

### ❌ File CSV encoding sai

**Nguyên nhân**: File CSV không phải UTF-8

**Giải pháp**:

1. Mở file bằng Notepad++
2. Encoding → Convert to UTF-8
3. Save và upload lại

---

## Database Issues

### ❌ Lỗi: "Cannot connect to MySQL"

**Giải pháp**:

```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p -e "SELECT 1;"

# Kiểm tra thông tin trong backend/.env
cat backend/.env

# Restart MySQL
# Windows:
net start MySQL80

# macOS:
brew services restart mysql

# Linux:
sudo systemctl restart mysql
```

---

### ❌ Lỗi: "Access denied for user"

**Giải pháp**:

```bash
# Kiểm tra password trong .env
# Hoặc tạo user mới
mysql -u root -p

CREATE USER 'accounting_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON accounting_db.* TO 'accounting_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Performance Issues

### 🐌 Upload file lớn rất chậm

**Giải pháp**:

1. Chia nhỏ file (mỗi file < 1000 dòng)
2. Tăng RAM cho Node.js:
   ```bash
   node --max-old-space-size=4096 src/server.js
   ```
3. Tăng timeout trong frontend:
   ```javascript
   // frontend/src/api/client.js
   timeout: 120000, // 2 phút
   ```

---

### 🐌 Bảng có 1000+ dòng, scroll lag

**Giải pháp**:

1. Giảm limit trong query:
   ```javascript
   getTransactions({ limit: 50 });
   ```
2. Dùng pagination
3. Filter theo ngày để giảm số dòng

---

## Frontend Issues

### ❌ Lỗi: "CORS error"

**Giải pháp**:

1. Kiểm tra backend đang chạy: `http://localhost:5000/api/health`
2. Kiểm tra API URL trong `frontend/src/api/client.js`
3. Restart backend

---

### ❌ Upload progress stuck at 100%

**Nguyên nhân**: Backend đang xử lý

**Giải pháp**: Đợi thêm (có thể mất 10-30s cho file lớn)

---

## Debug Tools

### 1. Check Backend Logs

```bash
cd backend
npm run dev
# Xem console output
```

### 2. Check Browser Console

```
F12 → Console tab
Xem error messages
```

### 3. Test API với cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Upload file
curl -X POST http://localhost:5000/api/upload \
  -F "file=@test.xlsx"
```

### 4. Test Parser Locally

```bash
cd backend
node test-upload.js path/to/file.xlsx
```

### 5. Check Database

```bash
mysql -u root -p accounting_db

# Xem transactions
SELECT * FROM transactions ORDER BY id DESC LIMIT 10;

# Xem rules
SELECT * FROM accounting_rules WHERE is_active = 1;

# Xem upload history
SELECT * FROM upload_batches ORDER BY created_at DESC LIMIT 10;
```

---

## Common Mistakes

### ❌ Mistake 1: File không có header

```
# Sai
01/05/2026 | LUONG | -15000000

# Đúng
Ngày | Nội dung | Số tiền
01/05/2026 | LUONG | -15000000
```

### ❌ Mistake 2: Ngày format US (mm/dd/yyyy)

```
# Sai (US format)
05/01/2026 → May 1, 2026

# Đúng (VN format)
01/05/2026 → 1 May, 2026
```

### ❌ Mistake 3: Số tiền có chữ

```
# Sai
15,000,000 VND

# Đúng
15000000
hoặc
-15000000
```

### ❌ Mistake 4: File Excel có nhiều sheet

```
# Chỉ parse sheet đầu tiên
# Nếu cần sheet khác, copy sang file mới
```

---

## Still Having Issues?

1. ✅ Đọc [FAQ.md](FAQ.md)
2. ✅ Đọc [SETUP.md](SETUP.md)
3. ✅ Check logs (backend console + browser console)
4. ✅ Test với file mẫu trong [sample-data/](sample-data/)
5. ✅ Tạo issue trên GitHub với:
   - Mô tả lỗi
   - Steps to reproduce
   - Screenshots
   - File mẫu (nếu có thể)
   - Backend logs
   - Browser console logs

---

**Last updated**: 2026-05-06
