/**
 * SPELL CHECKER & SUGGESTION UTILITY
 * Tính toán độ tương đồng và đề xuất từ khóa cho rules
 */

// Danh sách từ khóa phổ biến trong kế toán
const COMMON_KEYWORDS = [
  // Chi phí nhân viên
  "TIEN LUONG",
  "LUONG",
  "SALARY",
  "THU LAO",
  "THUONG",
  "PHU CAP",
  "BAO HIEM XA HOI",
  "BHXH",
  "BAO HIEM Y TE",
  "BHYT",
  "BAO HIEM THAT NGHIEP",
  "BHTN",
  "KIEN THUC CHUYEN MON",
  "DAO TAO",
  "HOI THAO",
  "HOC PHI",
  "KHOA HOC",

  // Chi phí vận hành
  "DIEN",
  "NUOC",
  "INTERNET",
  "DIEN THOAI",
  "THUE NHA",
  "VAN PHONG PHAM",
  "XE CONG",
  "XANG",
  "BAO DUONG",
  "SUA CHUA",
  "THUE XE",
  "PARKING",
  "CAFE",
  "NUOC UONG",
  "AN TRUA",
  "COM CONG TY",
  "TIEC CONG TY",

  // Chi phí marketing & bán hàng
  "QUANG CAO",
  "MARKETING",
  "TRUYEN THONG",
  "SEO",
  "FACEBOOK ADS",
  "GOOGLE ADS",
  "THIEP CHUC MUNG",
  "QUA TANG",
  "SU KIEN",
  "HOI CHO",
  "TRIEN LAM",
  "BROCHURE",
  "CATALOG",
  "BANNER",
  "POSTER",
  "WEBSITE",

  // Chi phí khác
  "THUE",
  "PHI",
  "LE PHI",
  "CONG CHUNG",
  "PHAP LY",
  "TU VAN",
  "KE TOAN",
  "KIEM TOAN",
  "NGAN HANG",
  "CHUYEN KHOAN",
  "RUT TIEN",
  "PHOTOCOPY",
  "IN AN",
  "FAX",
  "COURIER",
  "CHUYEN PHAT",

  // Thu nhập
  "DOANH THU",
  "BAN HANG",
  "DICH VU",
  "HOA HONG",
  "LAI SUAT",
  "TIEN LAI",
  "THUE GTGT",
  "VAT",
  "HOAN THUE",
  "KHAU TRU",
  "THUE THU NHAP",
  "TIEN MAT",
  "CHUYEN KHOAN",
  "THE",
  "VISA",
  "MASTERCARD",

  // Tài sản
  "MAY TINH",
  "LAPTOP",
  "BAN GHE",
  "TU LANH",
  "MAY LANH",
  "NOI THAT",
  "XE MAY",
  "O TO",
  "THIET BI",
  "CONG CU",
  "MAY IN",
  "SCANNER",
  "DIEN THOAI",
  "TABLET",
  "CAMERA",
  "MAY CHIEU",
  "MAN HINH",
  "BAN",
  "GHE",
  "TU",
  "KE",
  "DEN",
  "QUAT",
  "DIEU HOA",

  // Công nợ
  "CONG NO",
  "PHAI THU",
  "PHAI TRA",
  "VAY",
  "CHO VAY",
  "LAI VAY",
  "KHACH HANG",
  "NHA CUNG CAP",
  "DOI TAC",
  "NGAN HANG",
  "TIN DUNG",
  "THE TIN DUNG",
  "VAY VON",
  "GOC",
  "LAI",
  "PHAT",
  "PHI TRE HAN",

  // Từ khóa tiếng Anh phổ biến
  "OFFICE",
  "SUPPLIES",
  "EQUIPMENT",
  "FURNITURE",
  "COMPUTER",
  "SOFTWARE",
  "LICENSE",
  "SUBSCRIPTION",
  "HOSTING",
  "DOMAIN",
  "TRAINING",
  "COURSE",
  "SEMINAR",
  "CONFERENCE",
  "MEETING",
  "TRAVEL",
  "HOTEL",
  "FLIGHT",
  "TAXI",
  "UBER",
  "GRAB",

  // Từ khóa về địa điểm & dịch vụ
  "HA NOI",
  "HO CHI MINH",
  "DA NANG",
  "CAN THO",
  "HAI PHONG",
  "VIETTEL",
  "VNPT",
  "FPT",
  "MOBIFONE",
  "VINAPHONE",
  "VIETCOMBANK",
  "TECHCOMBANK",
  "BIDV",
  "AGRIBANK",
  "SACOMBANK",
  "GRAB",
  "UBER",
  "GOJEK",
  "BE",
  "TAXI",
  "BUS",
  "XE OM",

  // Từ khóa về thời gian
  "THANG",
  "QUY",
  "NAM",
  "NGAY",
  "TUAN",
  "GIO",
  "PHUT",
  "HANG THANG",
  "HANG QUY",
  "HANG NAM",
  "DINH KY",
  "MOT LAN",

  // Từ khóa về số lượng & đơn vị
  "CHIEC",
  "CAI",
  "BO",
  "SET",
  "THANG",
  "KG",
  "GRAM",
  "LITER",
  "M2",
  "M3",
  "DONG",
  "USD",
  "EUR",
  "YEN",
  "WON",
  "BATH",

  // Từ khóa ngắn phổ biến (để cải thiện phát hiện)
  "TIEN",
  "MAY",
  "XE",
  "NHA",
  "DAT",
  "GOC",
  "LAI",
  "PHI",
  "QUA",
  "SUA",
  "MUA",
  "BAN",
  "CHO",
  "VAY",
  "THE",
  "TU",
  "KE",
  "AN",
  "IN",
];

