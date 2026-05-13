import React, { useState, useEffect } from "react";
import { getRules, createRule, updateRule, deleteRule } from "../../api/client";
import RuleForm from "./RuleForm";
import RulesList from "./RulesList";
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

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await updateRule(editing, data);
        toast.success("Đã cập nhật rule");
      } else {
        await createRule(data);
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
      <div style={headerStyle}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý Rules</h2>
        <button onClick={() => setShowForm(!showForm)} style={addButtonStyle}>
          {showForm ? "Đóng" : "Thêm Rule"}
        </button>
      </div>

      {showForm && (
        <RuleForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          editing={editing}
        />
      )}

      <RulesList
        rules={rules}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
};

const addButtonStyle = {
  padding: "10px 20px",
  background: "#3b82f6",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
};
