# 📁 Sample Data - File Mẫu

Thư mục này chứa các file mẫu để test hệ thống.

## Cách tạo file Excel mẫu

### File: sao-ke-mau.xlsx

Tạo file Excel với các cột sau:

| Cột | Tên cột  | Ví dụ                   |
| --- | -------- | ----------------------- |
| A   | Ngày     | 01/05/2026              |
| B   | Nội dung | LUONG THANG 4 NHAN VIEN |
| C   | Số tiền  | -15000000               |
| D   | Số dư    | 50000000                |

### Dữ liệu mẫu

```
Ngày       | Nội dung                                    | Số tiền      | Số dư
-----------|---------------------------------------------|--------------|------------
01/05/2026 | LUONG THANG 4 NHAN VIEN NGUYEN VAN A       | -15,000,000  | 50,000,000
02/05/2026 | THU TIEN KHACH HANG KH001234 THANG 4       | 20,000,000   | 70,000,000
03/05/2026 | THANH TOAN TIEN DIEN THANG 4 EVN           | -2,000,000   | 68,000,000
04/05/2026 | THANH TOAN TIEN NUOC THANG 4               | -500,000     | 67,500,000
05/05/2026 | PHI CHUYEN TIEN NHANH 24/7                 | -5,500       | 67,494,500
06/05/2026 | THANH TOAN INTERNET VNPT THANG 4           | -300,000     | 67,194,500
07/05/2026 | THANH TOAN NCC ABC CONG TY HOA DON 123     | -10,000,000  | 57,194,500
08/05/2026 | RUT TIEN MAT TAI ATM                       | -5,000,000   | 52,194,500
10/05/2026 | THU TIEN KHACH HANG KH005678               | 15,000,000   | 67,194,500
12/05/2026 | THANH TOAN THUE GTGT THANG 4 KHO BAC       | -3,000,000   | 64,194,500
15/05/2026 | NOP BHXH BHYT THANG 4                      | -2,500,000   | 61,694,500
18/05/2026 | MUA VAN PHONG PHAM CHO VAN PHONG           | -800,000     | 60,894,500
20/05/2026 | THANH TOAN XANG DAU DI LAI CONG TAC        | -1,200,000   | 59,694,500
22/05/2026 | LAI TIEN GUI THANG 4                       | 150,000      | 59,844,500
25/05/2026 | THANH TOAN THUE TNCN THANG 4               | -1,000,000   | 58,844,500
28/05/2026 | THU HO CHO NCC XYZ CONG TY                 | -8,000,000   | 50,844,500
29/05/2026 | THANH TOAN HO CHI PHI DIEN NUOC CHO KH001234 | -1,500,000   | 49,344,500
30/05/2026 | PHI DICH VU NGAN HANG THANG 4              | -50,000      | 49,294,500
```

## Kết quả phân loại mong đợi

| Nội dung                 | TK Nợ | TK Có | Loại sổ  | Ghi chú                          |
| ------------------------ | ----- | ----- | -------- | -------------------------------- |
| LUONG...                 | 334   | 112   | CHI_PHI  | Lương nhân viên                  |
| THU TIEN KH...           | 112   | 131   | CONG_NO  | Thu công nợ KH                   |
| THANH TOAN TIEN DIEN...  | 642   | 112   | CHI_PHI  | Chi phí điện                     |
| THANH TOAN TIEN NUOC...  | 642   | 112   | CHI_PHI  | Chi phí nước                     |
| PHI CHUYEN TIEN...       | 642   | 112   | CHI_PHI  | Phí ngân hàng                    |
| THANH TOAN INTERNET...   | 642   | 112   | CHI_PHI  | Chi phí internet                 |
| THANH TOAN NCC...        | 331   | 112   | CONG_NO  | Trả công nợ NCC                  |
| RUT TIEN MAT...          | 111   | 112   | TIEN_MAT | Rút tiền mặt                     |
| THU TIEN KHACH HANG...   | 112   | 131   | CONG_NO  | Thu công nợ KH                   |
| THANH TOAN THUE GTGT...  | 333   | 112   | CHI_PHI  | Nộp thuế                         |
| NOP BHXH BHYT...         | 338   | 112   | CHI_PHI  | Bảo hiểm                         |
| MUA VAN PHONG PHAM...    | 642   | 112   | CHI_PHI  | VPP                              |
| THANH TOAN XANG DAU...   | 642   | 112   | CHI_PHI  | Xăng dầu                         |
| LAI TIEN GUI...          | 112   | 515   | SO_CAI   | Lãi tiền gửi                     |
| THANH TOAN THUE TNCN...  | 333   | 112   | CHI_PHI  | Thuế TNCN                        |
| THU HO CHO NCC...        | 331   | 112   | CONG_NO  | Thu hộ NCC                       |
| THANH TOAN HO CHI PHI... | 131   | 112   | CONG_NO  | Chi hộ KH (tạo công nợ phải thu) |
| PHI DICH VU...           | 642   | 112   | CHI_PHI  | Phí dịch vụ                      |

