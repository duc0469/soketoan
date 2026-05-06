import React from "react";
import {
  formatCurrency,
  formatDate,
  LEDGER_TYPE_LABELS,
  STATUS_LABELS,
} from "../utils/format";

export default function TransactionRow({
  transaction,
  isEditing,
  editData,
  isSelected,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleSelect,
  onEditDataChange,
}) {
  const isConfirmed = transaction.status === "CONFIRMED";

  return (
    <tr
      style={{
        borderBottom: "1px solid #e5e7eb",
        background: isSelected ? "#eff6ff" : "#fff",
      }}
    >
      <td style={tdStyle}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(transaction.id)}
          disabled={isConfirmed}
        />
      </td>
      <td style={tdStyle}>{formatDate(transaction.trans_date)}</td>
      <td
        style={{
          ...tdStyle,
          maxWidth: 400,
          fontSize: 12,
          wordBreak: "break-word",
          whiteSpace: "normal",
          lineHeight: "1.4",
        }}
      >
        {transaction.description}
      </td>
      <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
        <span
          style={{
            color: transaction.amount >= 0 ? "#10b981" : "#ef4444",
          }}
        >
          {formatCurrency(transaction.amount)}
        </span>
      </td>
      <td style={tdStyle}>
        {isEditing ? (
          <input
            value={editData.debit_account}
            onChange={(e) =>
              onEditDataChange({ ...editData, debit_account: e.target.value })
            }
            style={inputStyle}
          />
        ) : (
          transaction.debit_account || "—"
        )}
      </td>
      <td style={tdStyle}>
        {isEditing ? (
          <input
            value={editData.credit_account}
            onChange={(e) =>
              onEditDataChange({ ...editData, credit_account: e.target.value })
            }
            style={inputStyle}
          />
        ) : (
          transaction.credit_account || "—"
        )}
      </td>
      <td style={tdStyle}>
        {isEditing ? (
          <select
            value={editData.ledger_type}
            onChange={(e) =>
              onEditDataChange({ ...editData, ledger_type: e.target.value })
            }
            style={inputStyle}
          >
            {Object.keys(LEDGER_TYPE_LABELS).map((k) => (
              <option key={k} value={k}>
                {LEDGER_TYPE_LABELS[k].label}
              </option>
            ))}
          </select>
        ) : (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              background:
                LEDGER_TYPE_LABELS[transaction.ledger_type]?.bg || "#f9fafb",
              color:
                LEDGER_TYPE_LABELS[transaction.ledger_type]?.color || "#6b7280",
            }}
          >
            {LEDGER_TYPE_LABELS[transaction.ledger_type]?.label ||
              transaction.ledger_type}
          </span>
        )}
      </td>
      <td style={tdStyle}>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            background: STATUS_LABELS[transaction.status]?.bg || "#f9fafb",
            color: STATUS_LABELS[transaction.status]?.color || "#6b7280",
          }}
        >
          {STATUS_LABELS[transaction.status]?.label || transaction.status}
        </span>
      </td>
      <td style={tdStyle}>
        {isEditing ? (
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={onSave} style={btnStyle("#10b981")}>
              💾
            </button>
            <button onClick={onCancel} style={btnStyle("#6b7280")}>
              ✕
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => onEdit(transaction)}
              disabled={isConfirmed}
              style={btnStyle(isConfirmed ? "#d1d5db" : "#3b82f6")}
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              disabled={isConfirmed}
              style={btnStyle(isConfirmed ? "#d1d5db" : "#ef4444")}
            >
              🗑️
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

const tdStyle = {
  padding: "12px 8px",
  color: "#1f2937",
};

const inputStyle = {
  width: "100%",
  padding: "4px 8px",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  fontSize: 13,
};

const btnStyle = (bg) => ({
  padding: "4px 8px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: bg === "#d1d5db" ? "not-allowed" : "pointer",
  fontSize: 12,
});
