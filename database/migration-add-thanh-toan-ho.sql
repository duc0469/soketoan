-- ============================================
-- MIGRATION: Thêm rule "Thanh toán hộ KH"
-- Date: 2026-05-06
-- ============================================

USE accounting_db;

-- Thêm rule mới cho thanh toán hộ khách hàng
INSERT INTO accounting_rules (rule_name, keywords, debit_account, credit_account, ledger_type, amount_sign, priority, is_active)
VALUES ('Thanh toán hộ KH', 'THANH TOAN HO|TT HO|CHI HO|CHI PHI HO', '131', '112', 'CONG_NO', 'NEGATIVE', 14, 1)
ON DUPLICATE KEY UPDATE
  keywords = 'THANH TOAN HO|TT HO|CHI HO|CHI PHI HO',
  debit_account = '131',
  credit_account = '112',
  ledger_type = 'CONG_NO',
  amount_sign = 'NEGATIVE',
  priority = 14,
  is_active = 1;

-- Kiểm tra kết quả
SELECT * FROM accounting_rules WHERE rule_name = 'Thanh toán hộ KH';
