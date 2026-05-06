import React from "react";
import { LEDGER_FILTER_OPTIONS } from "../utils/format";

export default function LedgerFilter({ filters, onFilterChange, onApply }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 12,
        marginBottom: 24,
        padding: 16,
        background: "#f9fafb",
        borderRadius: 8,
      }}
    >
      <div>
        <label style={labelStyle}>Loại sổ</label>
        <select
          value={filters.ledger_type}
          onChange={(e) =>
            onFilterChange({ ...filters, ledger_type: e.target.value })
          }
          style={inputStyle}
        >
          {Object.keys(LEDGER_FILTER_OPTIONS).map((k) => (
            <option key={k} value={k}>
              {LEDGER_FILTER_OPTIONS[k].label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Từ ngày</label>
        <input
          type="date"
          value={filters.from_date}
          onChange={(e) =>
            onFilterChange({ ...filters, from_date: e.target.value })
          }
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Đến ngày</label>
        <input
          type="date"
          value={filters.to_date}
          onChange={(e) =>
            onFilterChange({ ...filters, to_date: e.target.value })
          }
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <button onClick={onApply} style={btnStyle}>
          🔍 Lọc
        </button>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 4,
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
};

const btnStyle = {
  padding: "8px 16px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
};
