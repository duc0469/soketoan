// Format số tiền VND
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format ngày dd/mm/yyyy
export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("vi-VN");
};

// Màu theo loại sổ
export const LEDGER_TYPE_LABELS = {
  CHI_PHI: { label: "Chi phí", color: "#ef4444", bg: "#fef2f2" },
  CHI_PHI_DUOC_TRU: {
    label: "Chi phí được trừ",
    color: "#dc2626",
    bg: "#fee2e2",
  },
  SO_CAI: { label: "Sổ cái", color: "#3b82f6", bg: "#eff6ff" },
  CONG_NO: { label: "Công nợ", color: "#f59e0b", bg: "#fffbeb" },
  TIEN_MAT: { label: "Tiền mặt", color: "#8b5cf6", bg: "#f5f3ff" },
};

// Labels cho filter dropdown (không bao gồm CHI_PHI_DUOC_TRU vì đã là tab riêng, bỏ CONG_NO vì có tab riêng)
export const LEDGER_FILTER_OPTIONS = {
  SO_CAI: { label: "Sổ cái", color: "#3b82f6", bg: "#eff6ff" },
  CHI_PHI: { label: "Chi phí", color: "#ef4444", bg: "#fef2f2" },
  TIEN_MAT: { label: "Tiền mặt", color: "#8b5cf6", bg: "#f5f3ff" },
};

export const STATUS_LABELS = {
  PENDING: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fffbeb" },
  CONFIRMED: { label: "Đã xác nhận", color: "#10b981", bg: "#ecfdf5" },
  REJECTED: { label: "Từ chối", color: "#ef4444", bg: "#fef2f2" },
};
