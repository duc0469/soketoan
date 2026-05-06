-- Migration: Remove counterparty and customer_code columns
-- Date: 2026-05-06
-- Reason: These fields are not needed for the accounting system

USE accounting_db;

-- Remove columns from transactions table
ALTER TABLE transactions
  DROP COLUMN IF EXISTS counterparty,
  DROP COLUMN IF EXISTS customer_code;

-- Remove columns from ledgers table
ALTER TABLE ledgers
  DROP COLUMN IF EXISTS counterparty,
  DROP COLUMN IF EXISTS customer_code;

-- Verify changes
DESCRIBE transactions;
DESCRIBE ledgers;
