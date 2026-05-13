import React, { useState, useEffect } from "react";
import { getPartnerTransactions } from "../../api/client";
import { formatCurrency, formatDate } from "../../utils/format";
import toast from "react-hot-toast";

export default function PartnerBalanceView({ refreshTrigger, isActive }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    partner_name: "",
  });

  useEffect(() => {
    if (refreshTrigger < 0) {
      setTransactions([]);
    } else if (refreshTrigger > 0 && isActive) {
      loadTransactions();
    }
  }, [refreshTrigger, isActive]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await getPartnerTransactions(filters);
      setTransactions(data);
    } catch {
      toast.error("Không thể tải giao dịch công nợ");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilter = () => {
    loadTransactions();
  };

  // Tính tổng hợp
  const summary = transactions.reduce(
    (acc, t) => {
      if (t.amount > 0) {
        acc.totalIn += parseFloat(t.amount);
      } else {
        acc.totalOut += Math.abs(parseFloat(t.amount));
      }
      return acc;
    },
    { totalIn: 0, totalOut: 0 },
  );
  summary.balance = summary.totalIn - summary.totalOut;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          Giao Dịch Công Nợ
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "8px 0 0 0" }}>
          Danh sách chi tiết các giao dịch có gắn mác sổ công nợ
        </p>
      </div>

      {/* Bộ lọc */}
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
          <label style={labelStyle}>Tên đối tác</label>
          <input
            type="text"
            value={filters.partner_name}
            onChange={(e) =>
              handleFilterChange({ ...filters, partner_name: e.target.value })
            }
            placeholder="Tìm theo tên đối tác..."
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Từ ngày</label>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e) =>
              handleFilterChange({ ...filters, from_date: e.target.value })
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
              handleFilterChange({ ...filters, to_date: e.target.value })
            }
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={handleApplyFilter} style={btnStyle}>
            🔍 Lọc
          </button>
        </div>
      </div>

      {refreshTrigger <= 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Chưa có dữ liệu. Hãy xác nhận giao dịch trước.
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Đang tải...
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Không có giao dịch công nợ nào.
        </div>
      ) : (
        <>
          {/* Tổng hợp */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                padding: 16,
                background: "#eff6ff",
                borderRadius: 8,
                border: "2px solid #3b82f6",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Tổng giao dịch
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>
                {transactions.length}
              </div>
            </div>
            <div
              style={{
                padding: 16,
                background: "#ecfdf5",
                borderRadius: 8,
                border: "2px solid #10b981",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Tổng tiền vào
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>
                {formatCurrency(summary.totalIn)}
              </div>
            </div>
            <div
              style={{
                padding: 16,
                background: "#fef2f2",
                borderRadius: 8,
                border: "2px solid #ef4444",
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280" }}>Tổng tiền ra</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444" }}>
                {formatCurrency(summary.totalOut)}
              </div>
            </div>
            <div
              style={{
                padding: 16,
                background: summary.balance >= 0 ? "#ecfdf5" : "#fef2f2",
                borderRadius: 8,
                border: `2px solid ${summary.balance >= 0 ? "#10b981" : "#ef4444"}`,
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280" }}>Số dư</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: summary.balance >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {formatCurrency(Math.abs(summary.balance))}
                <span style={{ fontSize: 11, marginLeft: 4, color: "#9ca3af" }}>
                  {summary.balance > 0
                    ? "(phải thu)"
                    : summary.balance < 0
                      ? "(phải trả)"
                      : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Bảng giao dịch */}
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead
                style={{
                  background: "#f9fafb",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <tr>
                  <th style={thStyle}>Ngày</th>
                  <th style={thStyle}>Đối tác</th>
                  <th style={thStyle}>Nội dung</th>
                  <th style={thStyle}>TK Nợ</th>
                  <th style={thStyle}>TK Có</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Tiền ra</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Tiền vào</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: "#fff",
                    }}
                  >
                    <td style={tdStyle}>{formatDate(t.entry_date)}</td>
                    <td
                      style={{ ...tdStyle, fontWeight: 600, color: "#f59e0b" }}
                    >
                      {t.partner_name || "—"}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 300 }}>
                      {t.description}
                    </td>
                    <td style={tdStyle}>{t.debit_account}</td>
                    <td style={tdStyle}>{t.credit_account}</td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        color: "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {t.amount < 0 ? formatCurrency(Math.abs(t.amount)) : "—"}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    >
                      {t.amount > 0 ? formatCurrency(t.amount) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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

const tdStyle = { padding: "12px 8px", color: "#1f2937" };