/**
 * Tính khoảng cách Levenshtein giữa hai chuỗi
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  // Khởi tạo ma trận
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Tính toán khoảng cách
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Tính độ tương đồng giữa hai chuỗi (0-1) - Cải thiện
 */
function similarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(longer, shorter);
  const maxLength = longer.length;

  // Cải thiện: Xử lý trường hợp thêm ký tự liên tiếp
  const lengthDiff = Math.abs(str1.length - str2.length);
  const baseSimilarity = (maxLength - distance) / maxLength;

  // Nếu chỉ khác nhau về độ dài và có pattern lặp ký tự
  if (lengthDiff > 0) {
    const repeatedCharPattern = hasRepeatedCharPattern(longer, shorter);
    if (repeatedCharPattern) {
      // Tăng độ tương đồng cho trường hợp lặp ký tự
      return Math.min(1.0, baseSimilarity + 0.2);
    }
  }

  return baseSimilarity;
}

/**
 * Kiểm tra xem có pattern lặp ký tự không (VD: "tiennn" vs "tien")
 */
function hasRepeatedCharPattern(longer, shorter) {
  // Kiểm tra nếu chuỗi ngắn là substring của chuỗi dài khi bỏ ký tự lặp
  const longerNormalized = longer.replace(/(.)\1+/g, "$1");
  const shorterNormalized = shorter.replace(/(.)\1+/g, "$1");

  return (
    longerNormalized === shorterNormalized ||
    longerNormalized.includes(shorterNormalized) ||
    shorterNormalized.includes(longerNormalized)
  );
}

/**
 * Chuẩn hóa chuỗi để so sánh
 */
