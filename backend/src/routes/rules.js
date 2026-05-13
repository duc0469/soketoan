/**
 * RULES ROUTES
 * GET    /api/rules       - Lấy danh sách rules
 * POST   /api/rules       - Tạo rule mới
 * PUT    /api/rules/:id   - Cập nhật rule
 * DELETE /api/rules/:id   - Xóa rule
 */

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { clearRuleCache } = require("../utils/ruleEngine");
const {
  getSuggestions,
  isLikelyTypo,
  getCommonKeywordsByType,
} = require("../utils/spellChecker");

router.get("/", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM accounting_rules ORDER BY priority ASC",
  );
  res.json(rows);
});

// API để kiểm tra gợi ý từ khóa (không cần auth cho test)
router.post("/test-suggestions", async (req, res) => {
  try {
    const { keywords, ledgerType } = req.body;

    if (!keywords) {
      return res.status(400).json({ error: "Thiếu từ khóa để kiểm tra" });
    }

    // Tách các từ khóa (phân cách bởi |)
    const keywordList = keywords
      .split("|")
      .map((k) => k.trim())
      .filter((k) => k);
    const results = [];

    for (const keyword of keywordList) {
      const typoCheck = isLikelyTypo(keyword);
      const suggestions = getSuggestions(keyword);

      results.push({
        original: keyword,
        isLikelyTypo: typoCheck.isTypo,
        suggestions: typoCheck.suggestions,
        allSuggestions: suggestions.map((s) => s.keyword),
      });
    }

    // Lấy từ khóa phổ biến theo loại sổ
    const commonKeywords = ledgerType
      ? getCommonKeywordsByType(ledgerType)
      : [];

    res.json({
      results,
      commonKeywords,
      hasTypos: results.some((r) => r.isLikelyTypo),
    });
  } catch (error) {
    console.error("Error checking suggestions:", error);
    res.status(500).json({ error: "Lỗi khi kiểm tra gợi ý" });
  }
});

// API để kiểm tra gợi ý từ khóa
router.post("/suggestions", async (req, res) => {
  try {
    const { keywords, ledgerType } = req.body;

    if (!keywords) {
      return res.status(400).json({ error: "Thiếu từ khóa để kiểm tra" });
    }

    // Tách các từ khóa (phân cách bởi |)
    const keywordList = keywords
      .split("|")
      .map((k) => k.trim())
      .filter((k) => k);
    const results = [];

    for (const keyword of keywordList) {
      const typoCheck = isLikelyTypo(keyword);
      const suggestions = getSuggestions(keyword);

      results.push({
        original: keyword,
        isLikelyTypo: typoCheck.isTypo,
        suggestions: typoCheck.suggestions,
        allSuggestions: suggestions.map((s) => s.keyword),
      });
    }

    // Lấy từ khóa phổ biến theo loại sổ
    const commonKeywords = ledgerType
      ? getCommonKeywordsByType(ledgerType)
      : [];

    res.json({
      results,
      commonKeywords,
      hasTypos: results.some((r) => r.isLikelyTypo),
    });
  } catch (error) {
    console.error("Error checking suggestions:", error);
    res.status(500).json({ error: "Lỗi khi kiểm tra gợi ý" });
  }
});

// API để lấy từ khóa phổ biến theo loại sổ
router.get("/common-keywords/:ledgerType", async (req, res) => {
  try {
    const { ledgerType } = req.params;
    const keywords = getCommonKeywordsByType(ledgerType);
    res.json({ keywords });
  } catch (error) {
    console.error("Error getting common keywords:", error);
    res.status(500).json({ error: "Lỗi khi lấy từ khóa phổ biến" });
  }
});

