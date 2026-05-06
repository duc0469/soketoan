import React, { useState } from "react";
import {
  formatCurrency,
  formatDate,
  LEDGER_TYPE_LABELS,
  STATUS_LABELS,
} from "../utils/format";
import { suggestRule, createRule, getTransactionLogs } from "../api/client";
import toast from "react-hot-toast";

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
  onRuleCreated,
}) {
  const isConfirmed = transaction.status === "CONFIRMED";
  const [showNote, setShowNote] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestedRule, setSuggestedRule] = useState(null);

  const handleShowLogs = async () => {
    if (showLogs) {
      setShowLogs(false);
      return;
    }
    setLoadingLogs(true);
    try {
      const { data } = await getTransactionLogs(transaction.id);
      setLogs(data);
      setShowLogs(true);
    } catch {
      toast.error("Không thể tải lịch sử");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSuggestRule = async () => {
    try {
      const { data } = await suggestRule(transaction.id);
      setSuggestedRule(data.suggested_rule);
      setShowSuggest(true);
    } catch {
      toast.error("Không thể gợi ý rule");
    }
  };

  const handleCreateSuggestedRule = async () => {
    try {
      await createRule(suggestedRule);
      toast.success("Đã tạo rule mới từ giao dịch này!");
      setShowSuggest(false);
      if (onRuleCreated) onRuleCreated();
    } catch {
      toast.error("Không thể tạo rule");
    }
  };

  return (
    <>
      <tr
        style={{
          borderBottom:
            showNote || showLogs || showSuggest ? "none" : "1px solid #e5e7eb",
          background: isSelected
            ? "#eff6ff"
            : transaction.is_manual
              ? "#fffbeb"
              : "#fff",
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
            maxWidth: 350,
            fontSize: 12,
            wordBreak: "break-word",
            whiteSpace: "normal",
            lineHeight: "1.4",
          }}
        >
          <div>{transaction.description}</div>
          {transaction.partner_name && (
            <div style={{ marginTop: 2 }}>
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 6px",
                  background: "#eff6ff",
                  color: "#3b82f6",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                🤝 {transaction.partner_name}
              </span>
            </div>
          )}
          {transaction.note && (
            <div
              style={{
                marginTop: 2,
                fontSize: 11,
                color: "#6b7280",
                fontStyle: "italic",
              }}
            >
              📝 {transaction.note}
            </div>
          )}
        </td>
        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
          <span
            style={{ color: transaction.amount >= 0 ? "#10b981" : "#ef4444" }}
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
                onEditDataChange({
                  ...editData,
                  credit_account: e.target.value,
                })
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
                  LEDGER_TYPE_LABELS[transaction.ledger_type]?.color ||
                  "#6b7280",
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
          {transaction.is_manual === 1 && (
            <span
              style={{ marginLeft: 4, fontSize: 10, color: "#f59e0b" }}
              title="Đã sửa tay"
            >
              ✏️
            </span>
          )}
        </td>
        <td style={tdStyle}>
          {isEditing ? (
            <div>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                <button onClick={onSave} style={btnStyle("#10b981")}>
                  💾
                </button>
                <button onClick={onCancel} style={btnStyle("#6b7280")}>
                  ✕
                </button>
              </div>
              <textarea
                placeholder="Ghi chú..."
                value={editData.note || ""}
                onChange={(e) =>
                  onEditDataChange({ ...editData, note: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "4px 8px",
                  border: "1px solid #d1d5db",
                  borderRadius: 4,
                  fontSize: 12,
                  resize: "vertical",
                  minHeight: 40,
                }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <button
                onClick={() => onEdit(transaction)}
                disabled={isConfirmed}
                style={btnStyle(isConfirmed ? "#d1d5db" : "#3b82f6")}
                title="Sửa"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(transaction.id)}
                disabled={isConfirmed}
                style={btnStyle(isConfirmed ? "#d1d5db" : "#ef4444")}
                title="Xóa"
              >
                🗑️
              </button>
              <button
                onClick={handleShowLogs}
                style={btnStyle("#8b5cf6")}
                title="Lịch sử thay đổi"
              >
                📋
              </button>
              {transaction.is_manual === 1 && !isConfirmed && (
                <button
                  onClick={handleSuggestRule}
                  style={btnStyle("#f59e0b")}
                  title="Tạo rule từ giao dịch này"
                >
                  💡
                </button>
              )}
            </div>
          )}
        </td>
      </tr>

      {/* Audit log row */}
      {showLogs && (
        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
          <td
            colSpan={9}
            style={{ padding: "8px 16px", background: "#f5f3ff" }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#7c3aed",
                marginBottom: 6,
              }}
            >
              📋 Lịch sử thay đổi
            </div>
            {loadingLogs ? (
              <div style={{ color: "#9ca3af", fontSize: 12 }}>Đang tải...</div>
            ) : logs.length === 0 ? (
              <div style={{ color: "#9ca3af", fontSize: 12 }}>
                Chưa có thay đổi nào được ghi lại.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  fontSize: 12,
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ color: "#6b7280" }}>
                    <th style={{ textAlign: "left", padding: "4px 8px" }}>
                      Trường
                    </th>
                    <th style={{ textAlign: "left", padding: "4px 8px" }}>
                      Giá trị cũ
                    </th>
                    <th style={{ textAlign: "left", padding: "4px 8px" }}>
                      Giá trị mới
                    </th>
                    <th style={{ textAlign: "left", padding: "4px 8px" }}>
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "4px 8px", fontWeight: 600 }}>
                        {log.field_changed}
                      </td>
                      <td style={{ padding: "4px 8px", color: "#ef4444" }}>
                        {log.old_value || "—"}
                      </td>
                      <td style={{ padding: "4px 8px", color: "#10b981" }}>
                        {log.new_value || "—"}
                      </td>
                      <td style={{ padding: "4px 8px", color: "#6b7280" }}>
                        {new Date(log.changed_at).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}

      {/* Smart rule suggestion row */}
      {showSuggest && suggestedRule && (
        <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
          <td
            colSpan={9}
            style={{
              padding: "12px 16px",
              background: "#fffbeb",
              border: "1px solid #f59e0b",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#92400e",
                marginBottom: 8,
              }}
            >
              💡 Gợi ý tạo rule mới từ giao dịch này
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {[
                ["Tên rule", suggestedRule.rule_name],
                ["Từ khóa", suggestedRule.keywords],
                ["TK Nợ", suggestedRule.debit_account],
                ["TK Có", suggestedRule.credit_account],
                ["Loại sổ", suggestedRule.ledger_type],
                ["Dấu ST", suggestedRule.amount_sign],
              ].map(([label, val]) => (
                <div key={label} style={{ fontSize: 12 }}>
                  <span style={{ color: "#6b7280" }}>{label}: </span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleCreateSuggestedRule}
                style={{
                  ...btnStyle("#10b981"),
                  padding: "6px 14px",
                  fontSize: 13,
                }}
              >
                ✅ Tạo rule này
              </button>
              <button
                onClick={() => setShowSuggest(false)}
                style={{
                  ...btnStyle("#6b7280"),
                  padding: "6px 14px",
                  fontSize: 13,
                }}
              >
                ✕ Bỏ qua
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const tdStyle = {
  padding: "12px 8px",
  color: "#1f2937",
  verticalAlign: "top",
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
