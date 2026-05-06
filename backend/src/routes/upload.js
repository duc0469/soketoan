/**
 * UPLOAD ROUTES
 * POST /api/upload  - Upload và parse file sao kê
 */

const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const db = require("../config/db");
const { parseXlsx, parseCsv, parsePdf } = require("../utils/parser");
const { classifyBatch } = require("../utils/ruleEngine");

// Multer: lưu vào memory (không ghi disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    // Lấy extension từ tên file
    const ext = file.originalname.split(".").pop().toLowerCase();

    // Chỉ check extension (không check MIME type vì có thể khác nhau giữa các browser/OS)
    const allowedExtensions = ["pdf", "csv", "xlsx", "xls"];

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Chỉ hỗ trợ file: ${allowedExtensions.join(", ").toUpperCase()}`,
        ),
      );
    }
  },
});

// POST /api/upload
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Không có file được upload" });
  }

  const batchId = uuidv4();
  const fileName = req.file.originalname;
  const ext = fileName.split(".").pop().toLowerCase();
  const buffer = req.file.buffer;

  // Xóa tất cả dữ liệu cũ trước khi upload mới
  // (Mỗi lần upload là một phiên làm việc mới)
  // Phải xóa ledgers trước vì có foreign key đến transactions
  await db.query("DELETE FROM ledgers");
  await db.query("DELETE FROM transactions");
  await db.query("DELETE FROM upload_batches");
  console.log("[UPLOAD] Cleared all old data (ledgers, transactions, batches)");

  // Tạo bản ghi batch
  await db.query(
    "INSERT INTO upload_batches (batch_id, file_name, file_type, status) VALUES (?, ?, ?, ?)",
    [batchId, fileName, ext, "PROCESSING"],
  );

  try {
    // 1. Parse file
    let rawRows = [];

    console.log(
      `[UPLOAD] Parsing ${ext} file: ${fileName}, size: ${buffer.length} bytes`,
    );

    if (ext === "pdf") {
      rawRows = await parsePdf(buffer);
    } else if (ext === "csv") {
      rawRows = parseCsv(buffer);
    } else if (ext === "xlsx" || ext === "xls") {
      rawRows = parseXlsx(buffer);
    } else {
      throw new Error(`Định dạng file không được hỗ trợ: ${ext}`);
    }

    console.log(`[UPLOAD] Parsed ${rawRows.length} rows from ${fileName}`);

    if (rawRows.length === 0) {
      await db.query(
        "UPDATE upload_batches SET status=?, parsed_rows=0, total_rows=0 WHERE batch_id=?",
        ["ERROR", batchId],
      );
      return res.status(422).json({
        error: "Không đọc được dữ liệu từ file. Vui lòng kiểm tra định dạng.",
      });
    }

    // 2. Phân loại tự động
    const classified = await classifyBatch(rawRows);

    // 3. Bulk insert vào transactions
    const values = classified.map((t) => [
      batchId,
      t.trans_date,
      t.description,
      t.amount,
      t.balance || null,
      t.ref_no || null,
      t.debit_account || null,
      t.credit_account || null,
      t.ledger_type || "CHI_PHI", // Mặc định là Chi Phí
      t.fee_type || null,
      t.partner_name || null,
      t.rule_id || null,
      "PENDING",
    ]);

    await db.query(
      `INSERT INTO transactions
        (upload_batch, trans_date, description, amount, balance, ref_no,
         debit_account, credit_account, ledger_type, fee_type, partner_name, rule_id, status)
       VALUES ?`,
      [values],
    );

    // 4. Cập nhật batch
    await db.query(
      "UPDATE upload_batches SET status=?, parsed_rows=?, total_rows=? WHERE batch_id=?",
      ["DONE", classified.length, classified.length, batchId],
    );

    // 5. Kiểm tra số dư (balance verification)
    let balanceWarning = null;
    const rowsWithBalance = rawRows.filter(
      (r) => r.balance !== null && r.balance !== undefined,
    );
    if (rowsWithBalance.length >= 2) {
      const firstBalance = rowsWithBalance[0].balance;
      const lastBalance = rowsWithBalance[rowsWithBalance.length - 1].balance;
      const totalIn = rawRows
        .filter((r) => r.amount > 0)
        .reduce((s, r) => s + r.amount, 0);
      const totalOut = rawRows
        .filter((r) => r.amount < 0)
        .reduce((s, r) => s + Math.abs(r.amount), 0);
      const expectedBalance = firstBalance + totalIn - totalOut;
      const diff = Math.abs(expectedBalance - lastBalance);
      if (diff > 1000) {
        // Sai lệch > 1,000 VND thì cảnh báo
        balanceWarning = `Số dư không khớp: kỳ vọng ${expectedBalance.toLocaleString("vi-VN")} VND, thực tế ${lastBalance.toLocaleString("vi-VN")} VND (chênh lệch ${diff.toLocaleString("vi-VN")} VND)`;
        console.warn(
          `[UPLOAD] Balance mismatch: expected ${expectedBalance}, got ${lastBalance}, diff ${diff}`,
        );
      }
    }

    // 6. Phát hiện giao dịch trùng lặp
    const duplicates = [];
    const seen = new Map();
    for (const t of rawRows) {
      const key = `${t.trans_date}_${t.amount}_${t.description.substring(0, 30)}`;
      if (seen.has(key)) {
        duplicates.push({
          date: t.trans_date,
          amount: t.amount,
          description: t.description.substring(0, 60),
        });
      } else {
        seen.set(key, true);
      }
    }

    // 7. Trả về dữ liệu để hiển thị trên grid
    const [inserted] = await db.query(
      "SELECT * FROM transactions WHERE upload_batch = ? ORDER BY trans_date, id",
      [batchId],
    );

    res.json({
      batch_id: batchId,
      file_name: fileName,
      total_rows: inserted.length,
      transactions: inserted,
      balance_warning: balanceWarning || null,
      duplicates: duplicates.length > 0 ? duplicates : null,
    });
  } catch (err) {
    console.error(`[UPLOAD] Error processing ${fileName}:`, err.message);
    console.error(err.stack);

    await db.query("UPDATE upload_batches SET status=? WHERE batch_id=?", [
      "ERROR",
      batchId,
    ]);

    // Trả về error message chi tiết
    return res.status(500).json({
      error: `Lỗi xử lý file: ${err.message}`,
      file: fileName,
      hint: "Vui lòng kiểm tra định dạng file (phải có header: Ngày, Nội dung, Số tiền)",
    });
  }
});

module.exports = router;
