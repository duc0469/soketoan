import React, { useState, useRef, useEffect } from "react";
import { updateProfile, changePassword } from "../../api/client";
import toast from "react-hot-toast";

export default function UserMenu({ user, onLogout, onUserUpdate }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null); // "profile" | "password" | null
  const [profileName, setProfileName] = useState(user.full_name || "");
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return toast.error("Tên không được để trống");
    setLoading(true);
    try {
      await updateProfile({ full_name: profileName.trim() });
      toast.success("Đã cập nhật tên");
      onUserUpdate({ ...user, full_name: profileName.trim() });
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password.length < 6)
      return toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
    if (pwForm.new_password !== pwForm.confirm)
      return toast.error("Mật khẩu xác nhận không khớp");
    setLoading(true);
    try {
      await changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success("Đã đổi mật khẩu thành công");
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const displayName = user.full_name || user.email;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Avatar button */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 8,
            padding: "8px 14px",
            cursor: "pointer",
            color: "#fff",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {initials}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{displayName}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{user.email}</div>
          </div>
          <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? "^" : "v"}</span>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              minWidth: 200,
              zIndex: 1000,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
          >
            {/* User info */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #f3f4f6",
                background: "#f9fafb",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>
                {displayName}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                {user.email}
              </div>
            </div>

            {/* Menu items */}
            {[
              {
                label: "Cập nhật tên",
                action: () => {
                  setProfileName(user.full_name || "");
                  setModal("profile");
                  setOpen(false);
                },
              },
              {
                label: "Đổi mật khẩu",
                action: () => {
                  setModal("password");
                  setOpen(false);
                },
              },
              {
                label: "Đăng xuất",
                action: onLogout,
                danger: true,
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 14,
                  color: item.danger ? "#ef4444" : "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderTop: item.danger ? "1px solid #f3f4f6" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = item.danger
                    ? "#fef2f2"
                    : "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: Cập nhật tên ── */}
      {modal === "profile" && (
        <Modal title="Cập nhật tên hiển thị" onClose={() => setModal(null)}>
          <form onSubmit={handleUpdateProfile}>
            <label style={labelStyle}>Họ và tên</label>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              style={inputStyle}
              placeholder="Nhập tên của bạn"
              autoFocus
            />
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                type="submit"
                disabled={loading}
                style={btnStyle("#667eea")}
              >
                {loading ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                style={btnStyle("#6b7280")}
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal: Đổi mật khẩu ── */}
      {modal === "password" && (
        <Modal title="Đổi mật khẩu" onClose={() => setModal(null)}>
          <form onSubmit={handleChangePassword}>
            {[
              {
                label: "Mật khẩu hiện tại",
                key: "current_password",
                placeholder: "Nhập mật khẩu hiện tại",
              },
              {
                label: "Mật khẩu mới",
                key: "new_password",
                placeholder: "Ít nhất 6 ký tự",
              },
              {
                label: "Xác nhận mật khẩu mới",
                key: "confirm",
                placeholder: "Nhập lại mật khẩu mới",
              },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  type="password"
                  value={pwForm[f.key]}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, [f.key]: e.target.value })
                  }
                  placeholder={f.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={btnStyle("#667eea")}
              >
                {loading ? "Đang lưu..." : "Đổi mật khẩu"}
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                style={btnStyle("#6b7280")}
              >
                Hủy
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

// ── Modal wrapper ──────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 28,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: 0,
              color: "#1f2937",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#9ca3af",
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};
const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box",
};
const btnStyle = (bg) => ({
  padding: "10px 20px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
});
