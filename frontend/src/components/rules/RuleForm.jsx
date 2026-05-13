import React, { useRef } from "react";
import { LEDGER_TYPE_LABELS } from "../../utils/format";
import KeywordSuggestions from "./KeywordSuggestions";

export default function RuleForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editing,
}) {
  const keywordsInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={headerStyle}>{editing ? "Sửa Rule" : "Tạo Rule Mới"}</h3>

      <div style={gridStyle}>
        <div>
          <label style={labelStyle}>Tên rule *</label>
          <input
            required
            value={formData.rule_name}
            onChange={(e) =>
              setFormData({ ...formData, rule_name: e.target.value })
            }
            style={inputStyle}
            placeholder="VD: Lương nhân viên"
          />
        </div>

        <div>
          <label style={labelStyle}>Từ khóa (cách nhau bởi |) *</label>
          <input
            ref={keywordsInputRef}
            required
            value={formData.keywords}
            onChange={(e) =>
              setFormData({ ...formData, keywords: e.target.value })
            }
            style={inputStyle}
            placeholder="VD: LUONG|SALARY|THU LAO"
          />
          <KeywordSuggestions
            keywords={formData.keywords}
            ledgerType={formData.ledger_type}
            inputRef={keywordsInputRef}
            onKeywordsChange={(newKeywords) =>
              setFormData({ ...formData, keywords: newKeywords })
            }
          />
        </div>

        <div>
          <label style={labelStyle}>TK Nợ *</label>
          <input
            required
            value={formData.debit_account}
            onChange={(e) =>
              setFormData({ ...formData, debit_account: e.target.value })
            }
            style={inputStyle}
            placeholder="VD: 334"
          />
        </div>

        <div>
          <label style={labelStyle}>TK Có *</label>
          <input
            required
            value={formData.credit_account}
            onChange={(e) =>
              setFormData({ ...formData, credit_account: e.target.value })
            }
            style={inputStyle}
            placeholder="VD: 112"
          />
        </div>

        <div>
          <label style={labelStyle}>Loại sổ *</label>
          <select
            value={formData.ledger_type}
            onChange={(e) =>
              setFormData({ ...formData, ledger_type: e.target.value })
            }
            style={inputStyle}
          >
            {Object.keys(LEDGER_TYPE_LABELS).map((k) => (
              <option key={k} value={k}>
                {LEDGER_TYPE_LABELS[k].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Dấu số tiền</label>
          <select
            value={formData.amount_sign}
            onChange={(e) =>
              setFormData({ ...formData, amount_sign: e.target.value })
            }
            style={inputStyle}
          >
            <option value="ANY">± Bất kỳ (thu hoặc chi)</option>
            <option value="POSITIVE">+ Dương (thu tiền)</option>
            <option value="NEGATIVE">− Âm (chi tiền)</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Độ ưu tiên (số nhỏ = cao hơn)</label>
          <input
            type="number"
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: parseInt(e.target.value),
              })
            }
            style={inputStyle}
          />
        </div>
      </div>

      <div style={buttonGroupStyle}>
        <button type="submit" style={btnStyle("#10b981")}>
          {editing ? "Cập nhật" : "Tạo mới"}
        </button>
        <button type="button" onClick={onCancel} style={btnStyle("#6b7280")}>
          Hủy
        </button>
      </div>
    </form>
  );
}

const formStyle = {
  padding: 20,
  background: "#f9fafb",
  borderRadius: 8,
  marginBottom: 24,
  border: "1px solid #e5e7eb",
};

const headerStyle = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

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

const buttonGroupStyle = {
  marginTop: 16,
  display: "flex",
  gap: 12,
};

const btnStyle = (bg) => ({
  padding: "10px 20px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 14,
});
