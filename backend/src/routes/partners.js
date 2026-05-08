/**
 * PARTNERS ROUTES
 * GET    /api/partners           - Danh sách đối tác
 * POST   /api/partners           - Tạo đối tác mới
 * PUT    /api/partners/:id       - Cập nhật đối tác
 * DELETE /api/partners/:id       - Xóa đối tác
 * GET    /api/partners/ledger    - Sổ chi tiết theo đối tác
 * GET    /api/partners/balance   - Số dư công nợ theo đối tác
 */

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { clearRuleCache, matchPartner } = require("../utils/ruleEngine");

// ─── GET /api/partners ────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM partners ORDER BY partner_name ASC",
  );
  res.json(rows);
});

// ─── POST /api/partners/test ──────────────────────────────────────────────────
// Test partner matching với description
router.post("/test", async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Thiếu nội dung giao dịch" });
  }

  try {
    const partner_name = await matchPartner(description);
    res.json({
      description: description.toUpperCase(),
      matched_partner: partner_name,
      success: !!partner_name,
    });
  } catch (error) {
    console.error("[PARTNER TEST ERROR]", error);
    res.status(500).json({ error: "Lỗi khi test partner matching" });
  }
});

// ─── POST /api/partners ───────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { partner_name, keywords, default_account, partner_type } = req.body;
  if (!partner_name || !keywords) {
    return res.status(400).json({ error: "Thiếu tên đối tác hoặc từ khóa" });
  }
  const [result] = await db.query(
    `INSERT INTO partners (partner_name, keywords, default_account, partner_type)
     VALUES (?, ?, ?, ?)`,
    [
      partner_name,
      keywords.toUpperCase(),
      default_account || null,
      partner_type || "KHAC",
    ],
  );
  const [[created]] = await db.query("SELECT * FROM partners WHERE id = ?", [
    result.insertId,
  ]);

  // Clear cache để load partners mới
  clearRuleCache();

  res.status(201).json(created);
});

// ─── PUT /api/partners/:id ────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { partner_name, keywords, default_account, partner_type, is_active } =
    req.body;
  await db.query(
    `UPDATE partners SET
      partner_name    = COALESCE(?, partner_name),
      keywords        = COALESCE(?, keywords),
      default_account = COALESCE(?, default_account),
      partner_type    = COALESCE(?, partner_type),
      is_active       = COALESCE(?, is_active)
     WHERE id = ?`,
    [
      partner_name || null,
      keywords ? keywords.toUpperCase() : null,
      default_account || null,
      partner_type || null,
      is_active !== undefined ? is_active : null,
      id,
    ],
  );
  const [[updated]] = await db.query("SELECT * FROM partners WHERE id = ?", [
    id,
  ]);

  // Clear cache để load partners đã update
  clearRuleCache();

  res.json(updated);
});

// ─── DELETE /api/partners/:id ─────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const [existing] = await db.query("SELECT id FROM partners WHERE id = ?", [
    id,
  ]);
  if (!existing.length)
    return res.status(404).json({ error: "Không tìm thấy đối tác" });
  await db.query("DELETE FROM partners WHERE id = ?", [id]);

  // Clear cache để xóa partner khỏi cache
  clearRuleCache();

  res.json({ message: "Đã xóa đối tác" });
});

