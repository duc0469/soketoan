/**
 * RULE ENGINE
 * Tự động phân loại giao dịch dựa trên:
 * 1. Rules từ database (accounting_rules)
 * 2. Partner mapping từ database (partners)
 * 3. Fallback rules cứng (hardcoded)
 *
 * Nội dung giao dịch là CHỮ IN HOA không dấu.
 */

const db = require("../config/db");

// ─── Bóc tách thông tin từ nội dung giao dịch ────────────────────────────────

/**
 * Bóc tách loại phí từ nội dung.
 * Ví dụ: "PHI CHUYEN TIEN NHANH 24/7" -> "PHI CHUYEN TIEN"
 */
function extractFeeType(description) {
  const feePatterns = [
    { regex: /PHI\s+CHUYEN\s+TIEN/, label: "PHI CHUYEN TIEN" },
    { regex: /PHI\s+DICH\s+VU/, label: "PHI DICH VU" },
    { regex: /PHI\s+SMS/, label: "PHI SMS" },
    { regex: /PHI\s+QUAN\s+LY/, label: "PHI QUAN LY TK" },
    { regex: /PHI\s+RUT\s+TIEN/, label: "PHI RUT TIEN" },
    { regex: /LAI\s+SUAT|LAI\s+TIEN\s+GUI/, label: "LAI TIEN GUI" },
    { regex: /THUE\s+GTGT/, label: "THUE GTGT" },
    { regex: /THUE\s+TNDN/, label: "THUE TNDN" },
    { regex: /THUE\s+TNCN/, label: "THUE TNCN" },
    { regex: /BHXH|BAO\s+HIEM\s+XA\s+HOI/, label: "BHXH" },
    { regex: /BHYT|BAO\s+HIEM\s+Y\s+TE/, label: "BHYT" },
  ];
  for (const { regex, label } of feePatterns) {
    if (regex.test(description)) return label;
  }
  return null;
}

// ─── Load rules từ DB ─────────────────────────────────────────────────────────
let cachedRules = null;
let cachedPartners = null;
let rulesCacheTime = 0;
let partnersCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 phút

async function loadRules() {
  const now = Date.now();
  if (cachedRules && now - rulesCacheTime < CACHE_TTL) return cachedRules;

  const [rows] = await db.query(
    "SELECT * FROM accounting_rules WHERE is_active = 1 ORDER BY priority ASC",
  );
  cachedRules = rows;
  rulesCacheTime = now;
  return rows;
}

async function loadPartners() {
  const now = Date.now();
  if (cachedPartners && now - partnersCacheTime < CACHE_TTL)
    return cachedPartners;

  const [rows] = await db.query(
    "SELECT * FROM partners WHERE is_active = 1 ORDER BY partner_name ASC",
  );
  cachedPartners = rows;
  partnersCacheTime = now;
  return rows;
}

// Xóa cache khi rules hoặc partners thay đổi
function clearRuleCache() {
  cachedRules = null;
  cachedPartners = null;
  rulesCacheTime = 0;
  partnersCacheTime = 0;
}

// ─── Partner Mapping: Nhận diện tên đối tác từ nội dung ─────────────────────
async function matchPartner(description) {
  const partners = await loadPartners();
  const desc = String(description || "").toUpperCase();

  console.log(`[PARTNER MATCH] Checking description: "${desc}"`);
  console.log(`[PARTNER MATCH] Available partners: ${partners.length}`);

  for (const partner of partners) {
    const keywords = partner.keywords
      .split("|")
      .map((k) => k.trim().toUpperCase());

    console.log(
      `[PARTNER MATCH] Partner "${partner.partner_name}" keywords: [${keywords.join(", ")}]`,
    );

    const matched = keywords.some((kw) => kw && desc.includes(kw));
    if (matched) {
      console.log(`[PARTNER MATCH] ✅ MATCHED: "${partner.partner_name}"`);
      return partner.partner_name;
    }
  }

  console.log(`[PARTNER MATCH] ❌ No partner matched`);
  return null;
}

// ─── Áp dụng một rule lên giao dịch ─────────────────────────────────────────
function applyRule(rule, description, amount) {
  // Kiểm tra dấu số tiền
  if (rule.amount_sign === "POSITIVE" && amount <= 0) return false;
  if (rule.amount_sign === "NEGATIVE" && amount >= 0) return false;

  // Kiểm tra từ khóa (OR logic)
  const keywords = rule.keywords.split("|").map((k) => k.trim().toUpperCase());
  return keywords.some((kw) => description.includes(kw));
}

// ─── Phân loại một giao dịch ─────────────────────────────────────────────────
async function classifyTransaction(transaction) {
  const { description, amount } = transaction;
  const desc = String(description || "").toUpperCase();

  const rules = await loadRules();

  let matchedRule = null;
  for (const rule of rules) {
    if (applyRule(rule, desc, amount)) {
      matchedRule = rule;
      break; // Lấy rule ưu tiên cao nhất
    }
  }

  // Partner mapping
  const partner_name = await matchPartner(desc);

  const result = {
    debit_account: null,
    credit_account: null,
    ledger_type: "CHI_PHI", // Mặc định là Chi Phí (các giao dịch không phân loại)
    rule_id: null,
    fee_type: extractFeeType(desc),
    partner_name: partner_name || null,
  };

  if (matchedRule) {
    result.debit_account = matchedRule.debit_account;
    result.credit_account = matchedRule.credit_account;
    result.ledger_type = matchedRule.ledger_type;
    result.rule_id = matchedRule.id;
  } else {
    // Fallback: phân loại cơ bản theo dấu số tiền, gắn vào Sổ Cái
    if (amount > 0) {
      result.debit_account = "112";
      result.credit_account = "131";
    } else {
      result.debit_account = "642";
      result.credit_account = "112";
    }
    // ledger_type đã là SO_CAI từ trước
  }

  return result;
}

// ─── Phân loại hàng loạt ─────────────────────────────────────────────────────
async function classifyBatch(transactions) {
  return Promise.all(
    transactions.map(async (t) => {
      const classification = await classifyTransaction(t);
      return { ...t, ...classification };
    }),
  );
}

module.exports = {
  classifyTransaction,
  classifyBatch,
  extractFeeType,
  matchPartner,
  clearRuleCache,
};
