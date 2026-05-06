# 🔄 Migration Guide

Hướng dẫn cập nhật database khi có thay đổi.

## Version 1.0.0 → 1.0.1

### Thay đổi

Thêm rule mới: **Thanh toán hộ khách hàng**

### Cách migrate

#### Option 1: Chạy migration script (Khuyến nghị)

```bash
mysql -u root -p accounting_db < database/migration-add-thanh-toan-ho.sql
```

#### Option 2: Chạy SQL thủ công

```sql
USE accounting_db;

INSERT INTO accounting_rules
  (rule_name, keywords, debit_account, credit_account, ledger_type, amount_sign, priority, is_active)
VALUES
  ('Thanh toán hộ KH', 'THANH TOAN HO|TT HO|CHI HO|CHI PHI HO', '131', '112', 'CONG_NO', 'NEGATIVE', 14, 1);
```

#### Option 3: Qua giao diện web

1. Vào tab "⚙️ Rules"
2. Click "+ Thêm Rule"
3. Điền thông tin:
   - **Tên rule**: Thanh toán hộ KH
   - **Từ khóa**: `THANH TOAN HO|TT HO|CHI HO|CHI PHI HO`
   - **TK Nợ**: `131`
   - **TK Có**: `112`
   - **Loại sổ**: `CONG_NO`
   - **Dấu số tiền**: `NEGATIVE`
   - **Độ ưu tiên**: `14`
4. Click "➕ Tạo mới"

### Kiểm tra

```sql
SELECT * FROM accounting_rules WHERE rule_name = 'Thanh toán hộ KH';
```

Kết quả mong đợi:

```
+----+--------------------+----------------------------------------+---------------+----------------+-------------+-------------+----------+-----------+
| id | rule_name          | keywords                               | debit_account | credit_account | ledger_type | amount_sign | priority | is_active |
+----+--------------------+----------------------------------------+---------------+----------------+-------------+-------------+----------+-----------+
| 14 | Thanh toán hộ KH   | THANH TOAN HO|TT HO|CHI HO|CHI PHI HO | 131           | 112            | CONG_NO     | NEGATIVE    | 14       | 1         |
+----+--------------------+----------------------------------------+---------------+----------------+-------------+-------------+----------+-----------+
```

### Test

Upload file Excel với nội dung:

| Ngày       | Nội dung                                     | Số tiền  | Số dư    |
| ---------- | -------------------------------------------- | -------- | -------- |
| 06/05/2026 | THANH TOAN HO CHI PHI DIEN NUOC CHO KH001234 | -1500000 | 50000000 |

Kết quả mong đợi:

- **TK Nợ**: 131
- **TK Có**: 112
- **Loại sổ**: CONG_NO
- **Mã KH**: KH001234 (tự động bóc tách)

### Rollback (nếu cần)

```sql
DELETE FROM accounting_rules WHERE rule_name = 'Thanh toán hộ KH';
```

---

## Lịch sử Migrations

| Version       | Date       | Description                  | Script                          |
| ------------- | ---------- | ---------------------------- | ------------------------------- |
| 1.0.0 → 1.0.1 | 2026-05-06 | Thêm rule "Thanh toán hộ KH" | migration-add-thanh-toan-ho.sql |

---

## Best Practices

1. **Backup trước khi migrate**:

   ```bash
   mysqldump -u root -p accounting_db > backup_before_migration.sql
   ```

2. **Test trên môi trường dev trước**

3. **Kiểm tra kết quả sau khi migrate**

4. **Có kế hoạch rollback**

---

**Lưu ý**: Migrations chỉ ảnh hưởng đến bảng `accounting_rules`. Dữ liệu trong `transactions` và `ledgers` không bị ảnh hưởng.
