/**
 * PARSER UTILITY
 * Chuyển đổi file PDF / CSV / XLSX thành mảng JSON chuẩn hóa:
 * [{ trans_date, description, amount, balance, ref_no }]
 *
 * Lưu ý: Nội dung giao dịch trong sao kê là CHỮ IN HOA không dấu.
 */

const xlsx = require("xlsx");
const pdf = require("pdf-parse");

// ─── Chuẩn hóa ngày ─────────────────────────────────────────────────────────
function parseDate(raw, debug = false) {
  if (!raw) return null;

  // Nếu là số serial Excel
  if (typeof raw === "number") {
    // Excel date serial (1 = 1/1/1900)
    if (raw > 0 && raw < 100000) {
      try {
        const d = xlsx.SSF.parse_date_code(raw);
        const result = `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
        if (debug) console.log(`[parseDate] Excel serial ${raw} -> ${result}`);
        return result;
      } catch (e) {
        if (debug)
          console.log(`[parseDate] Failed to parse Excel serial: ${raw}`);
        return null;
      }
    }
  }

  const s = String(raw).trim().replace(/\s+/g, " ");

  // Bỏ qua nếu là text không phải ngày
  if (s.length < 6) {
    if (debug) console.log(`[parseDate] Too short: "${s}"`);
    return null;
  }

  // Bỏ qua nếu chứa chữ (trừ tháng)
  if (
    /[a-zA-Z]/.test(s) &&
    !/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(s)
  ) {
    if (debug) console.log(`[parseDate] Contains letters: "${s}"`);
    return null;
  }

  // dd/mm/yyyy hoặc dd-mm-yyyy hoặc dd mm yyyy (có khoảng trắng)
  const m1 = s.match(/^(\d{1,2})[\s\/\-](\d{1,2})[\s\/\-](\d{4})$/);
  if (m1) {
    const day = parseInt(m1[1]);
    const month = parseInt(m1[2]);
    const year = parseInt(m1[3]);
    // Validate
    if (
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12 &&
      year >= 1900 &&
      year <= 2100
    ) {
      const result = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (debug) console.log(`[parseDate] dd/mm/yyyy: "${s}" -> ${result}`);
      return result;
    } else {
      if (debug)
        console.log(
          `[parseDate] Invalid date values: day=${day}, month=${month}, year=${year}`,
        );
    }
  }

  // yyyy-mm-dd hoặc yyyy/mm/dd hoặc yyyy mm dd
  const m2 = s.match(/^(\d{4})[\s\/\-](\d{1,2})[\s\/\-](\d{1,2})$/);
  if (m2) {
    const year = parseInt(m2[1]);
    const month = parseInt(m2[2]);
    const day = parseInt(m2[3]);
    // Validate
    if (
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12 &&
      year >= 1900 &&
      year <= 2100
    ) {
      const result = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (debug) console.log(`[parseDate] yyyy-mm-dd: "${s}" -> ${result}`);
      return result;
    }
  }

  // dd.mm.yyyy
  const m3 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m3) {
    const day = parseInt(m3[1]);
    const month = parseInt(m3[2]);
    const year = parseInt(m3[3]);
    if (
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12 &&
      year >= 1900 &&
      year <= 2100
    ) {
      const result = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (debug) console.log(`[parseDate] dd.mm.yyyy: "${s}" -> ${result}`);
      return result;
    }
  }

  // ddmmyyyy (no separator)
  const m4 = s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (m4) {
    const day = parseInt(m4[1]);
    const month = parseInt(m4[2]);
    const year = parseInt(m4[3]);
    if (
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12 &&
      year >= 1900 &&
      year <= 2100
    ) {
      const result = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (debug) console.log(`[parseDate] ddmmyyyy: "${s}" -> ${result}`);
      return result;
    }
  }

  if (debug) console.log(`[parseDate] No pattern matched for: "${s}"`);
  return null;
}

// ─── Chuẩn hóa số tiền ───────────────────────────────────────────────────────
function parseAmount(raw) {
  if (raw === null || raw === undefined || raw === "") return 0;
  if (typeof raw === "number") return raw;
  // Xóa dấu phân cách hàng nghìn, giữ dấu âm và dấu thập phân
  const cleaned = String(raw).replace(/[^\d\.\-]/g, "");
  return parseFloat(cleaned) || 0;
}

// ─── Chuẩn hóa text ──────────────────────────────────────────────────────────
function normalizeText(s) {
  return String(s || "")
    .trim()
    .toUpperCase();
}

// ─── Tìm header và xác định vị trí các cột ───────────────────────────────────
function findHeaderAndColumns(rawData) {
  let headerRowIndex = -1;
  let colMap = {
    date: -1,
    desc: -1,
    debit: -1,
    credit: -1,
    amount: -1,
    balance: -1,
    ref: -1,
  };

  // Scan tối đa 30 dòng đầu để tìm header
  for (let i = 0; i < Math.min(30, rawData.length); i++) {
    const row = rawData[i];

    // Bỏ qua dòng trống
    const nonEmpty = row.filter((c) => String(c).trim() !== "").length;
    if (nonEmpty < 2) continue;

    // Gộp các ô trong dòng thành một chuỗi để kiểm tra từ khóa
    const rowString = row.join(" ").toLowerCase();

    // Kiểm tra xem dòng này có phải là dòng tiêu đề không
    // Phải có "ngày" VÀ ("nội dung" HOẶC "diễn giải")
    if (
      rowString.includes("ngày") &&
      (rowString.includes("nội dung") || rowString.includes("diễn giải"))
    ) {
      headerRowIndex = i;

      // Duyệt từng ô để xác định vị trí chính xác của từng cột
      row.forEach((cell, index) => {
        const cellText = String(cell).toLowerCase().trim();

        // Cột Ngày
        if (
          cellText.includes("ngày") &&
          !cellText.includes("tên") &&
          colMap.date === -1
        ) {
          colMap.date = index;
        }

        // Cột Nội dung/Diễn giải
        if (
          (cellText.includes("nội dung") || cellText.includes("diễn giải")) &&
          colMap.desc === -1
        ) {
          colMap.desc = index;
        }

        // Cột Rút ra / Ghi nợ / Tiền ra / Chi
        if (
          (cellText.includes("rút") ||
            cellText.includes("ghi nợ") ||
            cellText.includes("tiền ra") ||
            cellText.includes("chi") ||
            cellText.includes("phát sinh nợ")) &&
          !cellText.includes("gửi") &&
          colMap.debit === -1
        ) {
          colMap.debit = index;
        }

        // Cột Gửi vào / Ghi có / Tiền vào / Thu
        if (
          (cellText.includes("gửi") ||
            cellText.includes("ghi có") ||
            cellText.includes("tiền vào") ||
            cellText.includes("thu") ||
            cellText.includes("phát sinh có")) &&
          !cellText.includes("rút") &&
          colMap.credit === -1
        ) {
          colMap.credit = index;
        }

        // Cột Số tiền (nếu không có 2 cột riêng)
        if (
          (cellText.includes("số tiền") || cellText.includes("tiền")) &&
          !cellText.includes("rút") &&
          !cellText.includes("gửi") &&
          !cellText.includes("ra") &&
          !cellText.includes("vào") &&
          colMap.amount === -1
        ) {
          colMap.amount = index;
        }

        // Cột Số dư
        if (cellText.includes("số dư") && colMap.balance === -1) {
          colMap.balance = index;
        }

        // Cột Số GD / Mã GD / Ref
        if (
          (cellText.includes("số gd") ||
            cellText.includes("mã gd") ||
            cellText.includes("ref") ||
            cellText.includes("tham chiếu")) &&
          colMap.ref === -1
        ) {
          colMap.ref = index;
        }
      });

      console.log(`[PARSER] Found header row at line ${i + 1}`);
      console.log(`[PARSER] Header content:`, row.slice(0, 10));
      console.log(`[PARSER] Detected columns:`, colMap);
      break;
    }
  }

  return { headerRowIndex, colMap };
}

// ─── PARSE XLSX / XLS ────────────────────────────────────────────────────────
function parseXlsx(buffer) {
  try {
    const workbook = xlsx.read(buffer, { type: "buffer", cellDates: false });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("File Excel không có sheet nào");
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new Error(`Không thể đọc sheet: ${sheetName}`);
    }

    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    if (rows.length === 0) {
      throw new Error("File Excel không có dữ liệu");
    }

    console.log(`[PARSER] Total rows in sheet: ${rows.length}`);

    // Tìm header row và xác định vị trí các cột
    const { headerRowIndex, colMap } = findHeaderAndColumns(rows);

    if (headerRowIndex === -1) {
      console.error("[PARSER] Could not find valid header row");
      console.error("[PARSER] First 10 rows:");
      rows.slice(0, 10).forEach((row, idx) => {
        console.error(`  Row ${idx + 1}:`, row.slice(0, 5));
      });
      throw new Error(
        "Không tìm thấy header row hợp lệ. File phải có header chứa: 'Ngày' và 'Nội dung/Diễn giải'",
      );
    }

    // Kiểm tra các cột bắt buộc
    if (colMap.date === -1) {
      throw new Error(
        "Không tìm thấy cột Ngày. Header phải có cột chứa từ 'Ngày'",
      );
    }
    if (colMap.desc === -1) {
      throw new Error(
        "Không tìm thấy cột Nội dung/Diễn giải. Header phải có cột chứa 'Nội dung' hoặc 'Diễn giải'",
      );
    }
    if (colMap.amount === -1 && colMap.credit === -1 && colMap.debit === -1) {
      throw new Error(
        "Không tìm thấy cột Số tiền. Header phải có cột: Số tiền/Tiền vào/Tiền ra",
      );
    }

    const results = [];
    let skippedRows = 0;
    const skipReasons = {
      empty: 0,
      noDate: 0,
      invalidDate: 0,
      noDescription: 0,
    };

    console.log(
      `[PARSER] Starting to parse data rows from line ${headerRowIndex + 2}...`,
    );

    // Parse dữ liệu từ dòng sau header
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];

      // Lấy dữ liệu dựa trên vị trí cột đã xác định
      let dateVal = row[colMap.date] || "";
      let descVal = row[colMap.desc] || "";

      // Bỏ qua các dòng trống hoàn toàn
      if (!dateVal && !descVal) {
        skippedRows++;
        skipReasons.empty++;
        continue;
      }

      // Bỏ qua dòng không có ngày
      if (!dateVal || String(dateVal).trim() === "") {
        skippedRows++;
        skipReasons.noDate++;
        if (i < headerRowIndex + 10) {
          console.log(
            `[PARSER] Row ${i + 1}: Skipped - no date value. Row data:`,
            row.slice(0, 5),
          );
        }
        continue;
      }

      // Log giá trị ngày thực tế cho 5 dòng đầu
      if (i < headerRowIndex + 5) {
        console.log(
          `[PARSER] Row ${i + 1}: Date column value = "${dateVal}" (type: ${typeof dateVal})`,
        );
      }

      // XỬ LÝ NỘI DUNG DÀI BỊ TRÀN SANG CÁC CỘT KHÁC
      // Nếu các cột tiền chứa text (không phải số), đó là phần tiếp theo của nội dung
      const descStartCol = colMap.desc;
      const descEndCol = Math.min(
        colMap.debit !== -1 ? colMap.debit : row.length,
        colMap.credit !== -1 ? colMap.credit : row.length,
        colMap.amount !== -1 ? colMap.amount : row.length,
      );

      // Gộp tất cả các cột từ desc đến trước cột số tiền
      const descParts = [];
      for (let col = descStartCol; col < descEndCol; col++) {
        const cellVal = row[col];
        if (cellVal !== null && cellVal !== undefined && cellVal !== "") {
          const cellStr = String(cellVal).trim();
          // Nếu cell này chứa text (không phải số thuần túy), thêm vào description
          if (cellStr && (isNaN(cellStr) || cellStr.includes(" "))) {
            descParts.push(cellStr);
          } else {
            // Nếu gặp số thuần túy, dừng lại (đã đến cột tiền)
            break;
          }
        }
      }

      // Gộp description
      descVal = descParts.join(" ");

      // Tính amount: ưu tiên cột amount, nếu không có thì credit - debit
      let amount = 0;
      if (colMap.amount !== -1) {
        amount = parseAmount(row[colMap.amount]);
      } else if (colMap.credit !== -1 || colMap.debit !== -1) {
        const credit = parseAmount(row[colMap.credit] || 0);
        const debit = parseAmount(row[colMap.debit] || 0);
        // Nếu có cả 2 cột: credit (tiền vào) = dương, debit (tiền ra) = âm
        if (credit > 0) {
          amount = credit;
        } else if (debit > 0) {
          amount = -debit;
        }
      }

      const trans_date = parseDate(dateVal, i < headerRowIndex + 5); // Debug first 5 rows
      if (!trans_date) {
        skippedRows++;
        skipReasons.invalidDate++;
        if (i < headerRowIndex + 10) {
          console.log(
            `[PARSER] Row ${i + 1}: Skipped - invalid date format. Date value: "${dateVal}" (type: ${typeof dateVal})`,
          );
        }
        continue;
      }

      const description = normalizeText(descVal);

      // Bỏ qua dòng không có nội dung (có thể là dòng tổng cộng)
      if (!description || description.length < 2) {
        skippedRows++;
        skipReasons.noDescription++;
        if (i < headerRowIndex + 10) {
          console.log(
            `[PARSER] Row ${i + 1}: Skipped - no description. Desc value: "${descVal}"`,
          );
        }
        continue;
      }

      // Log first few successful rows
      if (results.length < 3) {
        console.log(`[PARSER] Row ${i + 1}: SUCCESS`);
        console.log(`  Date: ${dateVal} -> ${trans_date}`);
        console.log(`  Description: ${description.substring(0, 80)}...`);
        console.log(`  Amount: ${amount}`);
      }

      results.push({
        trans_date,
        description,
        amount,
        balance:
          colMap.balance !== -1 ? parseAmount(row[colMap.balance]) : null,
        ref_no: colMap.ref !== -1 ? String(row[colMap.ref] || "").trim() : null,
      });
    }

    console.log(
      `[PARSER] Parsed ${results.length} valid rows, skipped ${skippedRows} rows`,
    );
    console.log(`[PARSER] Skip reasons:`, skipReasons);

    if (results.length === 0) {
      let errorMsg = "Không có dữ liệu hợp lệ sau khi parse.\n\n";
      errorMsg += `Đã bỏ qua ${skippedRows} dòng:\n`;
      errorMsg += `- ${skipReasons.empty} dòng trống\n`;
      errorMsg += `- ${skipReasons.noDate} dòng không có giá trị ngày\n`;
      errorMsg += `- ${skipReasons.invalidDate} dòng có ngày không hợp lệ\n`;
      errorMsg += `- ${skipReasons.noDescription} dòng không có nội dung\n\n`;
      errorMsg += "Vui lòng kiểm tra:\n";
      errorMsg += "- Cột Ngày có format đúng (dd/mm/yyyy hoặc dd-mm-yyyy)\n";
      errorMsg += "- Cột Nội dung/Diễn giải không rỗng\n";
      errorMsg += "- Có ít nhất 1 dòng dữ liệu giao dịch sau header";

      throw new Error(errorMsg);
    }

    return results;
  } catch (err) {
    console.error("[PARSER] Error parsing XLSX:", err.message);
    throw new Error(`Lỗi parse Excel: ${err.message}`);
  }
}

// ─── PARSE CSV ───────────────────────────────────────────────────────────────
function parseCsv(buffer) {
  // Dùng xlsx để đọc CSV (hỗ trợ encoding tốt hơn)
  return parseXlsx(buffer); // tái sử dụng logic parseXlsx
}

// ─── PARSE PDF ───────────────────────────────────────────────────────────────
async function parsePdf(buffer) {
  const data = await pdf(buffer);
  const lines = data.text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const results = [];

  // Pattern nhận diện dòng giao dịch:
  // Ngày (dd/mm/yyyy) ... số tiền ... số dư
  const linePattern =
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+(.+?)\s+([\-\+]?[\d\.,]+)\s+([\d\.,]+)?$/;

  for (const line of lines) {
    const m = line.match(linePattern);
    if (!m) continue;

    const trans_date = parseDate(m[1]);
    if (!trans_date) continue;

    // Tách ref_no nếu có (thường là chuỗi số đầu nội dung)
    const descRaw = normalizeText(m[2]);
    const refMatch = descRaw.match(/^([A-Z0-9]{6,20})\s+(.+)$/);

    results.push({
      trans_date,
      description: refMatch ? refMatch[2] : descRaw,
      amount: parseAmount(m[3]),
      balance: m[4] ? parseAmount(m[4]) : null,
      ref_no: refMatch ? refMatch[1] : null,
    });
  }

  return results;
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────
module.exports = {
  parseXlsx,
  parseCsv,
  parsePdf,
  parseDate,
  parseAmount,
  normalizeText,
};
