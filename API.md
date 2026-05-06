# 📡 API Documentation

Base URL: `http://localhost:5000/api`

## 🔹 Upload

### POST /upload

Upload và parse file sao kê

**Request:**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (PDF/CSV/XLSX/XLS, max 20MB)

**Response:**

```json
{
  "batch_id": "uuid-string",
  "file_name": "sao-ke.xlsx",
  "total_rows": 15,
  "transactions": [
    {
      "id": 1,
      "upload_batch": "uuid-string",
      "trans_date": "2026-05-01",
      "description": "LUONG THANG 4 NHAN VIEN",
      "amount": -15000000,
      "balance": 50000000,
      "ref_no": null,
      "debit_account": "334",
      "credit_account": "112",
      "ledger_type": "CHI_PHI",
      "counterparty": null,
      "customer_code": null,
      "fee_type": null,
      "rule_id": 1,
      "status": "PENDING",
      "is_manual": 0,
      "created_at": "2026-05-06T10:00:00.000Z",
      "updated_at": "2026-05-06T10:00:00.000Z"
    }
  ]
}
```

**Errors:**

- `400`: Không có file được upload
- `422`: Không đọc được dữ liệu từ file
- `413`: File quá lớn (>20MB)

---

## 🔹 Transactions

### GET /transactions

Lấy danh sách giao dịch

**Query Parameters:**

- `batch_id` (optional): UUID của batch
- `status` (optional): `PENDING` | `CONFIRMED` | `REJECTED`
- `ledger_type` (optional): `CHI_PHI` | `SO_CAI` | `CONG_NO` | `TIEN_MAT` | `KHAC`
- `page` (optional, default: 1)
- `limit` (optional, default: 200)

**Response:**

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 200
}
```

---

### GET /transactions/batches

Lấy lịch sử upload

**Response:**

```json
[
  {
    "id": 1,
    "batch_id": "uuid-string",
    "file_name": "sao-ke.xlsx",
    "file_type": "xlsx",
    "total_rows": 15,
    "parsed_rows": 15,
    "status": "DONE",
    "created_at": "2026-05-06T10:00:00.000Z"
  }
]
```

---

### PUT /transactions/:id

Cập nhật giao dịch (chỉnh sửa thủ công)

**Request:**

```json
{
  "debit_account": "642",
  "credit_account": "112",
  "ledger_type": "CHI_PHI",
  "counterparty": "CONG TY ABC",
  "customer_code": "KH001234",
  "fee_type": "PHI CHUYEN TIEN",
  "description": "...",
  "amount": -1000000,
  "trans_date": "2026-05-01"
}
```

**Response:**

```json
{
  "id": 1,
  "debit_account": "642",
  "credit_account": "112",
  ...
}
```

**Errors:**

- `404`: Không tìm thấy giao dịch
- `400`: Giao dịch đã xác nhận, không thể sửa

---

### POST /transactions/confirm

Xác nhận giao dịch (bulk)

**Request:**

```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

hoặc

```json
{
  "batch_id": "uuid-string"
}
```

**Response:**

```json
{
  "confirmed": 5,
  "message": "Đã xác nhận 5 giao dịch"
}
```

**Errors:**

- `400`: Cần truyền ids hoặc batch_id

---

### DELETE /transactions/:id

Xóa giao dịch

**Response:**

```json
{
  "message": "Đã xóa giao dịch"
}
```

**Errors:**

- `404`: Không tìm thấy giao dịch

---

## 🔹 Ledgers

### GET /ledgers

Lấy danh sách sổ kế toán

**Query Parameters:**

