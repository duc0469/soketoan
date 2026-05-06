/**
 * TRANSACTIONS ROUTES
 * GET    /api/transactions          - Lấy danh sách (filter theo batch, status)
 * PUT    /api/transactions/:id      - Cập nhật 1 giao dịch (chỉnh sửa tay)
 * POST   /api/transactions/confirm  - Xác nhận hàng loạt -> đổ vào ledgers
 * DELETE /api/transactions/:id      - Xóa 1 giao dịch
 * GET    /api/transactions/batches  - Lịch sử upload
 */

const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ─── GET /api/transactions ────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const { batch_id, status, ledger_type, page = 1, limit = 200 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = [];

  if (batch_id) {
    where.push("upload_batch = ?");
    params.push(batch_id);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (ledger_type) {
    where.push("ledger_type = ?");
    params.push(ledger_type);
  }

  const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

  const [rows] = await db.query(
    `SELECT * FROM transactions ${whereClause} ORDER BY trans_date, id LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset],
  );

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) as total FROM transactions ${whereClause}`,
    params,
  );

  res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
});

// ─── GET /api/transactions/batches ───────────────────────────────────────────
router.get("/batches", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM upload_batches ORDER BY created_at DESC LIMIT 50",
  );
  res.json(rows);
});

// ─── PUT /api/transactions/:id ────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    debit_account,
    credit_account,
    ledger_type,
    fee_type,
    description,
    amount,
    trans_date,
  } = req.body;

  const [existing] = await db.query("SELECT * FROM transactions WHERE id = ?", [
    id,
  ]);
  if (!existing.length)
    return res.status(404).json({ error: "Không tìm thấy giao dịch" });
  if (existing[0].status === "CONFIRMED") {
    return res
      .status(400)
      .json({ error: "Giao dịch đã xác nhận, không thể sửa" });
  }

  await db.query(
    `UPDATE transactions SET
      debit_account  = COALESCE(?, debit_account),
      credit_account = COALESCE(?, credit_account),
      ledger_type    = COALESCE(?, ledger_type),
      fee_type       = COALESCE(?, fee_type),
      description    = COALESCE(?, description),
      amount         = COALESCE(?, amount),
      trans_date     = COALESCE(?, trans_date),
      is_manual      = 1,
      updated_at     = NOW()
    WHERE id = ?`,
    [
      debit_account || null,
      credit_account || null,
      ledger_type || null,
      fee_type || null,
      description || null,
      amount !== undefined ? amount : null,
      trans_date || null,
      id,
    ],
  );

  const [[updated]] = await db.query(
    "SELECT * FROM transactions WHERE id = ?",
    [id],
  );
  res.json(updated);
});

// ─── POST /api/transactions/confirm ──────────────────────────────────────────
// Body: { ids: [1,2,3] } hoặc { batch_id: 'uuid' }
router.post("/confirm", async (req, res) => {
  const { ids, batch_id } = req.body;

  let targetIds = [];

  if (ids && Array.isArray(ids) && ids.length > 0) {
    targetIds = ids;
  } else if (batch_id) {
    const [rows] = await db.query(
      "SELECT id FROM transactions WHERE upload_batch = ? AND status = 'PENDING'",
      [batch_id],
    );
    targetIds = rows.map((r) => r.id);
  } else {
    return res.status(400).json({ error: "Cần truyền ids hoặc batch_id" });
  }

  if (targetIds.length === 0) {
    return res.json({
      confirmed: 0,
      message: "Không có giao dịch nào để xác nhận",
    });
  }

  // Lấy dữ liệu các giao dịch cần xác nhận
  const [transactions] = await db.query(
    `SELECT * FROM transactions WHERE id IN (?) AND status = 'PENDING'`,
    [targetIds],
  );

  if (transactions.length === 0) {
    return res.json({
      confirmed: 0,
      message: "Không có giao dịch PENDING nào",
    });
  }

  // Bulk insert vào ledgers
  const ledgerValues = transactions.map((t) => [
    t.id,
    t.ledger_type,
    t.trans_date,
    t.description,
    t.debit_account || "999",
    t.credit_account || "999",
    t.amount,
    t.ref_no || null,
  ]);

  await db.query(
    `INSERT INTO ledgers
      (transaction_id, ledger_type, entry_date, description,
       debit_account, credit_account, amount, ref_no)
     VALUES ?`,
    [ledgerValues],
  );

  // Cập nhật status -> CONFIRMED
  await db.query(
    `UPDATE transactions SET status = 'CONFIRMED', updated_at = NOW() WHERE id IN (?)`,
    [targetIds],
  );

  res.json({
    confirmed: transactions.length,
    message: `Đã xác nhận ${transactions.length} giao dịch`,
  });
});

// ─── DELETE /api/transactions/:id ────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const [existing] = await db.query("SELECT * FROM transactions WHERE id = ?", [
    id,
  ]);
  if (!existing.length)
    return res.status(404).json({ error: "Không tìm thấy giao dịch" });

  await db.query("DELETE FROM transactions WHERE id = ?", [id]);
  res.json({ message: "Đã xóa giao dịch" });
});

module.exports = router;
