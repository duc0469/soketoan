-- Migration: Change Ledger Type Logic
-- Date: 2026-05-06
-- Changes:
--   1. Default ledger_type: SO_CAI -> CHI_PHI
--   2. SO_CAI: Hiển thị TẤT CẢ giao dịch
--   3. CHI_PHI: Hiển thị tất cả TRỪ CONG_NO
--   4. CONG_NO: Chỉ hiển thị công nợ

USE accounting_db;

-- Change default value for transactions table
ALTER TABLE transactions
  MODIFY COLUMN ledger_type ENUM('CHI_PHI','SO_CAI','CONG_NO','TIEN_MAT') DEFAULT 'CHI_PHI';

-- Verify changes
DESCRIBE transactions;

-- Note: Existing data will keep their current ledger_type values
-- Only new records will use CHI_PHI as default