## Bóc tách thông tin

Hệ thống sẽ tự động bóc tách:

### Mã khách hàng

- `KH001234` từ "THU TIEN KHACH HANG KH001234"
- `KH005678` từ "THU TIEN KHACH HANG KH005678"

### Đối tượng công nợ

- `ABC CONG TY` từ "THANH TOAN NCC ABC CONG TY"
- `XYZ CONG TY` từ "THU HO CHO NCC XYZ CONG TY"

### Loại phí

- `PHI CHUYEN TIEN` từ "PHI CHUYEN TIEN NHANH 24/7"
- `PHI DICH VU` từ "PHI DICH VU NGAN HANG"
- `LAI TIEN GUI` từ "LAI TIEN GUI THANG 4"
- `THUE GTGT` từ "THANH TOAN THUE GTGT"
- `BHXH` từ "NOP BHXH BHYT"

## Lưu ý

1. **Nội dung phải viết HOA không dấu**:
   - ✅ `LUONG THANG 4`
   - ❌ `Lương tháng 4`

2. **Số tiền âm = Chi, dương = Thu**:
   - `-15000000` = Chi 15 triệu
   - `20000000` = Thu 20 triệu

3. **Format ngày**: `dd/mm/yyyy` hoặc `dd-mm-yyyy`

4. **Số tiền có thể có dấu phân cách**:
   - `15,000,000` hoặc `15000000` đều được

## Test Cases

### Test 1: Upload file cơ bản

1. Tạo file Excel với 5-10 dòng
2. Upload qua giao diện
3. Kiểm tra phân loại tự động

### Test 2: Chỉnh sửa thủ công

1. Upload file
2. Click ✏️ để sửa TK Nợ/Có
3. Lưu và kiểm tra

### Test 3: Xác nhận hàng loạt

1. Upload file
2. Tick chọn nhiều dòng
3. Click "Xác nhận"
4. Kiểm tra tab "Sổ kế toán"

### Test 4: Tạo rule mới

1. Vào tab "Rules"
2. Tạo rule cho "MUA HANG HOA"
3. Upload file có nội dung "MUA HANG HOA"
4. Kiểm tra phân loại

## File CSV mẫu

Tạo file `sao-ke-mau.csv`:

```csv
Ngày,Nội dung,Số tiền,Số dư
01/05/2026,LUONG THANG 4 NHAN VIEN,-15000000,50000000
02/05/2026,THU TIEN KHACH HANG KH001234,20000000,70000000
03/05/2026,THANH TOAN TIEN DIEN EVN,-2000000,68000000
```

## File PDF mẫu

Để tạo file PDF mẫu:

1. Tạo file Excel như trên
2. Export/Save as PDF
3. Hoặc dùng Word tạo bảng rồi export PDF

---

**Lưu ý**: Các file mẫu này chỉ để test. Trong thực tế, bạn sẽ upload file sao kê thật từ ngân hàng.