// ─── GET /api/partners/ledger ─────────────────────────────────────────────────
// Sổ chi tiết theo từng đối tác (CHỈ GIAO DỊCH CÔNG NỢ)
router.get("/ledger", async (req, res) => {
  const { partner_name, from_date, to_date } = req.query;

  let where = [
    "l.partner_name IS NOT NULL AND l.partner_name != ''",
    "l.ledger_type = 'CONG_NO'", // Chỉ lấy giao dịch công nợ
  ];
  let params = [];

  if (partner_name) {
    where.push("l.partner_name LIKE ?");
    params.push(`%${partner_name}%`);
  }
  if (from_date) {
    where.push("l.entry_date >= ?");
    params.push(from_date);
  }
  if (to_date) {
    where.push("l.entry_date <= ?");
    params.push(to_date);
  }

  const whereClause = "WHERE " + where.join(" AND ");

  const [rows] = await db.query(
    `SELECT l.*, t.is_manual
     FROM ledgers l
     JOIN transactions t ON l.transaction_id = t.id
     ${whereClause}
     ORDER BY l.partner_name, l.entry_date, l.id`,
    params,
  );

  // Nhóm theo partner_name
  const grouped = {};
  for (const row of rows) {
    const name = row.partner_name;
    if (!grouped[name]) {
      grouped[name] = {
        partner_name: name,
        transactions: [],
        total_in: 0,
        total_out: 0,
      };
    }
    grouped[name].transactions.push(row);
    if (row.amount > 0) grouped[name].total_in += parseFloat(row.amount);
    else grouped[name].total_out += Math.abs(parseFloat(row.amount));
  }

  // Tính số dư
  const result = Object.values(grouped).map((g) => ({
    ...g,
    balance: g.total_in - g.total_out,
  }));

  res.json(result);
});

// ─── GET /api/partners/balance ────────────────────────────────────────────────
// Tổng hợp số dư công nợ theo từng đối tác (CHỈ LOẠI SỔ CÔNG NỢ)
router.get("/balance", async (req, res) => {
  const { from_date, to_date } = req.query;

  let where = [
    "l.partner_name IS NOT NULL AND l.partner_name != ''",
    "l.ledger_type = 'CONG_NO'", // Chỉ lấy giao dịch công nợ
  ];
  let params = [];

  if (from_date) {
    where.push("l.entry_date >= ?");
    params.push(from_date);
  }
  if (to_date) {
    where.push("l.entry_date <= ?");
    params.push(to_date);
  }

  const whereClause = "WHERE " + where.join(" AND ");

  const [rows] = await db.query(
    `SELECT
       l.partner_name,
       COUNT(*)                                          AS transaction_count,
       SUM(CASE WHEN l.amount > 0 THEN l.amount ELSE 0 END)          AS total_in,
       SUM(CASE WHEN l.amount < 0 THEN ABS(l.amount) ELSE 0 END)     AS total_out,
       SUM(l.amount)                                                   AS balance
     FROM ledgers l
     ${whereClause}
     GROUP BY l.partner_name
     ORDER BY ABS(SUM(l.amount)) DESC`,
    params,
  );

  res.json(rows);
});

// ─── GET /api/partners/transactions ───────────────────────────────────────────
// Danh sách chi tiết từng giao dịch công nợ (không tổng hợp theo đối tác)
router.get("/transactions", async (req, res) => {
  const { from_date, to_date, partner_name } = req.query;

  let where = [
    "l.ledger_type = 'CONG_NO'", // Chỉ lấy giao dịch có gắn mác sổ công nợ
  ];
  let params = [];

  if (from_date) {
    where.push("l.entry_date >= ?");
    params.push(from_date);
  }
  if (to_date) {
    where.push("l.entry_date <= ?");
    params.push(to_date);
  }
  if (partner_name) {
    where.push("l.partner_name LIKE ?");
    params.push(`%${partner_name}%`);
  }

  const whereClause = "WHERE " + where.join(" AND ");

  const [rows] = await db.query(
    `SELECT l.*, t.is_manual, t.upload_batch
     FROM ledgers l
     JOIN transactions t ON l.transaction_id = t.id
     ${whereClause}
     ORDER BY l.entry_date DESC, l.id DESC`,
    params,
  );

  res.json(rows);
});

// ─── POST /api/partners/clear-cache ───────────────────────────────────────────
// Force clear cache (for debugging)
router.post("/clear-cache", async (req, res) => {
  clearRuleCache();
  res.json({ message: "Cache cleared successfully" });
});

module.exports = router;
