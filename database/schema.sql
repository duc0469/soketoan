-- ============================================
-- ACCOUNTING APP - DATABASE SCHEMA
-- ============================================

CREATE DATABASE IF NOT EXISTS accounting_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE accounting_db;

-- ============================================
-- BẢNG TRANSACTIONS: Lưu dữ liệu sao kê gốc
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  upload_batch  VARCHAR(36)    NOT NULL COMMENT 'UUID của lần upload',
  trans_date    DATE           NOT NULL COMMENT 'Ngày giao dịch',
  description   TEXT           NOT NULL COMMENT 'Nội dung giao dịch (chữ in hoa)',
  amount        DECIMAL(18,2)  NOT NULL COMMENT 'Số tiền (âm = chi, dương = thu)',
  balance       DECIMAL(18,2)  DEFAULT NULL COMMENT 'Số dư sau giao dịch',
  ref_no        VARCHAR(100)   DEFAULT NULL COMMENT 'Số tham chiếu',
  -- Kết quả phân loại tự động
  debit_account  VARCHAR(20)   DEFAULT NULL COMMENT 'TK Nợ',
  credit_account VARCHAR(20)   DEFAULT NULL COMMENT 'TK Có',
  ledger_type    ENUM('CHI_PHI','SO_CAI','CONG_NO','TIEN_MAT') DEFAULT 'CHI_PHI',
  counterparty   VARCHAR(255)  DEFAULT NULL COMMENT 'Đối tượng công nợ (NCC/KH)',
  customer_code  VARCHAR(50)   DEFAULT NULL COMMENT 'Mã khách hàng bóc tách từ nội dung',
  fee_type       VARCHAR(100)  DEFAULT NULL COMMENT 'Loại phí bóc tách từ nội dung',
  -- Trạng thái
  status         ENUM('PENDING','CONFIRMED','REJECTED') DEFAULT 'PENDING',
  rule_id        INT            DEFAULT NULL COMMENT 'Rule đã áp dụng',
  is_manual      TINYINT(1)     DEFAULT 0 COMMENT '1 = người dùng sửa tay',
  created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_batch    (upload_batch),
  INDEX idx_date     (trans_date),
  INDEX idx_status   (status),
  INDEX idx_ledger   (ledger_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- BẢNG ACCOUNTING_RULES: Từ khóa mapping TK
-- ============================================
CREATE TABLE IF NOT EXISTS accounting_rules (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  rule_name      VARCHAR(100)  NOT NULL COMMENT 'Tên rule',
  keywords       TEXT          NOT NULL COMMENT 'Từ khóa cách nhau bởi dấu |',
  debit_account  VARCHAR(20)   NOT NULL COMMENT 'TK Nợ mặc định',
  credit_account VARCHAR(20)   NOT NULL COMMENT 'TK Có mặc định',
  ledger_type    ENUM('CHI_PHI','SO_CAI','CONG_NO','TIEN_MAT') NOT NULL,
  amount_sign    ENUM('POSITIVE','NEGATIVE','ANY') DEFAULT 'ANY' COMMENT 'Dấu số tiền',
  priority       INT           DEFAULT 10 COMMENT 'Ưu tiên (số nhỏ = ưu tiên cao hơn)',
  is_active      TINYINT(1)    DEFAULT 1,
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_priority (priority),
  INDEX idx_active   (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- BẢNG LEDGERS: Dữ liệu sau khi xác nhận
-- ============================================
CREATE TABLE IF NOT EXISTS ledgers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id  INT           NOT NULL,
  ledger_type     ENUM('CHI_PHI','SO_CAI','CONG_NO','TIEN_MAT') NOT NULL,
  entry_date      DATE          NOT NULL,
  description     TEXT          NOT NULL,
  debit_account   VARCHAR(20)   NOT NULL,
  credit_account  VARCHAR(20)   NOT NULL,
  amount          DECIMAL(18,2) NOT NULL,
  counterparty    VARCHAR(255)  DEFAULT NULL,
  customer_code   VARCHAR(50)   DEFAULT NULL,
  ref_no          VARCHAR(100)  DEFAULT NULL,
  confirmed_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  INDEX idx_type      (ledger_type),
  INDEX idx_date      (entry_date),
  INDEX idx_debit     (debit_account),
  INDEX idx_credit    (credit_account)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- BẢNG UPLOAD_BATCHES: Lịch sử upload
-- ============================================
CREATE TABLE IF NOT EXISTS upload_batches (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  batch_id     VARCHAR(36)   NOT NULL UNIQUE,
  file_name    VARCHAR(255)  NOT NULL,
  file_type    VARCHAR(10)   NOT NULL,
  total_rows   INT           DEFAULT 0,
  parsed_rows  INT           DEFAULT 0,
  status       ENUM('PROCESSING','DONE','ERROR') DEFAULT 'PROCESSING',
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- DỮ LIỆU MẪU: Accounting Rules
-- ============================================
INSERT INTO accounting_rules (rule_name, keywords, debit_account, credit_account, ledger_type, amount_sign, priority) VALUES
-- Lương & nhân sự
('Lương nhân viên',       'LUONG|SALARY|THU LAO|TIEN CONG',                '334',  '112',  'CHI_PHI',  'NEGATIVE', 1),
-- Chi phí điện nước
('Điện nước internet',    'DIEN|NUOC|INTERNET|CUOC|VIEN THONG|VNPT|VIETTEL|EVN','642',  '112',  'CHI_PHI',  'NEGATIVE', 2),
-- Thuê văn phòng
('Thuê mặt bằng',         'VP|MAT BANG|VAN PHONG',             '642',  '112',  'CHI_PHI',  'NEGATIVE', 3),
-- Công nợ phải trả NCC
('Thanh toán NCC',        'THANH TOAN|CHUYEN KHOAN',          '331',  '112',  'CONG_NO',  'NEGATIVE', 4),
-- Thu tiền khách hàng
('Thu tiền KH',           'THU TIEN|THANH TOAN KH|KH CHUYEN|KHACH HANG',   '112',  '131',  'CONG_NO',  'POSITIVE', 5),
-- Nộp thuế
('Nộp thuế',              'THUE|THUE GTGT|THUE TNDN|THUE TNCN|KBNN|KHO BAC','333', '112',  'CHI_PHI',  'NEGATIVE', 6),
-- Bảo hiểm
('Bảo hiểm',              'BAO HIEM|BHXH|BHYT|BHTN',                       '338',  '112',  'CHI_PHI',  'NEGATIVE', 7),
-- Văn phòng phẩm
('Văn phòng phẩm',        'VAN PHONG PHAM|VPP|MUA VAN PHONG',              '642',  '112',  'CHI_PHI',  'NEGATIVE', 8),
-- Xăng dầu đi lại
('Xăng dầu đi lại',       'XANG|DAU|DI LAI|CONG TAC|TAXI|GRAB',           '642',  '112',  'CHI_PHI',  'NEGATIVE', 9),
-- Rút tiền mặt
('Rút tiền mặt',          'RUT TIEN|RUT ATM|RUT MAT',                      '111',  '112',  'TIEN_MAT', 'NEGATIVE', 10),
-- Nộp tiền mặt
('Nộp tiền mặt',          'NOP TIEN|GUI TIEN|CHUYEN TIEN',                 '112',  '111',  'TIEN_MAT', 'POSITIVE', 11),
-- Lãi tiền gửi
('Lãi tiền gửi',          'LAI TIEN GUI|LAI SUAT|INTEREST',                '112',  '515',  'SO_CAI',   'POSITIVE', 12),
-- Phí ngân hàng
('Phí ngân hàng',         'PHI CHUYEN TIEN|PHI SMS|PHI QUAN LY','642', '112',  'CHI_PHI',  'NEGATIVE', 13),
-- Thanh toán hộ khách hàng (chi phí hộ KH -> ghi công nợ phải thu)
('Thanh toán hộ KH',      'THANH TOAN HO|TT HO|CHI HO|CHI PHI HO',          '131', '112',  'CONG_NO',  'NEGATIVE', 14),
-- Tạm ứng cho nhân viên (tạm ứng -> ghi công nợ phải thu từ NV)
('Tạm ứng nhân viên',     'TAM UNG|UNG LUONG',                              '141', '112',  'CONG_NO',  'NEGATIVE', 15);
