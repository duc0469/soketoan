-- ============================================
-- MIGRATION: Thêm bảng users cho auth
-- ============================================

USE accounting_db;

CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL COMMENT 'bcrypt hash',
  full_name    VARCHAR(100)  DEFAULT NULL,
  is_active    TINYINT(1)    DEFAULT 1,
  created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
