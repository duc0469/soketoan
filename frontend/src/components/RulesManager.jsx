import React, { useState, useEffect } from "react";
import { getRules, createRule, updateRule, deleteRule } from "../api/client";
import { LEDGER_TYPE_LABELS } from "../utils/format";
import toast from "react-hot-toast";

export default function RulesManager() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: "",
    keywords: "",
    debit_account: "",
    credit_account: "",
    ledger_type: "CHI_PHI",
    amount_sign: "ANY",
    priority: 10,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const { data } = await getRules();
      setRules(data);
    } catch (err) {
      toast.error("Không thể tải rules");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateRule(editing, formData);
        toast.success("Đã cập nhật rule");
      } else {
        await createRule(formData);
        toast.success("Đã tạo rule mới");
      }
      resetForm();
      loadRules();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi lưu rule");
    }
  };

  const handleEdit = (rule) => {
    setEditing(rule.id);
    setFormData({
      rule_name: rule.rule_name,
      keywords: rule.keywords,
      debit_account: rule.debit_account,
      credit_account: rule.credit_account,
      ledger_type: rule.ledger_type,
      amount_sign: rule.amount_sign,
      priority: rule.priority,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa rule này?")) return;
    try {
      await deleteRule(id);
      toast.success("Đã xóa rule");
      loadRules();
    } catch (err) {
      toast.error("Không thể xóa rule");
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      await updateRule(rule.id, { is_active: rule.is_active ? 0 : 1 });
      toast.success(rule.is_active ? "Đã tắt rule" : "Đã bật rule");
      loadRules();
    } catch (err) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({
      rule_name: "",
      keywords: "",
      debit_account: "",
      credit_account: "",
      ledger_type: "CHI_PHI",
      amount_sign: "ANY",
      priority: 10,
    });
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
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>⚙️ Quản lý Rules</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showForm ? "✕ Đóng" : "+ Thêm Rule"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: 20,
            background: "#f9fafb",
            borderRadius: 8,
            marginBottom: 24,
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            {editing ? "Sửa Rule" : "Tạo Rule Mới"}
          </h3>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
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
                required
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                style={inputStyle}
                placeholder="VD: LUONG|SALARY|THU LAO"
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
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button type="submit" style={btnStyle("#10b981")}>
              {editing ? "💾 Cập nhật" : "➕ Tạo mới"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={btnStyle("#6b7280")}
            >
              ✕ Hủy
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Đang tải...
        </div>
      ) : rules.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Chưa có rule nào. Hãy tạo rule đầu tiên.
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
                <tr key={rule.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}>{rule.priority}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {rule.rule_name}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12, maxWidth: 200 }}>
                    {rule.keywords}
                  </td>
                  <td style={tdStyle}>{rule.debit_account}</td>
                  <td style={tdStyle}>{rule.credit_account}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        background: LEDGER_TYPE_LABELS[rule.ledger_type]?.bg,
                        color: LEDGER_TYPE_LABELS[rule.ledger_type]?.color,
                      }}
                    >
                      {LEDGER_TYPE_LABELS[rule.ledger_type]?.label}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 14,
                        fontWeight: 700,
                        background:
                          rule.amount_sign === "NEGATIVE"
                            ? "#fee2e2"
                            : rule.amount_sign === "POSITIVE"
                              ? "#d1fae5"
                              : "#f3f4f6",
                        color:
                          rule.amount_sign === "NEGATIVE"
                            ? "#ef4444"
                            : rule.amount_sign === "POSITIVE"
                              ? "#10b981"
                              : "#6b7280",
                      }}
                    >
                      {rule.amount_sign === "NEGATIVE"
                        ? "− Chi"
                        : rule.amount_sign === "POSITIVE"
                          ? "+ Thu"
                          : "± Bất kỳ"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleToggleActive(rule)}
                      style={{
                        padding: "4px 12px",
                        background: rule.is_active ? "#10b981" : "#d1d5db",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {rule.is_active ? "Bật" : "Tắt"}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => handleEdit(rule)}
                        style={actionBtn("#3b82f6")}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        style={actionBtn("#ef4444")}
                      >
                        🗑️
                      </button>
                    </div>
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