- `ledger_type` (optional): `CHI_PHI` | `SO_CAI` | `CONG_NO` | `TIEN_MAT` | `KHAC`
- `from_date` (optional): `YYYY-MM-DD`
- `to_date` (optional): `YYYY-MM-DD`
- `account` (optional): Số tài khoản (tìm trong cả Nợ và Có)
- `page` (optional, default: 1)
- `limit` (optional, default: 200)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "transaction_id": 1,
      "ledger_type": "CHI_PHI",
      "entry_date": "2026-05-01",
      "description": "LUONG THANG 4",
      "debit_account": "334",
      "credit_account": "112",
      "amount": -15000000,
      "counterparty": null,
      "customer_code": null,
      "ref_no": null,
      "confirmed_at": "2026-05-06T10:00:00.000Z",
      "upload_batch": "uuid-string",
      "is_manual": 0
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 200
}
```

---

### GET /ledgers/summary

Tổng hợp sổ kế toán

**Query Parameters:**

- `from_date` (optional): `YYYY-MM-DD`
- `to_date` (optional): `YYYY-MM-DD`

**Response:**

```json
{
  "by_type": [
    {
      "ledger_type": "CHI_PHI",
      "count": 10,
      "total_amount": 25000000
    },
    {
      "ledger_type": "CONG_NO",
      "count": 5,
      "total_amount": 50000000
    }
  ],
  "by_debit": [
    {
      "account": "334",
      "side": "NO",
      "count": 3,
      "total_amount": 15000000
    },
    {
      "account": "642",
      "side": "NO",
      "count": 7,
      "total_amount": 10000000
    }
  ],
  "by_credit": [
    {
      "account": "112",
      "side": "CO",
      "count": 15,
      "total_amount": 75000000
    },
    {
      "account": "131",
      "side": "CO",
      "count": 5,
      "total_amount": 50000000
    }
  ]
}
```

---

## 🔹 Rules

### GET /rules

Lấy danh sách rules

**Response:**

```json
[
  {
    "id": 1,
    "rule_name": "Lương nhân viên",
    "keywords": "LUONG|SALARY|THU LAO",
    "debit_account": "334",
    "credit_account": "112",
    "ledger_type": "CHI_PHI",
    "amount_sign": "NEGATIVE",
    "priority": 1,
    "is_active": 1,
    "created_at": "2026-05-06T10:00:00.000Z"
  }
]
```

---

### POST /rules

Tạo rule mới

**Request:**

```json
{
  "rule_name": "Mua văn phòng phẩm",
  "keywords": "VAN PHONG PHAM|VPP|MUA VAN PHONG",
  "debit_account": "642",
  "credit_account": "112",
  "ledger_type": "CHI_PHI",
  "amount_sign": "NEGATIVE",
  "priority": 10
}
```

**Response:**

```json
{
  "id": 14,
  "rule_name": "Mua văn phòng phẩm",
  ...
}
```

**Errors:**

- `400`: Thiếu thông tin bắt buộc

---

### PUT /rules/:id

Cập nhật rule

**Request:**

```json
{
  "rule_name": "Mua văn phòng phẩm (updated)",
  "keywords": "VAN PHONG PHAM|VPP",
  "priority": 5,
  "is_active": 1
}
```

**Response:**

```json
{
  "id": 14,
  "rule_name": "Mua văn phòng phẩm (updated)",
  ...
}
```

---

### DELETE /rules/:id

Xóa rule

**Response:**

```json
{
  "message": "Đã xóa rule"
}
```

---

## 🔹 Health Check

### GET /health

Kiểm tra trạng thái server

**Response:**

```json
{
  "status": "ok",
  "time": "2026-05-06T10:00:00.000Z"
}
```

---

## 📌 Error Responses

Tất cả errors đều có format:

```json
{
  "error": "Mô tả lỗi"
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (thiếu dữ liệu, validation fail)
- `404`: Not Found
- `413`: Payload Too Large (file quá lớn)
- `422`: Unprocessable Entity (không parse được file)
- `500`: Internal Server Error

---

## 🔐 Authentication

Hiện tại API **không có authentication**. Trong production, nên thêm:

- JWT tokens
- API keys
- Rate limiting
- CORS restrictions

---

## 📊 Rate Limits

Hiện tại **không có rate limit**. Khuyến nghị cho production:

- Upload: 10 requests/minute
- Other endpoints: 100 requests/minute

---

## 🧪 Testing với cURL

### Upload file

```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@sao-ke.xlsx"
```

### Get transactions

```bash
curl http://localhost:5000/api/transactions?status=PENDING
```

### Update transaction

```bash
curl -X PUT http://localhost:5000/api/transactions/1 \
  -H "Content-Type: application/json" \
  -d '{"debit_account":"642","credit_account":"112"}'
```

### Confirm transactions

```bash
curl -X POST http://localhost:5000/api/transactions/confirm \
  -H "Content-Type: application/json" \
  -d '{"ids":[1,2,3]}'
```

### Get ledgers

```bash
curl "http://localhost:5000/api/ledgers?from_date=2026-05-01&to_date=2026-05-31"
```

### Create rule

```bash
curl -X POST http://localhost:5000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "rule_name":"Test Rule",
    "keywords":"TEST|DEMO",
    "debit_account":"642",
    "credit_account":"112",
    "ledger_type":"CHI_PHI"
  }'
```

---

## 🧪 Testing với Postman

Import collection:

```json
{
  "info": {
    "name": "Accounting API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload File",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/upload",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/file.xlsx"
            }
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    }
  ]
}
```

---

**Last updated**: 2026-05-06
