# ❓ Frequently Asked Questions (FAQ)

## 📋 Mục lục

1. [Cài đặt & Setup](#cài-đặt--setup)
2. [Upload & Parse](#upload--parse)
3. [Phân loại & Rules](#phân-loại--rules)
4. [Giao dịch & Sổ](#giao-dịch--sổ)
5. [Lỗi thường gặp](#lỗi-thường-gặp)
6. [Performance](#performance)
7. [Bảo mật](#bảo-mật)
8. [Khác](#khác)

---

## Cài đặt & Setup

### Q: Tôi cần cài đặt gì để chạy ứng dụng?

**A:** Bạn cần:

- Node.js v16+ (khuyến nghị v18+)
- MySQL 8.0+
- Git (để clone repo)

### Q: Tôi không biết password MySQL của mình?

**A:**

```bash
# Reset password MySQL
# macOS:
mysql.server stop
mysqld_safe --skip-grant-tables &
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# Windows: Dùng MySQL Installer để reset
```

### Q: Port 5000 hoặc 3000 đã được sử dụng, làm sao?

**A:** Đổi port:

```bash
# Backend: Sửa backend/.env
PORT=5001

# Frontend: Tạo frontend/.env
PORT=3001
```

### Q: Làm sao để chạy cả backend và frontend cùng lúc?

**A:**

```bash
# Windows: Double-click START.bat
# macOS/Linux:
chmod +x start.sh
./start.sh
```

---

## Upload & Parse

### Q: Ứng dụng hỗ trợ file gì?

**A:** PDF, CSV, XLSX, XLS (max 20MB)

### Q: File Excel của tôi không parse được?

**A:** Kiểm tra:

1. File có header row (Ngày, Nội dung, Số tiền)?
2. Cột Ngày có format ngày hợp lệ (dd/mm/yyyy)?
3. Cột Số tiền là số (không có chữ)?
4. File không bị password protect?

### Q: File PDF của tôi không parse được?

**A:** PDF phải là text-based (không phải scan). Nếu là scan, cần OCR trước.

### Q: Làm sao để parse file CSV với encoding đặc biệt?

**A:** Hiện tại chỉ hỗ trợ UTF-8. Convert file sang UTF-8 trước khi upload.

### Q: File của tôi có nhiều sheet, parse sheet nào?

**A:** Mặc định parse sheet đầu tiên. Nếu cần sheet khác, copy sang file mới.

### Q: Tôi có thể upload nhiều file cùng lúc không?

**A:** Hiện tại chỉ upload 1 file/lần. Upload lần lượt.

---

## Phân loại & Rules

### Q: Làm sao để tạo rule mới?

**A:**

1. Vào tab "⚙️ Rules"
2. Click "+ Thêm Rule"
3. Điền thông tin:
   - Tên rule
   - Từ khóa (cách nhau bởi `|`)
   - TK Nợ, TK Có
   - Loại sổ
4. Click "➕ Tạo mới"

### Q: Từ khóa phải viết như thế nào?

**A:**

- **Viết HOA không dấu**: `LUONG|SALARY|THU LAO`
- **Cách nhau bởi `|`**: OR logic
- **Ví dụ**: `DIEN|NUOC|INTERNET` → match "DIEN" HOẶC "NUOC" HOẶC "INTERNET"

### Q: Rule của tôi không hoạt động?

**A:** Kiểm tra:

1. Từ khóa có viết HOA không dấu?
2. Rule có is_active = 1?
3. Priority có đúng? (số nhỏ = ưu tiên cao)
4. amount_sign có đúng? (POSITIVE/NEGATIVE/ANY)

### Q: Nhiều rule match, rule nào được chọn?

**A:** Rule có priority thấp nhất (số nhỏ nhất) được chọn.

### Q: Làm sao để test rule mới?

**A:**

1. Tạo rule
2. Upload file có nội dung match từ khóa
3. Kiểm tra kết quả phân loại

### Q: Tôi có thể import/export rules không?

**A:** Hiện tại chưa hỗ trợ. Có thể export từ MySQL:

```sql
SELECT * FROM accounting_rules INTO OUTFILE '/tmp/rules.csv';
```

---

## Giao dịch & Sổ

### Q: Làm sao để sửa giao dịch?

**A:**

1. Click nút ✏️ trên dòng cần sửa
2. Sửa TK Nợ/Có, Loại sổ, etc.
3. Click 💾 để lưu

### Q: Tôi có thể sửa giao dịch đã xác nhận không?

**A:** Không. Giao dịch đã xác nhận (CONFIRMED) không thể sửa/xóa.

### Q: Làm sao để xác nhận nhiều giao dịch cùng lúc?

**A:**

1. Tick chọn các giao dịch
2. Click "✓ Xác nhận (n)"

### Q: Sau khi xác nhận, dữ liệu ở đâu?

**A:** Vào tab "📊 Sổ kế toán" để xem.

### Q: Làm sao để xóa giao dịch?

**A:** Click nút 🗑️. Chỉ xóa được giao dịch PENDING.

### Q: Tôi có thể undo xác nhận không?

**A:** Hiện tại chưa hỗ trợ. Cần xóa trực tiếp trong database:

```sql
DELETE FROM ledgers WHERE transaction_id = ?;
UPDATE transactions SET status = 'PENDING' WHERE id = ?;
```

---

## Lỗi thường gặp

### Q: "Cannot connect to MySQL"

**A:**

```bash
# Kiểm tra MySQL đang chạy
mysql -u root -p -e "SELECT 1;"

# Kiểm tra thông tin trong backend/.env
cat backend/.env
```

### Q: "Port already in use"

**A:**

```bash
# Kill process
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Q: "npm install failed"

**A:**

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Q: "Cannot parse file"

**A:** Kiểm tra format file (xem phần Upload & Parse)

### Q: "CORS error"

**A:** Backend đã enable CORS. Nếu vẫn lỗi, check:

1. Backend có chạy không?
2. Frontend có đúng API URL không? (check `frontend/src/api/client.js`)

### Q: "413 Payload Too Large"

**A:** File quá lớn (>20MB). Giảm kích thước hoặc tăng limit trong `backend/src/routes/upload.js`:

```javascript
limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
```

---

## Performance

### Q: Upload file lớn (>10MB) rất chậm?

**A:** Đây là bình thường. Parsing file lớn mất thời gian. Có thể:

1. Chia nhỏ file
2. Tăng RAM cho Node.js: `node --max-old-space-size=4096 src/server.js`

### Q: Bảng có 1000+ dòng, scroll rất lag?

**A:** Dùng pagination. Giảm `limit` trong query:

```javascript
getTransactions({ limit: 50 });
```

### Q: Làm sao để tăng tốc phân loại?

**A:**

1. Giảm số lượng rules
2. Tăng priority cho rules hay dùng
3. Cache rules (đã implement, TTL 1 phút)

---

## Bảo mật

### Q: Ứng dụng có authentication không?

**A:** Hiện tại chưa. Đang trong TODO list (v1.1.0).

### Q: Tôi có thể deploy lên internet không?

**A:** Có, nhưng **NÊN thêm authentication trước**. Xem TODO.md.

### Q: Làm sao để bảo mật database?

**A:**

1. Đổi password MySQL mạnh
2. Không dùng user `root` trong production
3. Tạo user riêng với quyền hạn chế:

```sql
CREATE USER 'accounting_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON accounting_db.* TO 'accounting_user'@'localhost';
```

### Q: File upload có bị virus không?

**A:** Ứng dụng không scan virus. Nên:

1. Chỉ upload file từ nguồn tin cậy
2. Dùng antivirus scan trước
3. Thêm virus scanning (ClamAV) nếu cần

---

## Khác

### Q: Tôi có thể dùng cho công ty không?

**A:** Có, license MIT cho phép sử dụng thương mại.

### Q: Có hỗ trợ tiếng Anh không?

**A:** Hiện tại chỉ tiếng Việt. i18n trong TODO list.

### Q: Tôi có thể đóng góp code không?

**A:** Có! Đọc [CONTRIBUTING.md](CONTRIBUTING.md).

### Q: Làm sao để backup dữ liệu?

**A:**

```bash
# Backup database
mysqldump -u root -p accounting_db > backup.sql

# Restore
mysql -u root -p accounting_db < backup.sql
```

### Q: Tôi có thể tích hợp với phần mềm khác không?

**A:** Có, qua REST API. Xem [API.md](API.md).

### Q: Có mobile app không?

**A:** Chưa. React Native app trong roadmap v2.0.0.

### Q: Tôi cần thêm tính năng X, làm sao?

**A:**

1. Tạo issue trên GitHub
2. Hoặc tự code và submit PR
3. Hoặc thuê developer

### Q: Ứng dụng có miễn phí không?

**A:** Có, hoàn toàn miễn phí và open-source (MIT License).

### Q: Tôi gặp lỗi không có trong FAQ?

**A:**

1. Đọc [SETUP.md](SETUP.md)
2. Check logs trong terminal
3. Check browser console (F12)
4. Tạo issue trên GitHub với:
   - Mô tả lỗi
   - Steps to reproduce
   - Screenshots
   - Environment (OS, Node version, etc.)

---

## 💡 Tips & Tricks

### Tip 1: Keyboard Shortcuts (Future)

Hiện tại chưa có. Trong TODO list.

### Tip 2: Bulk Operations

Dùng Shift+Click để chọn nhiều dòng liên tiếp.

### Tip 3: Quick Filter

Dùng browser search (Ctrl+F) để tìm nhanh trong bảng.

### Tip 4: Export Data

Hiện tại chưa có export. Có thể query trực tiếp từ MySQL:

```sql
SELECT * FROM ledgers WHERE entry_date BETWEEN '2026-05-01' AND '2026-05-31';
```

### Tip 5: Custom Rules

Tạo rules càng chi tiết càng tốt. Ví dụ:

- ❌ `THANH TOAN` (quá chung)
- ✅ `THANH TOAN TIEN DIEN|THANH TOAN EVN` (cụ thể)

### Tip 6: Thanh toán hộ khách hàng

Khi công ty chi hộ cho khách hàng (ví dụ: chi phí điện nước, vận chuyển):

- **Nội dung**: `THANH TOAN HO` hoặc `TT HO` hoặc `CHI HO`
- **Kết quả**: TK Nợ 131 (Phải thu KH), TK Có 112 (Tiền gửi NH)
- **Loại sổ**: CONG_NO (Công nợ phải thu)
- **Giải thích**: Công ty tạm ứng cho KH, sau đó thu lại từ KH

---

## 📞 Cần thêm giúp đỡ?

- 📖 Đọc [README.md](README.md)
- 🚀 Đọc [QUICKSTART.md](QUICKSTART.md)
- 🔧 Đọc [SETUP.md](SETUP.md)
- 🏗️ Đọc [ARCHITECTURE.md](ARCHITECTURE.md)
- 🐛 Tạo issue trên GitHub
- 💬 Hỏi trong Discussions

---

**Last updated**: 2026-05-06  
**Có câu hỏi mới?** Tạo issue với label `question`
