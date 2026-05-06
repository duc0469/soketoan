import React, { useState, useEffect } from "react";
import { getLedgers, getLedgerSummary } from "../api/client";
import {
  formatCurrency,
  formatDate,
  LEDGER_TYPE_LABELS,
} from "../utils/format";
import toast from "react-hot-toast";
import LedgerSummary from "./LedgerSummary";
import ExportButton from "./ExportButton";

export default function DeductibleExpensesView({ refreshTrigger }) {
  const [ledgers, setLedgers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    ledger_type: "CHI_PHI_DUOC_TRU",
    from_date: "",
    to_date: "",
  });

  useEffect(() => {
    // If refreshTrigger is negative, clear data (new file uploaded, no confirmation yet)
    if (refreshTrigger < 0) {
      setLedgers([]);
      setSummary(null);
    } else if (refreshTrigger > 0) {
      // Only load data when refreshTrigger is positive (after confirmation)
      // Don't load on initial mount (refreshTrigger = 0)
      loadData();
    }
    // If refreshTrigger = 0 (initial state), do nothing (keep empty state)
  }, [refreshTrigger]); // Reload when refreshTrigger changes

  const loadData = async () => {
    setLoading(true);
    try {
      const [ledgerRes, summaryRes] = await Promise.all([
        getLedgers(filters),
        getLedgerSummary(filters),
      ]);
      setLedgers(ledgerRes.data.data);
      setSummary(summaryRes.data);
    } catch (err) {
      toast.error("Không thể tải dữ liệu chi phí được trừ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            💰 Chi Phí Được Trừ
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "8px 0 0 0" }}>
            Các khoản chi phí được khấu trừ thuế (TK Nợ bắt đầu bằng 6)
          </p>
        </div>
        <ExportButton filters={filters} />
      </div>

      {/* Date Filter */}
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
          <label style={labelStyle}>Từ ngày</label>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e) =>
              setFilters({ ...filters, from_date: e.target.value })
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
              setFilters({ ...filters, to_date: e.target.value })
            }
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={loadData} style={btnStyle}>
            🔍 Lọc
          </button>
        </div>
      </div>

      <LedgerSummary summary={summary} />

      {/* Ledger Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Đang tải...
        </div>
      ) : ledgers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Chưa có dữ liệu chi phí được trừ. Hãy xác nhận giao dịch trước.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead
              style={{
                background: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <tr>
                <th style={thStyle}>Ngày</th>
                <th style={thStyle}>Nội dung</th>
                <th style={thStyle}>TK Nợ</th>
                <th style={thStyle}>TK Có</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Tiền ra</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Tiền vào</th>
                <th style={thStyle}>Loại sổ</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}>{formatDate(row.entry_date)}</td>
                  <td style={{ ...tdStyle, maxWidth: 300, fontSize: 12 }}>
                    {row.description}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        background: "#fee2e2",
                        color: "#dc2626",
                      }}
                    >
                      {row.debit_account}
                    </span>
                  </td>
                  <td style={tdStyle}>{row.credit_account}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#ef4444",
                    }}
                  >
                    {row.amount < 0 ? formatCurrency(Math.abs(row.amount)) : ""}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 600,
                      color: "#10b981",
                    }}
                  >
                    {row.amount > 0 ? formatCurrency(row.amount) : ""}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        background: LEDGER_TYPE_LABELS[row.ledger_type]?.bg,
                        color: LEDGER_TYPE_LABELS[row.ledger_type]?.color,
                      }}
                    >
                      {LEDGER_TYPE_LABELS[row.ledger_type]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

const thStyle = {
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: 600,
  color: "#374151",
  fontSize: 13,
};

const tdStyle = {
  padding: "12px 8px",
  color: "#1f2937",
};
