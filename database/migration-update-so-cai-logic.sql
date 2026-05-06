-- ============================================
-- MIGRATION: Cập nhật logic Sổ Cái
-- ============================================
-- Mục đích:
-- 1. Sổ Cái (SO_CAI) sẽ hiển thị TẤT CẢ các giao dịch
-- 2. Các giao dịch không thuộc CHI_PHI/CONG_NO sẽ tự động gắn vào SO_CAI
-- 3. Xóa loại sổ "KHAC" khỏi hệ thống
-- ============================================

USE accounting_db;

-- Bước 1: Cập nhật tất cả giao dịch có ledger_type = 'KHAC' thành 'SO_CAI'
UPDATE transactions 
SET ledger_type = 'SO_CAI' 
WHERE ledger_type = 'KHAC';

-- Bước 2: Cập nhật ledgers table
UPDATE ledgers 
SET ledger_type = 'SO_CAI' 
WHERE ledger_type = 'KHAC';

-- Bước 3: Thay đổi ENUM để xóa 'KHAC'
-- Lưu ý: MySQL không cho phép sửa ENUM trực tiếp, phải tạo lại cột

-- Transactions table
ALTER TABLE transactions 
MODIFY COLUMN ledger_type ENUM('CHI_PHI','SO_CAI','CONG_NO','TIEN_MAT') DEFAULT 'SO_CAI';

-- Accounting_rules table
ALTER TABLE accounting_rules 
MODIFY COLUMN ledger_type ENUM('CHI_PHI','SO_CAI','CONG_NO','TIEN_MAT') NOT NULL;

-- Ledgers table
ALTER TABLE ledgers 
MODIFY COLUMN ledger_type ENUM('CHI_PHI','SO_CAI','CONG_NO','TIEN_MAT') NOT NULL;

-- ============================================
-- HOÀN TẤT
-- ============================================
-- Sau khi chạy migration này:
-- - Tất cả giao dịch "KHAC" đã được chuyển thành "SO_CAI"
-- - Sổ Cái sẽ hiển thị tất cả các giao dịch khi filter
-- - Các giao dịch không match rule sẽ tự động gắn vào SO_CAI
-- ============================================
