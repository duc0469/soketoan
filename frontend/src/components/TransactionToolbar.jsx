import React from "react";

export default function TransactionToolbar({
  selectedCount,
  totalCount,
  onConfirmSelected,
}) {
  return (
    <div
      style={{
        marginBottom: 16,
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <button
        onClick={onConfirmSelected}
        disabled={selectedCount === 0}
        style={{
          padding: "10px 20px",
          background: selectedCount > 0 ? "#10b981" : "#d1d5db",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 600,
          cursor: selectedCount > 0 ? "pointer" : "not-allowed",
        }}
      >
        ✓ Xác nhận {selectedCount > 0 ? `(${selectedCount})` : ""}
      </button>
      <span style={{ color: "#6b7280", fontSize: 14 }}>
        Tổng: {totalCount} giao dịch
      </span>
    </div>
  );
}
