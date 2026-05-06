-- ============================================
-- MIGRATION: Thêm rule "Tạm ứng nhân viên"
-- Version: 1.0.3
-- Date: 2026-05-06
-- ============================================

-- Thêm rule mới
INSERT INTO accounting_rules (
  rule_name, 
  keywords, 
  debit_account, 
  credit_account, 
  ledger_type, 
  amount_sign, 
  priority
) VALUES (
  'Tạm ứng nhân viên',
  'TAM UNG|UNG LUONG',
  '141',
  '112',
  'CONG_NO',
  'NEGATIVE',
  15
);

-- Verify
SELECT * FROM accounting_rules WHERE rule_name = 'Tạm ứng nhân viên';
