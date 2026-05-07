import React, { useState, useEffect } from "react";
import {
  getPartners,
  createPartner,
  updatePartner,
  deletePartner,
} from "../api/client";
import toast from "react-hot-toast";

const PARTNER_TYPE_LABELS = {
  NCC: { label: "Nhà cung cấp", color: "#f59e0b", bg: "#fffbeb" },
  KH: { label: "Khách hàng", color: "#3b82f6", bg: "#eff6ff" },
  NGAN_HANG: { label: "Ngân hàng", color: "#8b5cf6", bg: "#f5f3ff" },
  KHAC: { label: "Khác", color: "#6b7280", bg: "#f9fafb" },
};

export default function PartnersManager() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    partner_name: "",
    keywords: "",
    default_account: "",
    partner_type: "KHAC",
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const { data } = await getPartners();
      setPartners(data);
    } catch {
      toast.error("Không thể tải danh sách đối tác");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updatePartner(editing, formData);
        toast.success("Đã cập nhật đối tác");
      } else {
        await createPartner(formData);
        toast.success("Đã tạo đối tác mới");
      }
      resetForm();
      loadPartners();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi lưu đối tác");
    }
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setFormData({
      partner_name: p.partner_name,
      keywords: p.keywords,
      default_account: p.default_account || "",
      partner_type: p.partner_type,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa đối tác này?")) return;
    try {
      await deletePartner(id);
      toast.success("Đã xóa đối tác");
      loadPartners();
    } catch {
      toast.error("Không thể xóa đối tác");
    }
  };

  const handleToggle = async (p) => {
    try {
      await updatePartner(p.id, { is_active: p.is_active ? 0 : 1 });
      toast.success(p.is_active ? "Đã tắt đối tác" : "Đã bật đối tác");
      loadPartners();
    } catch {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({
      partner_name: "",
      keywords: "",
      default_account: "",
      partner_type: "KHAC",
    });
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
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
            Quản lý Đối tác
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0 0" }}>
            Ánh xạ tên đối tác tự động từ nội dung giao dịch
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={btnStyle("#3b82f6")}
        >
          {showForm ? "Đóng" : "Thêm đối tác"}
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
            {editing ? "Sửa đối tác" : "Thêm đối tác mới"}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <label style={labelStyle}>Tên đối tác *</label>
              <input
                required
                value={formData.partner_name}
                onChange={(e) =>
                  setFormData({ ...formData, partner_name: e.target.value })
                }
                style={inputStyle}
                placeholder="VD: Điện lực EVN"
              />
            </div>
            <div>
              <label style={labelStyle}>
                Từ khóa nhận diện (cách nhau bởi |) *
              </label>
              <input
                required
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
                style={inputStyle}
                placeholder="VD: EVN|DIEN LUC|CONG TY DIEN"
              />
            </div>
            <div>
              <label style={labelStyle}>TK mặc định</label>
              <input
                value={formData.default_account}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    default_account: e.target.value,
                  })
                }
                style={inputStyle}
                placeholder="VD: 642"
              />
            </div>
            <div>
              <label style={labelStyle}>Loại đối tác</label>
              <select
                value={formData.partner_type}
                onChange={(e) =>
                  setFormData({ ...formData, partner_type: e.target.value })
                }
                style={inputStyle}
              >
                {Object.entries(PARTNER_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button type="submit" style={btnStyle("#10b981")}>
              {editing ? "Cập nhật" : "Tạo mới"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              style={btnStyle("#6b7280")}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Partners table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Đang tải...
        </div>
      ) : partners.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          Chưa có đối tác nào. Hãy thêm đối tác để tự động nhận diện từ sao kê.
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
                <th style={thStyle}>Tên đối tác</th>
                <th style={thStyle}>Từ khóa</th>
                <th style={thStyle}>TK mặc định</th>
                <th style={thStyle}>Loại</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {p.partner_name}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontSize: 12,
                      color: "#6b7280",
                      maxWidth: 250,
                    }}
                  >
                    {p.keywords}
                  </td>
                  <td style={tdStyle}>{p.default_account || "—"}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        background: PARTNER_TYPE_LABELS[p.partner_type]?.bg,
                        color: PARTNER_TYPE_LABELS[p.partner_type]?.color,
                      }}
                    >
                      {PARTNER_TYPE_LABELS[p.partner_type]?.label}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleToggle(p)}
                      style={{
                        padding: "4px 12px",
                        background: p.is_active ? "#10b981" : "#d1d5db",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {p.is_active ? "Bật" : "Tắt"}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => handleEdit(p)}
                        style={actionBtn("#3b82f6")}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={actionBtn("#ef4444")}
                      >
                        Xóa
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
const tdStyle = { padding: "12px 8px", color: "#1f2937" };
const actionBtn = (bg) => ({
  padding: "4px 8px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 12,
});
