/**
 * EXPORT ROUTES
 * GET /api/export/excel - Xuất file Excel với 4 sheets (Sổ Cái, Sổ Chi Phí, Sổ Công Nợ, Chi Phí Được Trừ)
 */

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const XLSX = require("xlsx");

// ─── GET /api/export/excel ────────────────────────────────────────────────────
router.get("/excel", async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    let where = [];
    let params = [];

    if (from_date) {
      where.push("l.entry_date >= ?");
      params.push(from_date);
    }
    if (to_date) {
      where.push("l.entry_date <= ?");
      params.push(to_date);
    }

    const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

    // Lấy tất cả ledgers
    const [allLedgers] = await db.query(
      `SELECT 
        l.entry_date as 'Ngày',
        l.description as 'Nội dung',
        l.debit_account as 'TK Nợ',
        l.credit_account as 'TK Có',
        l.amount as 'Số tiền',
        l.ledger_type as 'Loại sổ',
        l.ref_no as 'Số chứng từ'
      FROM ledgers l
      ${whereClause}
      ORDER BY l.entry_date, l.id`,
      params,
    );

    // Tạo workbook
    const workbook = XLSX.utils.book_new();

    // ─── Sheet 1: Sổ Cái (Tất cả giao dịch) ───────────────────────────────────
    const soCaiData = allLedgers.map((row) => ({
      Ngày: formatDate(row["Ngày"]),
      "Nội dung": row["Nội dung"],
      "TK Nợ": row["TK Nợ"],
      "TK Có": row["TK Có"],
      "Tiền ra": row["Số tiền"] < 0 ? Math.abs(row["Số tiền"]) : 0,
      "Tiền vào": row["Số tiền"] > 0 ? row["Số tiền"] : 0,
      "Loại sổ": formatLedgerType(row["Loại sổ"]),
    }));

    // Tính tổng tiền ra và tiền vào
    const soCaiTienRa = allLedgers
      .filter((row) => row["Số tiền"] < 0)
      .reduce((sum, row) => sum + Math.abs(row["Số tiền"]), 0);
    const soCaiTienVao = allLedgers
      .filter((row) => row["Số tiền"] > 0)
      .reduce((sum, row) => sum + row["Số tiền"], 0);

    console.log(
      `[EXPORT] Sổ Cái - Tiền ra: ${soCaiTienRa}, Tiền vào: ${soCaiTienVao}`,
    );

    // Thêm dòng tổng
    soCaiData.push({
      Ngày: "",
      "Nội dung": "TỔNG CỘNG",
      "TK Nợ": "",
      "TK Có": "",
      "Tiền ra": soCaiTienRa,
      "Tiền vào": soCaiTienVao,
      "Loại sổ": "",
    });

    const soCaiSheet = XLSX.utils.json_to_sheet(soCaiData);

    // Set column widths
    soCaiSheet["!cols"] = [
      { wch: 12 }, // Ngày
      { wch: 50 }, // Nội dung
      { wch: 10 }, // TK Nợ
      { wch: 10 }, // TK Có
      { wch: 15 }, // Tiền ra
      { wch: 15 }, // Tiền vào
      { wch: 15 }, // Loại sổ
    ];

    XLSX.utils.book_append_sheet(workbook, soCaiSheet, "Sổ Cái");

    // ─── Sheet 2: Sổ Chi Phí (Tất cả trừ công nợ) ─────────────────────────────
    const chiPhiFiltered = allLedgers.filter(
      (row) => row["Loại sổ"] !== "CONG_NO",
    );

    const chiPhiData = chiPhiFiltered.map((row) => ({
      Ngày: formatDate(row["Ngày"]),
      "Nội dung": row["Nội dung"],
      "TK Nợ": row["TK Nợ"],
      "TK Có": row["TK Có"],
      "Tiền ra": row["Số tiền"] < 0 ? Math.abs(row["Số tiền"]) : 0,
      "Tiền vào": row["Số tiền"] > 0 ? row["Số tiền"] : 0,
      "Loại sổ": formatLedgerType(row["Loại sổ"]),
    }));

    // Tính tổng tiền ra và tiền vào
    const chiPhiTienRa = chiPhiFiltered
      .filter((row) => row["Số tiền"] < 0)
      .reduce((sum, row) => sum + Math.abs(row["Số tiền"]), 0);
    const chiPhiTienVao = chiPhiFiltered
      .filter((row) => row["Số tiền"] > 0)
      .reduce((sum, row) => sum + row["Số tiền"], 0);

    console.log(
      `[EXPORT] Sổ Chi Phí - Tiền ra: ${chiPhiTienRa}, Tiền vào: ${chiPhiTienVao}`,
    );

    // Thêm dòng tổng
    chiPhiData.push({
      Ngày: "",
      "Nội dung": "TỔNG CỘNG",
      "TK Nợ": "",
      "TK Có": "",
      "Tiền ra": chiPhiTienRa,
      "Tiền vào": chiPhiTienVao,
      "Loại sổ": "",
    });

    const chiPhiSheet = XLSX.utils.json_to_sheet(chiPhiData);
    chiPhiSheet["!cols"] = [
      { wch: 12 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, chiPhiSheet, "Sổ Chi Phí");

    // ─── Sheet 3: Sổ Công Nợ (Chỉ công nợ) ────────────────────────────────────
    const congNoFiltered = allLedgers.filter(
      (row) => row["Loại sổ"] === "CONG_NO",
    );

    const congNoData = congNoFiltered.map((row) => ({
      Ngày: formatDate(row["Ngày"]),
      "Nội dung": row["Nội dung"],
      "TK Nợ": row["TK Nợ"],
      "TK Có": row["TK Có"],
      "Tiền ra": row["Số tiền"] < 0 ? Math.abs(row["Số tiền"]) : 0,
      "Tiền vào": row["Số tiền"] > 0 ? row["Số tiền"] : 0,
    }));

    // Tính tổng tiền ra và tiền vào
    const congNoTienRa = congNoFiltered
      .filter((row) => row["Số tiền"] < 0)
      .reduce((sum, row) => sum + Math.abs(row["Số tiền"]), 0);
    const congNoTienVao = congNoFiltered
      .filter((row) => row["Số tiền"] > 0)
      .reduce((sum, row) => sum + row["Số tiền"], 0);

    console.log(
      `[EXPORT] Sổ Công Nợ - Tiền ra: ${congNoTienRa}, Tiền vào: ${congNoTienVao}`,
    );

    // Thêm dòng tổng
    congNoData.push({
      Ngày: "",
      "Nội dung": "TỔNG CỘNG",
      "TK Nợ": "",
      "TK Có": "",
      "Tiền ra": congNoTienRa,
      "Tiền vào": congNoTienVao,
    });

    const congNoSheet = XLSX.utils.json_to_sheet(congNoData);
    congNoSheet["!cols"] = [
      { wch: 12 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, congNoSheet, "Sổ Công Nợ");

    // ─── Sheet 4: Chi Phí Được Trừ (Chi phí với TK Nợ bắt đầu bằng 6) ─────────
    const chiPhiDuocTruFiltered = allLedgers.filter(
      (row) =>
        row["Loại sổ"] !== "CONG_NO" &&
        row["TK Nợ"] &&
        row["TK Nợ"].toString().startsWith("6") &&
        // Loại bỏ các giao dịch: nộp thuế, ngân hàng nhà nước, kho bạc nhà nước, tạm ứng, chuyển khoản nội bộ
        row["Nội dung"] &&
        !row["Nội dung"].toLowerCase().includes("nop thue") &&
        !row["Nội dung"].toLowerCase().includes("ngan hang nha nuoc") &&
        !row["Nội dung"].toLowerCase().includes("kho bac nha nuoc") &&
        !row["Nội dung"].toLowerCase().includes("tam ung") &&
        !row["Nội dung"].toLowerCase().includes("chuyen khoan noi bo"),
    );

    const chiPhiDuocTruData = chiPhiDuocTruFiltered.map((row) => ({
      Ngày: formatDate(row["Ngày"]),
      "Nội dung": row["Nội dung"],
      "TK Nợ": row["TK Nợ"],
      "TK Có": row["TK Có"],
      "Tiền ra": row["Số tiền"] < 0 ? Math.abs(row["Số tiền"]) : 0,
      "Tiền vào": row["Số tiền"] > 0 ? row["Số tiền"] : 0,
      "Loại sổ": formatLedgerType(row["Loại sổ"]),
    }));

    // Tính tổng tiền ra và tiền vào
    const chiPhiDuocTruTienRa = chiPhiDuocTruFiltered
      .filter((row) => row["Số tiền"] < 0)
      .reduce((sum, row) => sum + Math.abs(row["Số tiền"]), 0);
    const chiPhiDuocTruTienVao = chiPhiDuocTruFiltered
      .filter((row) => row["Số tiền"] > 0)
      .reduce((sum, row) => sum + row["Số tiền"], 0);

    console.log(
      `[EXPORT] Chi Phí Được Trừ - Tiền ra: ${chiPhiDuocTruTienRa}, Tiền vào: ${chiPhiDuocTruTienVao}`,
    );

    // Thêm dòng tổng
    chiPhiDuocTruData.push({
      Ngày: "",
      "Nội dung": "TỔNG CỘNG",
      "TK Nợ": "",
      "TK Có": "",
      "Tiền ra": chiPhiDuocTruTienRa,
      "Tiền vào": chiPhiDuocTruTienVao,
      "Loại sổ": "",
    });

    const chiPhiDuocTruSheet = XLSX.utils.json_to_sheet(chiPhiDuocTruData);
    chiPhiDuocTruSheet["!cols"] = [
      { wch: 12 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      chiPhiDuocTruSheet,
      "Chi Phí Được Trừ",
    );

    // ─── Tạo buffer và gửi file ────────────────────────────────────────────────
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `So_Ke_Toan_${timestamp}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ error: "Không thể xuất file Excel" });
  }
});

// ─── Helper Functions ──────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatLedgerType(type) {
  const labels = {
    CHI_PHI: "Chi phí",
    CHI_PHI_DUOC_TRU: "Chi phí được trừ",
    SO_CAI: "Sổ cái",
    CONG_NO: "Công nợ",
    TIEN_MAT: "Tiền mặt",
  };
  return labels[type] || type;
}

module.exports = router;
