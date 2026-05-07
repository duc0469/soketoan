/**
 * LEDGERS ROUTES
 * GET /api/ledgers          - Lấy danh sách sổ (filter theo loại, ngày)
 * GET /api/ledgers/summary  - Tổng hợp theo tài khoản
 */

const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ─── GET /api/ledgers ─────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const {
    ledger_type,
    from_date,
    to_date,
    account,
    page = 1,
    limit = 200,
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  let where = [];
  let params = [];

  // Filter theo loại sổ:
  // - SO_CAI: Hiển thị TẤT CẢ TRỪ CÔNG NỢ (công nợ có tab riêng)
  // - CONG_NO: Không dùng nữa (đã có tab riêng "Số dư công nợ")
  // - CHI_PHI: Hiển thị tất cả TRỪ công nợ
  // - CHI_PHI_DUOC_TRU: Hiển thị chi phí (TRỪ công nợ) VÀ debit_account bắt đầu bằng 6
  // - TIEN_MAT: Chỉ hiển thị tiền mặt
  if (ledger_type) {
    if (ledger_type === "SO_CAI") {
      // Sổ Cái: hiển thị tất cả TRỪ công nợ
      where.push("l.ledger_type != 'CONG_NO'");
    } else if (ledger_type === "CHI_PHI") {
      // Sổ Chi Phí: hiển thị tất cả TRỪ công nợ
      where.push("l.ledger_type != 'CONG_NO'");
    } else if (ledger_type === "CHI_PHI_DUOC_TRU") {
      // Chi Phí Được Trừ: chi phí (không phải công nợ) VÀ TK Nợ bắt đầu bằng 6
      // VÀ loại bỏ các giao dịch: nộp thuế, ngân hàng nhà nước, kho bạc nhà nước, tạm ứng, chuyển khoản nội bộ
      where.push("l.ledger_type != 'CONG_NO'");
      where.push("l.debit_account LIKE '6%'");
      where.push(
        "(l.description NOT LIKE '%nop thue%' AND l.description NOT LIKE '%ngan hang nha nuoc%' AND l.description NOT LIKE '%kho bac nha nuoc%' AND l.description NOT LIKE '%tam ung%' AND l.description NOT LIKE '%chuyen khoan noi bo%')",
      );
    } else if (ledger_type === "CONG_NO") {
      // Công nợ: không hiển thị ở đây nữa, có tab riêng
      where.push("1 = 0"); // Trả về rỗng
    } else {
      // Các loại khác: filter chính xác
      where.push("l.ledger_type = ?");
      params.push(ledger_type);
    }
  } else {
    // Nếu không có filter, mặc định loại trừ công nợ
    where.push("l.ledger_type != 'CONG_NO'");
  }

  if (from_date) {
    where.push("l.entry_date >= ?");
    params.push(from_date);
  }
  if (to_date) {
    where.push("l.entry_date <= ?");
    params.push(to_date);
  }
  if (account) {
    where.push("(l.debit_account = ? OR l.credit_account = ?)");
    params.push(account, account);
  }

  const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

  const [rows] = await db.query(
    `SELECT l.*, t.upload_batch, t.is_manual
     FROM ledgers l
     JOIN transactions t ON l.transaction_id = t.id
     ${whereClause}
     ORDER BY l.entry_date, l.id
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset],
  );

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) as total FROM ledgers l ${whereClause}`,
    params,
  );

  res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
});

// ─── GET /api/ledgers/summary ─────────────────────────────────────────────────
router.get("/summary", async (req, res) => {
  const { ledger_type, from_date, to_date } = req.query;
  let where = [];
  let params = [];

  // Apply ledger_type filter giống như GET /api/ledgers
  if (ledger_type) {
    if (ledger_type === "SO_CAI") {
      // Sổ Cái: tất cả TRỪ công nợ
      where.push("ledger_type != 'CONG_NO'");
    } else if (ledger_type === "CHI_PHI") {
      // Sổ Chi Phí: tất cả trừ công nợ
      where.push("ledger_type != 'CONG_NO'");
    } else if (ledger_type === "CHI_PHI_DUOC_TRU") {
      // Chi Phí Được Trừ: chi phí (không phải công nợ) VÀ TK Nợ bắt đầu bằng 6
      // VÀ loại bỏ các giao dịch: nộp thuế, ngân hàng nhà nước, kho bạc nhà nước, tạm ứng, chuyển khoản nội bộ
      where.push("ledger_type != 'CONG_NO'");
      where.push("debit_account LIKE '6%'");
      where.push(
        "(description NOT LIKE '%nop thue%' AND description NOT LIKE '%ngan hang nha nuoc%' AND description NOT LIKE '%kho bac nha nuoc%' AND description NOT LIKE '%tam ung%' AND description NOT LIKE '%chuyen khoan noi bo%')",
      );
    } else if (ledger_type === "CONG_NO") {
      // Công nợ: không hiển thị ở đây nữa
      where.push("1 = 0"); // Trả về rỗng
    } else {
      // Các loại khác
      where.push("ledger_type = ?");
      params.push(ledger_type);
    }
  } else {
    // Nếu không có filter, mặc định loại trừ công nợ
    where.push("ledger_type != 'CONG_NO'");
  }

  if (from_date) {
    where.push("entry_date >= ?");
    params.push(from_date);
  }
  if (to_date) {
    where.push("entry_date <= ?");
    params.push(to_date);
  }

  const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

  // Tổng hợp theo loại sổ
  const [byType] = await db.query(
    `SELECT ledger_type,
            COUNT(*)        as count,
            SUM(ABS(amount)) as total_amount
     FROM ledgers ${whereClause}
     GROUP BY ledger_type`,
    params,
  );

  // Tổng hợp theo tài khoản nợ
  const [byDebit] = await db.query(
    `SELECT debit_account as account,
            'NO'          as side,
            COUNT(*)      as count,
            SUM(ABS(amount)) as total_amount
     FROM ledgers ${whereClause}
     GROUP BY debit_account`,
    params,
  );

  // Tổng hợp theo tài khoản có
  const [byCredit] = await db.query(
    `SELECT credit_account as account,
            'CO'           as side,
            COUNT(*)       as count,
            SUM(ABS(amount)) as total_amount
     FROM ledgers ${whereClause}
     GROUP BY credit_account`,
    params,
  );

  res.json({ by_type: byType, by_debit: byDebit, by_credit: byCredit });
});

module.exports = router;
