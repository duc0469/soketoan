import React from "react";
import { LEDGER_TYPE_LABELS } from "../../utils/format";

export default function RulesList({
  rules,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
        Đang tải...
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
        Chưa có rule nào. Hãy tạo rule đầu tiên.
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Ưu tiên</th>
            <th style={thStyle}>Tên rule</th>
            <th style={thStyle}>Từ khóa</th>
            <th style={thStyle}>TK Nợ</th>
            <th style={thStyle}>TK Có</th>
            <th style={thStyle}>Loại sổ</th>
            <th style={thStyle}>Dấu ST</th>
            <th style={thStyle}>Trạng thái</th>
            <th style={thStyle}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RuleRow({ rule, onEdit, onDelete, onToggleActive }) {
  return (
    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
      <td style={tdStyle}>{rule.priority}</td>
      <td style={{ ...tdStyle, fontWeight: 600 }}>{rule.rule_name}</td>
      <td style={{ ...tdStyle, fontSize: 12, maxWidth: 200 }}>
        {rule.keywords}
      </td>
      <td style={tdStyle}>{rule.debit_account}</td>
      <td style={tdStyle}>{rule.credit_account}</td>
      <td style={tdStyle}>
        <span style={getLedgerTypeStyle(rule.ledger_type)}>
          {LEDGER_TYPE_LABELS[rule.ledger_type]?.label}
        </span>
      </td>
      <td style={tdStyle}>
        <span style={getAmountSignStyle(rule.amount_sign)}>
          {getAmountSignLabel(rule.amount_sign)}
        </span>
      </td>
      <td style={tdStyle}>
        <button
          onClick={() => onToggleActive(rule)}
          style={getStatusButtonStyle(rule.is_active)}
        >
          {rule.is_active ? "Bật" : "Tắt"}
        </button>
      </td>
      <td style={tdStyle}>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onEdit(rule)} style={actionBtn("#3b82f6")}>
            Sửa
          </button>
          <button
            onClick={() => onDelete(rule.id)}
            style={actionBtn("#ef4444")}
          >
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
}

function getLedgerTypeStyle(ledgerType) {
  const config = LEDGER_TYPE_LABELS[ledgerType];
  return {
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    background: config?.bg || "#f3f4f6",
    color: config?.color || "#6b7280",
  };
}

function getAmountSignStyle(amountSign) {
  const styles = {
    NEGATIVE: { background: "#fee2e2", color: "#ef4444" },
    POSITIVE: { background: "#d1fae5", color: "#10b981" },
    ANY: { background: "#f3f4f6", color: "#6b7280" },
  };

  return {
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 700,
    ...styles[amountSign],
  };
}

function getAmountSignLabel(amountSign) {
  const labels = {
    NEGATIVE: "− Chi",
    POSITIVE: "+ Thu",
    ANY: "± Bất kỳ",
  };
  return labels[amountSign] || "± Bất kỳ";
}

function getStatusButtonStyle(isActive) {
  return {
    padding: "4px 12px",
    background: isActive ? "#10b981" : "#d1d5db",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  };
}

const containerStyle = {
  overflowX: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const theadStyle = {
  background: "#f9fafb",
  borderBottom: "2px solid #e5e7eb",
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

const actionBtn = (bg) => ({
  padding: "4px 8px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
});
