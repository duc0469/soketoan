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
  const {
    batch_id,
    status,
    ledger_type,
    search, // tìm theo nội dung
    amount_min, // lọc theo khoảng tiền
    amount_max,
    debit_account, // lọc theo TK Nợ
    credit_account, // lọc theo TK Có
    partner_name, // lọc theo đối tác
    no_rule, // chỉ hiện giao dịch chưa khớp rule
    page = 1,
    limit = 200,
  } = req.query;
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
  if (search) {
    where.push("description LIKE ?");
    params.push(`%${search}%`);
  }
  if (amount_min) {
    where.push("ABS(amount) >= ?");
    params.push(parseFloat(amount_min));
  }
  if (amount_max) {
    where.push("ABS(amount) <= ?");
    params.push(parseFloat(amount_max));
  }
  if (debit_account) {
    where.push("debit_account = ?");
    params.push(debit_account);
  }
  if (credit_account) {
    where.push("credit_account = ?");
    params.push(credit_account);
  }
  if (partner_name) {
    where.push("partner_name LIKE ?");
    params.push(`%${partner_name}%`);
  }
  if (no_rule === "1") {
    where.push("rule_id IS NULL");
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
    note,
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

  const old = existing[0];

  await db.query(
    `UPDATE transactions SET
      debit_account  = COALESCE(?, debit_account),
      credit_account = COALESCE(?, credit_account),
      ledger_type    = COALESCE(?, ledger_type),
      fee_type       = COALESCE(?, fee_type),
      description    = COALESCE(?, description),
      amount         = COALESCE(?, amount),
      trans_date     = COALESCE(?, trans_date),
      note           = COALESCE(?, note),
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
      note !== undefined ? note : null,
      id,
    ],
  );

  // Ghi audit log cho các trường thay đổi
  const trackFields = { debit_account, credit_account, ledger_type, note };
  const logValues = [];
  for (const [field, newVal] of Object.entries(trackFields)) {
    if (
      newVal !== undefined &&
      newVal !== null &&
      String(newVal) !== String(old[field] || "")
    ) {
      logValues.push([id, field, old[field] || null, newVal]);
    }
  }
  if (logValues.length > 0) {
    await db.query(
      "INSERT INTO transaction_logs (transaction_id, field_changed, old_value, new_value) VALUES ?",
      [logValues],
    );
  }

  const [[updated]] = await db.query(
    "SELECT * FROM transactions WHERE id = ?",
    [id],
  );
  res.json(updated);
});

// ─── GET /api/transactions/:id/logs ──────────────────────────────────────────
router.get("/:id/logs", async (req, res) => {
  const { id } = req.params;
  const [logs] = await db.query(
    "SELECT * FROM transaction_logs WHERE transaction_id = ? ORDER BY changed_at DESC",
    [id],
  );
  res.json(logs);
});

// ─── POST /api/transactions/suggest-rule ─────────────────────────────────────
// Smart rule suggestion: gợi ý tạo rule từ giao dịch đã sửa tay
router.post("/suggest-rule", async (req, res) => {
  const { transaction_id } = req.body;
  if (!transaction_id)
    return res.status(400).json({ error: "Thiếu transaction_id" });

  const [[t]] = await db.query("SELECT * FROM transactions WHERE id = ?", [
    transaction_id,
  ]);
  if (!t) return res.status(404).json({ error: "Không tìm thấy giao dịch" });

  // Lấy 3 từ đầu của nội dung làm keyword gợi ý
  const words = t.description.split(/\s+/).slice(0, 3).join(" ");

  // Lấy priority tiếp theo
  const [[{ maxPriority }]] = await db.query(
    "SELECT MAX(priority) as maxPriority FROM accounting_rules",
  );

  res.json({
    suggested_rule: {
      rule_name: `Rule từ: ${words}`,
      keywords: words,
      debit_account: t.debit_account || "",
      credit_account: t.credit_account || "112",
      ledger_type: t.ledger_type || "CHI_PHI",
      amount_sign:
        t.amount > 0 ? "POSITIVE" : t.amount < 0 ? "NEGATIVE" : "ANY",
      priority: (maxPriority || 15) + 1,
    },
  });
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
    t.partner_name || null,
    t.note || null,
  ]);

  await db.query(
    `INSERT INTO ledgers
      (transaction_id, ledger_type, entry_date, description,
       debit_account, credit_account, amount, ref_no, partner_name, note)
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
