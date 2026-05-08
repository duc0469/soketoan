-- ============================================
-- MIGRATION: Thêm tính năng mới
-- Partner Mapping, Notes, Audit Trail, etc.
-- ============================================

USE accounting_db;

-- 1. Thêm cột note vào transactions
ALTER TABLE transactions
  ADD COLUMN note TEXT DEFAULT NULL COMMENT 'Ghi chú của kế toán viên'
  AFTER fee_type;

-- 2. Thêm cột partner_name vào transactions (bóc tách từ nội dung)
ALTER TABLE transactions
  ADD COLUMN partner_name VARCHAR(255) DEFAULT NULL COMMENT 'Tên đối tác nhận diện tự động'
  AFTER note;

-- 3. Thêm cột partner_name vào ledgers
ALTER TABLE ledgers
  ADD COLUMN partner_name VARCHAR(255) DEFAULT NULL COMMENT 'Tên đối tác'
  AFTER ref_no;

ALTER TABLE ledgers
  ADD COLUMN note TEXT DEFAULT NULL COMMENT 'Ghi chú'
  AFTER partner_name;

-- 4. Bảng PARTNERS: Ánh xạ đối tác tự động
CREATE TABLE IF NOT EXISTS partners (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  partner_name    VARCHAR(255)  NOT NULL COMMENT 'Tên hiển thị',
  keywords        TEXT          NOT NULL COMMENT 'Từ khóa nhận diện trong sao kê (cách nhau bởi |)',
  default_account VARCHAR(20)   DEFAULT NULL COMMENT 'TK mặc định khi match',
  partner_type    ENUM('NCC','KH','NGAN_HANG','KHAC') DEFAULT 'KHAC',
  is_active       TINYINT(1)    DEFAULT 1,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Bảng TRANSACTION_LOGS: Audit trail
CREATE TABLE IF NOT EXISTS transaction_logs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id  INT           NOT NULL,
  field_changed   VARCHAR(50)   NOT NULL COMMENT 'Tên trường bị thay đổi',
  old_value       TEXT          DEFAULT NULL,
  new_value       TEXT          DEFAULT NULL,
  changed_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_transaction (transaction_id),
  INDEX idx_changed_at  (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Dữ liệu mẫu partners
INSERT INTO partners (partner_name, keywords, default_account, partner_type) VALUES
('Điện lực (EVN)',         'EVN|DIEN LUC|CONG TY DIEN',           '642', 'NCC'),
('VNPT',                   'VNPT|BUU CHINH VIEN THONG',            '642', 'NCC'),
('Viettel',                'VIETTEL|VIETTEL TELECOM',              '642', 'NCC'),
('Kho bạc Nhà nước',       'KHO BAC|KBNN|KHO BAC NHA NUOC',       '333', 'KHAC'),
('Bảo hiểm xã hội',        'BHXH|BAO HIEM XA HOI',                '338', 'KHAC'),
('Ngân hàng (phí DV)',     'PHI CHUYEN TIEN|PHI SMS|PHI QUAN LY', '642', 'NGAN_HANG'),
('Cảng',                   'CANG|CANG BIEN|CANG CONTAINER',       '331', 'NCC');