router.post("/", async (req, res) => {
  const {
    rule_name,
    keywords,
    debit_account,
    credit_account,
    ledger_type,
    amount_sign,
    priority,
  } = req.body;
  if (
    !rule_name ||
    !keywords ||
    !debit_account ||
    !credit_account ||
    !ledger_type
  ) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  const newPriority = priority || 10;

  // Sử dụng transaction để đảm bảo tính nhất quán
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Đẩy các rule có priority >= newPriority xuống 1 bậc
    await connection.query(
      "UPDATE accounting_rules SET priority = priority + 1 WHERE priority >= ?",
      [newPriority],
    );

    // Thêm rule mới với priority đã chọn
    const [result] = await connection.query(
      `INSERT INTO accounting_rules
        (rule_name, keywords, debit_account, credit_account, ledger_type, amount_sign, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        rule_name,
        keywords.toUpperCase(),
        debit_account,
        credit_account,
        ledger_type,
        amount_sign || "ANY",
        newPriority,
      ],
    );

    await connection.commit();

    clearRuleCache();
    const [[created]] = await db.query(
      "SELECT * FROM accounting_rules WHERE id = ?",
      [result.insertId],
    );
    res.status(201).json(created);
  } catch (error) {
    await connection.rollback();
    console.error("Error creating rule:", error);
    res.status(500).json({ error: "Lỗi khi tạo rule mới" });
  } finally {
    connection.release();
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    rule_name,
    keywords,
    debit_account,
    credit_account,
    ledger_type,
    amount_sign,
    priority,
    is_active,
  } = req.body;

  // Sử dụng transaction để đảm bảo tính nhất quán
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Nếu thay đổi priority, cần xử lý đẩy các rule khác
    if (priority !== undefined) {
      // Lấy priority hiện tại của rule này
      const [[currentRule]] = await connection.query(
        "SELECT priority FROM accounting_rules WHERE id = ?",
        [id],
      );

      if (currentRule && currentRule.priority !== priority) {
        const oldPriority = currentRule.priority;
        const newPriority = priority;

        if (newPriority < oldPriority) {
          // Di chuyển lên (priority giảm)
          // Đẩy các rule từ newPriority đến oldPriority-1 xuống 1 bậc
          await connection.query(
            "UPDATE accounting_rules SET priority = priority + 1 WHERE priority >= ? AND priority < ? AND id != ?",
            [newPriority, oldPriority, id],
          );
        } else if (newPriority > oldPriority) {
          // Di chuyển xuống (priority tăng)
          // Kéo các rule từ oldPriority+1 đến newPriority lên 1 bậc
          await connection.query(
            "UPDATE accounting_rules SET priority = priority - 1 WHERE priority > ? AND priority <= ? AND id != ?",
            [oldPriority, newPriority, id],
          );
        }
      }
    }

    // Cập nhật rule
    await connection.query(
      `UPDATE accounting_rules SET
        rule_name      = COALESCE(?, rule_name),
        keywords       = COALESCE(?, keywords),
        debit_account  = COALESCE(?, debit_account),
        credit_account = COALESCE(?, credit_account),
        ledger_type    = COALESCE(?, ledger_type),
        amount_sign    = COALESCE(?, amount_sign),
        priority       = COALESCE(?, priority),
        is_active      = COALESCE(?, is_active)
      WHERE id = ?`,
      [
        rule_name || null,
        keywords ? keywords.toUpperCase() : null,
        debit_account || null,
        credit_account || null,
        ledger_type || null,
        amount_sign || null,
        priority || null,
        is_active !== undefined ? is_active : null,
        id,
      ],
    );

    await connection.commit();

    clearRuleCache();
    const [[updated]] = await db.query(
      "SELECT * FROM accounting_rules WHERE id = ?",
      [id],
    );
    res.json(updated);
  } catch (error) {
    await connection.rollback();
    console.error("Error updating rule:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật rule" });
  } finally {
    connection.release();
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Sử dụng transaction để đảm bảo tính nhất quán
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Lấy priority của rule sắp xóa
    const [[ruleToDelete]] = await connection.query(
      "SELECT priority FROM accounting_rules WHERE id = ?",
      [id],
    );

    if (!ruleToDelete) {
      await connection.rollback();
      return res.status(404).json({ error: "Không tìm thấy rule" });
    }

    const deletedPriority = ruleToDelete.priority;

    // Xóa rule
    await connection.query("DELETE FROM accounting_rules WHERE id = ?", [id]);

    // Kéo các rule có priority > deletedPriority lên 1 bậc
    await connection.query(
      "UPDATE accounting_rules SET priority = priority - 1 WHERE priority > ?",
      [deletedPriority],
    );

    await connection.commit();

    clearRuleCache();
    res.json({ message: "Đã xóa rule và cập nhật thứ tự ưu tiên" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting rule:", error);
    res.status(500).json({ error: "Lỗi khi xóa rule" });
  } finally {
    connection.release();
  }
});

module.exports = router;
