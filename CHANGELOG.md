# Changelog

Tất cả thay đổi quan trọng của dự án sẽ được ghi lại ở đây.

## [1.0.10] - 2026-05-06

### ✨ Features

- ✅ **Tách cột "Số tiền" thành "Tiền ra" và "Tiền vào"**
  - Frontend: Hiển thị 2 cột riêng biệt với màu sắc (đỏ/xanh)
  - Excel Export: Tách thành 2 cột với tổng riêng
  - Dễ phân biệt giữa chi tiêu và thu nhập

### 🐛 Bug Fixes

- ✅ **Fix tổng tiền trong Excel export**
  - Thay chuỗi rỗng `""` bằng `0` để Excel tính toán đúng
  - Thêm console.log để debug và verify tổng
  - Đảm bảo dòng "TỔNG CỘNG" hiển thị đúng

- ✅ **Fix căn chỉnh header**
  - Header "Tiền ra" và "Tiền vào" căn phải
  - Khớp với dữ liệu số tiền bên dưới

### 🎨 UI/UX Improvements

- ✅ Tiền ra hiển thị màu đỏ (#ef4444)
- ✅ Tiền vào hiển thị màu xanh (#10b981)
- ✅ Header căn phải cho cột số tiền

## [1.0.9] - 2026-05-06

### ✨ Features

- ✅ **Tab riêng "Chi Phí Được Trừ"**
  - Tách thành tab độc lập trong navigation bar
  - Không còn là option trong dropdown filter
  - Dễ truy cập hơn (1 click thay vì 2 clicks)

- ✅ **Filter loại bỏ giao dịch không được khấu trừ**
  - Loại bỏ: "nộp thuế"
  - Loại bỏ: "ngân hàng nhà nước"
  - Loại bỏ: "kho bạc nhà nước"
  - Loại bỏ: "tạm ứng"
  - Loại bỏ: "chuyển khoản nội bộ"

### 🐛 Bug Fixes

- ✅ **Fix lỗi F5 hiển thị data cũ**
  - Khi F5 trang, không load data cũ từ database
  - Chỉ load data khi `refreshTrigger > 0` (sau khi confirm)
  - Upload file mới → Clear data ngay lập tức

### 🔧 Technical

- ✅ Thêm `LEDGER_FILTER_OPTIONS` riêng cho dropdown
- ✅ Giữ `LEDGER_TYPE_LABELS` cho display
- ✅ Component `DeductibleExpensesView.jsx` mới

## [1.0.8] - 2026-05-06

### ✨ Features

- ✅ **Excel Export với 4 sheets**
  - Sheet 1: Sổ Cái (tất cả giao dịch)
  - Sheet 2: Sổ Chi Phí (tất cả trừ công nợ)
  - Sheet 3: Sổ Công Nợ (chỉ công nợ)
  - Sheet 4: Chi Phí Được Trừ (chi phí với TK Nợ 6xx)

- ✅ **Bỏ cột "Số chứng từ"**
  - Đơn giản hóa Excel export
  - Giảm số cột không cần thiết

- ✅ **Thêm dòng "TỔNG CỘNG"**
  - Tự động tính tổng ở cuối mỗi sheet
  - Hiển thị tổng số tiền

### 🐛 Bug Fixes

- ✅ **Fix ledger data không refresh khi upload file mới**
  - Backend: Xóa tất cả data cũ trước khi upload mới
  - Frontend: Thêm refresh trigger mechanism
  - Đảm bảo chỉ hiển thị data từ file mới nhất

## [1.0.7] - 2026-05-06

### ✨ Features

- ✅ **Thay đổi logic hiển thị sổ**
  - Sổ Cái: Hiển thị TẤT CẢ giao dịch
  - Sổ Chi Phí: Hiển thị tất cả TRỪ công nợ
  - Sổ Công Nợ: Chỉ hiển thị công nợ
  - Default ledger type: CHI_PHI (thay vì SO_CAI)

### 🐛 Bug Fixes

- ✅ **Xóa trường counterparty và customer_code**
  - Không cần thiết cho use case hiện tại
  - Đơn giản hóa UI và database
  - Xóa logic extract từ ruleEngine

### 🔧 Database

- ✅ Migration: `migration-change-ledger-logic.sql`
- ✅ Migration: `migration-remove-counterparty-customer-code.sql`

## [1.0.6] - 2026-05-06

### ✨ Features

- ✅ **Fix priority management cho rules**
  - Tự động điều chỉnh priority khi thêm/xóa/sửa rule
  - Không còn duplicate priorities
  - Không còn gaps trong priority sequence
  - Wrapped trong database transactions

### 🛠️ Tools

- ✅ Script `backend/fix-priorities.js` để sửa priority hiện có

## [1.0.5] - 2026-05-06

### 🎨 UI/UX Improvements

- ✅ **Refactoring frontend components**
  - Tách `TransactionGrid` thành components nhỏ hơn
  - `TransactionRow.jsx` - Hiển thị 1 dòng giao dịch
  - `TransactionToolbar.jsx` - Toolbar với bulk actions
  - `LedgerFilter.jsx` - Filter cho ledger view
  - `LedgerSummary.jsx` - Tổng hợp thống kê
  - `ExportButton.jsx` - Nút xuất Excel

### 🧹 Cleanup

- ✅ Xóa 32 files không cần thiết
  - 4 backend test scripts
  - 28 individual fix documentation files
  - Giữ lại các file .md tổng quát quan trọng

## [1.0.3] - 2026-05-06

### ✨ Features

- ✅ **Thêm rule "Tạm ứng nhân viên"** (NEW)
  - Từ khóa: TAM UNG, UNG LUONG
  - Định khoản: Nợ 141 (Tạm ứng) / Có 112 (Tiền gửi NH)
  - Loại sổ: CONG_NO (Công nợ)
  - Dấu số tiền: NEGATIVE (− Chi)
  - Tự động phân loại giao dịch tạm ứng cho nhân viên

### 🐛 Bug Fixes

- ✅ **Fix logic chèn rule với priority** (NEW)
  - Tự động đẩy các rule có priority >= X xuống 1 bậc khi thêm rule mới với priority = X
  - Xử lý di chuyển rule lên/xuống khi thay đổi priority
  - Tránh ghi đè và mất dữ liệu rule cũ

### 📝 Documentation

- ✅ Thêm ADD_TAM_UNG_RULE.md với chi tiết rule mới
- ✅ Thêm migration script: migration-add-tam-ung-nhan-vien.sql
- ✅ Thêm FIX_PRIORITY_INSERT.md với chi tiết fix priority logic

## [1.0.2] - 2026-05-06

### 🐛 Bug Fixes

- ✅ Sửa lỗi upload file sao kê ngân hàng có nhiều header rows
- ✅ Parser giờ tự động tìm header row đúng (scan 30 dòng đầu)
- ✅ Validate header phải có "Ngày" VÀ "Nội dung/Diễn giải"
- ✅ Hỗ trợ 2 cột tiền riêng biệt (Tiền ra / Tiền vào)
- ✅ Bỏ qua dòng không hợp lệ (không có ngày, không có nội dung)
- ✅ Fix nội dung giao dịch dài bị tràn sang cột số tiền (Backend)
- ✅ **Fix text tràn ra ngoài cột trong bảng giao dịch (Frontend)** (NEW)

### ✨ Improvements

- ✅ Thêm nhiều aliases cho cột (DIỄN GIẢI, TIỀN RA, TIỀN VÀO, NGÀY GD, NGÀY HẠCH TOÁN, NGÀY HIỆU LỰC)
- ✅ Thêm hỗ trợ định dạng ngày `ddmmyyyy` (không dấu phân cách)
- ✅ Thêm hỗ trợ ngày có khoảng trắng (ví dụ: "01 02 2026")
- ✅ Thêm logging chi tiết để debug (hiển thị lý do bỏ qua từng dòng)
- ✅ Xử lý đúng logic Tiền ra (âm) / Tiền vào (dương)
- ✅ Enhanced error messages với thống kê chi tiết
- ✅ Gộp nội dung từ nhiều cột khi text bị tràn (Backend)
- ✅ **Text wrap tự động cho nội dung dài (Frontend)** (NEW)

### 🎨 UI/UX Improvements

- ✅ **Cột "Nội dung giao dịch" tự động wrap xuống dòng** (NEW)
- ✅ **Tăng maxWidth từ 300px → 400px** (NEW)
- ✅ **Thêm word-break để ngắt từ dài** (NEW)
- ✅ **Cải thiện line-height cho dễ đọc** (NEW)
- ✅ **Hiển thị dấu - + cho cột "Dấu ST" trong Rules** (NEW)
- ✅ **Ẩn Batch ID khỏi giao diện** (NEW)

### 🔄 Refactoring

- ✅ Đơn giản hóa header detection logic
  - Thay thế 7 arrays aliases + 3 functions bằng 1 function duy nhất
  - Sử dụng `row.join()` để tìm header thay vì check từng cell
  - Code ngắn gọn hơn 20 lines, dễ maintain hơn

### 🛠️ Developer Tools

- ✅ Thêm `backend/debug-excel.js` script để inspect file Excel
- ✅ Debug mode trong `parseDate()` function
- ✅ Skip reasons tracking (empty, noDate, invalidDate, noDescription)

### 📝 Documentation

- ✅ Thêm UPDATE_NOTES_v1.0.2.md với chi tiết fix
- ✅ Thêm DEBUG_PARSER.md với hướng dẫn gỡ lỗi chi tiết
- ✅ Thêm HUONG_DAN_DEBUG.md (tiếng Việt)
- ✅ Thêm QUICK_DEBUG_GUIDE.md
- ✅ Thêm FIX_NGAY_HIEU_LUC.md
- ✅ Thêm REFACTOR_HEADER_DETECTION.md
- ✅ Thêm FIX_LONG_DESCRIPTION.md
- ✅ Thêm FIX_TEXT_OVERFLOW_UI.md (NEW)

## [1.0.1] - 2026-05-06

### ✨ Features

- ✅ Thêm rule "Thanh toán hộ khách hàng" (TT HO)
  - Giao dịch có nội dung chứa "THANH TOAN HO", "TT HO", "CHI HO", "CHI PHI HO"
  - Tự động phân loại: TK Nợ 131 (Phải thu KH), TK Có 112 (Tiền gửi NH)
  - Loại sổ: CONG_NO (Công nợ phải thu)
  - Logic: Khi công ty chi hộ cho KH, tạo công nợ phải thu

### 📝 Documentation

- ✅ Cập nhật README.md với ví dụ rule mới
- ✅ Cập nhật sample-data/README.md với ví dụ giao dịch
- ✅ Cập nhật FAQ.md với Tip 6 về thanh toán hộ

### 🔧 Database

- ✅ Thêm rule mới vào schema.sql
- ✅ Tạo migration script: migration-add-thanh-toan-ho.sql

## [1.0.0] - 2026-05-06

### ✨ Features

#### Backend

- ✅ Upload & Parse file sao kê (PDF, CSV, XLSX, XLS)
- ✅ Rule Engine phân loại tự động
- ✅ Bóc tách thông tin: Mã KH, Loại phí, Đối tượng công nợ
- ✅ API CRUD cho Transactions
- ✅ API CRUD cho Rules
- ✅ API xem Ledgers (Sổ kế toán)
- ✅ Bulk confirm transactions
- ✅ Tổng hợp theo loại sổ và tài khoản

#### Frontend

- ✅ Upload Zone với drag & drop
- ✅ Transaction Grid với edit inline
- ✅ Bulk select & confirm
- ✅ Ledger View với filters
- ✅ Rules Manager (CRUD)
- ✅ Responsive design
- ✅ Toast notifications

#### Database

- ✅ Schema MySQL với 4 bảng chính
- ✅ 13 rules mặc định
- ✅ Foreign keys & indexes
- ✅ UTF-8 support

### 📝 Documentation

- ✅ README.md với hướng dẫn đầy đủ
- ✅ SETUP.md với troubleshooting
- ✅ API.md với API documentation
- ✅ Sample data & test cases

### 🔧 Technical

- React 18 với functional components
- TanStack Query cho data fetching
- Express.js với async error handling
- MySQL connection pooling
- Multer cho file upload
- xlsx & pdf-parse cho parsing

### 🎨 UI/UX

- Gradient header
- Tab navigation
- Color-coded ledger types
- Status badges
- Inline editing
- Confirmation dialogs

---

## Roadmap - Tính năng tương lai

### Version 1.1.0 (Planned)

- [ ] Authentication & Authorization
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Audit logs

### Version 1.2.0 (Planned)

- [ ] Export to Excel/PDF
- [ ] Advanced filters & search
- [ ] Dashboard với charts
- [ ] Email notifications

### Version 1.3.0 (Planned)

- [ ] OCR cho PDF scan
- [ ] AI-powered classification
- [ ] Batch operations
- [ ] Scheduled imports

### Version 2.0.0 (Future)

- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Integration với ngân hàng
- [ ] Báo cáo tài chính tự động

---

## Bug Fixes

### [1.0.0] - 2026-05-06

- 🐛 Fixed CSV parsing logic
- 🐛 Fixed date format detection
- 🐛 Fixed amount parsing with thousand separators
- 🐛 Fixed rule priority ordering

---

## Breaking Changes

Không có breaking changes trong version 1.0.0

---

## Migration Guide

### From 0.x to 1.0.0

Đây là phiên bản đầu tiên, không cần migration.

---

## Contributors

- Kiro AI Assistant - Initial development

---

## License

MIT License - See LICENSE file for details
