import React from "react";
import { formatCurrency, LEDGER_TYPE_LABELS } from "../../utils/format";

export default function LedgerSummary({ summary }) {
  if (!summary) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
        Tổng hợp
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {summary.by_type.map((item) => (
          <div
            key={item.ledger_type}
            style={{
              padding: 16,
              background: LEDGER_TYPE_LABELS[item.ledger_type]?.bg || "#f9fafb",
              borderRadius: 8,
              border: `2px solid ${LEDGER_TYPE_LABELS[item.ledger_type]?.color || "#e5e7eb"}`,
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
              {LEDGER_TYPE_LABELS[item.ledger_type]?.label || item.ledger_type}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: LEDGER_TYPE_LABELS[item.ledger_type]?.color,
              }}
            >
              {formatCurrency(item.total_amount)}
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              {item.count} giao dịch
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