function normalizeString(str) {
  return str
    .toUpperCase()
    .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A")
    .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E")
    .replace(/[ÌÍỊỈĨ]/g, "I")
    .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O")
    .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U")
    .replace(/[ỲÝỴỶỸ]/g, "Y")
    .replace(/Đ/g, "D")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tìm các từ khóa gợi ý dựa trên input của user - Cải thiện
 */
function getSuggestions(userInput, threshold = 0.5) {
  const normalizedInput = normalizeString(userInput);
  const suggestions = [];

  // Tách input thành các từ
  const inputWords = normalizedInput
    .split(" ")
    .filter((word) => word.length > 1); // Giảm từ 2 xuống 1

  for (const keyword of COMMON_KEYWORDS) {
    const normalizedKeyword = normalizeString(keyword);

    // Kiểm tra độ tương đồng với toàn bộ chuỗi
    const fullSimilarity = similarity(normalizedInput, normalizedKeyword);

    if (fullSimilarity >= threshold) {
      suggestions.push({
        keyword,
        similarity: fullSimilarity,
        type: "full_match",
      });
      continue;
    }

    // Kiểm tra độ tương đồng với từng từ - Cải thiện
    const keywordWords = normalizedKeyword.split(" ");

    for (const inputWord of inputWords) {
      for (const keywordWord of keywordWords) {
        // Sử dụng threshold linh hoạt dựa trên độ dài từ
        const adaptiveThreshold = getAdaptiveThreshold(inputWord, keywordWord);
        const wordSimilarity = similarity(inputWord, keywordWord);

        if (wordSimilarity >= adaptiveThreshold) {
          suggestions.push({
            keyword,
            similarity: wordSimilarity,
            type: "word_match",
            matchedWord: keywordWord,
            inputWord: inputWord,
          });
        }
      }
    }
  }

  // Sắp xếp theo độ tương đồng giảm dần và loại bỏ trùng lặp
  const uniqueSuggestions = suggestions
    .sort((a, b) => b.similarity - a.similarity)
    .filter(
      (suggestion, index, arr) =>
        arr.findIndex((s) => s.keyword === suggestion.keyword) === index,
    )
    .slice(0, 5); // Chỉ lấy 5 gợi ý tốt nhất

  return uniqueSuggestions;
}

/**
 * Tính threshold linh hoạt dựa trên độ dài từ
 */
function getAdaptiveThreshold(inputWord, keywordWord) {
  const minLength = Math.min(inputWord.length, keywordWord.length);
  const maxLength = Math.max(inputWord.length, keywordWord.length);
  const lengthDiff = maxLength - minLength;

  // Threshold cơ bản
  let threshold = 0.6;

  // Giảm threshold cho từ ngắn
  if (minLength <= 3) {
    threshold = 0.5;
  } else if (minLength <= 5) {
    threshold = 0.55;
  }

  // Giảm threshold nếu chỉ khác nhau 1-2 ký tự
  if (lengthDiff <= 2) {
    threshold -= 0.1;
  }

  // Kiểm tra pattern lặp ký tự
  if (hasRepeatedCharPattern(inputWord, keywordWord)) {
    threshold -= 0.15;
  }

  return Math.max(0.4, threshold); // Minimum threshold là 0.4
}

/**
 * Kiểm tra xem có phải lỗi chính tả không - Cải thiện
 */
function isLikelyTypo(userInput, threshold = 0.6) {
  const normalizedInput = normalizeString(userInput);

  // Kiểm tra xem có từ khóa nào khớp chính xác không
  for (const keyword of COMMON_KEYWORDS) {
    const normalizedKeyword = normalizeString(keyword);
    if (normalizedInput === normalizedKeyword) {
      // Nếu khớp chính xác, không phải lỗi chính tả
      return {
        isTypo: false,
        suggestions: [],
      };
    }
  }

  // Sử dụng threshold thấp hơn để phát hiện nhiều lỗi hơn
  const suggestions = getSuggestions(userInput, 0.4);

  // Lọc thêm để đảm bảo chất lượng gợi ý
  const filteredSuggestions = suggestions.filter((s) => {
    // Chấp nhận nếu độ tương đồng >= 0.5 hoặc có pattern lặp ký tự
    return (
      s.similarity >= 0.5 ||
      hasRepeatedCharPattern(
        normalizeString(userInput),
        normalizeString(s.keyword),
      )
    );
  });

  return {
    isTypo: filteredSuggestions.length > 0,
    suggestions: filteredSuggestions.map((s) => ({
      keyword: s.keyword,
      confidence: Math.round(s.similarity * 100),
      reason:
        s.type === "full_match"
          ? "Tương tự toàn bộ cụm từ"
          : `Từ "${s.inputWord}" tương tự "${s.matchedWord}"`,
    })),
  };
}

/**
 * Lấy danh sách từ khóa phổ biến theo loại
 */
function getCommonKeywordsByType(ledgerType) {
  const keywordsByType = {
    CHI_PHI: [
      "TIEN LUONG",
      "LUONG",
      "SALARY",
      "THU LAO",
      "THUONG",
      "PHU CAP",
      "BAO HIEM XA HOI",
      "BHXH",
      "BAO HIEM Y TE",
      "BHYT",
      "DIEN",
      "NUOC",
      "INTERNET",
      "DIEN THOAI",
      "THUE NHA",
      "VAN PHONG PHAM",
      "XE CONG",
      "XANG",
      "BAO DUONG",
      "SUA CHUA",
      "PARKING",
      "CAFE",
      "AN TRUA",
      "QUANG CAO",
      "MARKETING",
      "TRUYEN THONG",
      "SEO",
      "FACEBOOK ADS",
      "GOOGLE ADS",
      "THUE",
      "PHI",
      "LE PHI",
      "KE TOAN",
      "KIEM TOAN",
      "PHOTOCOPY",
      "IN AN",
      "OFFICE",
      "SUPPLIES",
      "TRAINING",
      "COURSE",
    ],
    DOANH_THU: [
      "DOANH THU",
      "BAN HANG",
      "DICH VU",
      "HOA HONG",
      "LAI SUAT",
      "TIEN LAI",
      "THUE GTGT",
      "VAT",
      "HOAN THUE",
      "KHAU TRU",
      "THUE THU NHAP",
      "TIEN MAT",
      "CHUYEN KHOAN",
      "THE",
      "VISA",
      "MASTERCARD",
    ],
    TAI_SAN: [
      "MAY TINH",
      "LAPTOP",
      "COMPUTER",
      "BAN GHE",
      "TU LANH",
      "MAY LANH",
      "NOI THAT",
      "XE MAY",
      "O TO",
      "THIET BI",
      "CONG CU",
      "MAY IN",
      "SCANNER",
      "TABLET",
      "CAMERA",
      "MAY CHIEU",
      "MAN HINH",
      "BAN",
      "GHE",
      "TU",
      "KE",
      "DEN",
      "QUAT",
      "DIEU HOA",
      "FURNITURE",
      "EQUIPMENT",
    ],
    CONG_NO: [
      "CONG NO",
      "PHAI THU",
      "PHAI TRA",
      "VAY",
      "CHO VAY",
      "LAI VAY",
      "KHACH HANG",
      "NHA CUNG CAP",
      "DOI TAC",
      "NGAN HANG",
      "TIN DUNG",
      "THE TIN DUNG",
      "VAY VON",
      "GOC",
      "LAI",
      "PHAT",
      "PHI TRE HAN",
      "VIETCOMBANK",
      "TECHCOMBANK",
      "BIDV",
      "AGRIBANK",
    ],
  };

  return keywordsByType[ledgerType] || COMMON_KEYWORDS;
}

module.exports = {
  getSuggestions,
  isLikelyTypo,
  getCommonKeywordsByType,
  normalizeString,
  similarity,
};
