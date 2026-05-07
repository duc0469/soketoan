import React, { useState } from "react";
import { login, register } from "../api/client";
import toast from "react-hot-toast";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email không hợp lệ";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 6)
      e.password = "Mật khẩu phải có ít nhất 6 ký tự";
    if (mode === "register") {
      if (!form.full_name.trim()) e.full_name = "Vui lòng nhập họ tên";
      if (form.password !== form.confirm_password)
        e.confirm_password = "Mật khẩu xác nhận không khớp";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let res;
      if (mode === "login") {
        res = await login({ email: form.email, password: form.password });
      } else {
        res = await register({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
        });
      }
      const { token, user } = res.data;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      toast.success(
        mode === "login"
          ? `Chào mừng, ${user.full_name || user.email}!`
          : "Đăng ký thành công!",
      );
      onAuthSuccess(user);
    } catch (err) {
      const msg = err.response?.data?.error || "Có lỗi xảy ra";
      toast.error(msg);
      if (msg.includes("Email")) setErrors({ email: msg });
      else if (msg.includes("mật khẩu")) setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setForm({ email: "", password: "", full_name: "", confirm_password: "" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 40,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#1f2937",
              margin: 0,
            }}
          >
            Hệ Thống Kế Toán Tự Động
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
            {mode === "login" ? "Đăng nhập để tiếp tục" : "Tạo tài khoản mới"}
          </p>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: "flex",
            background: "#f3f4f6",
            borderRadius: 8,
            padding: 4,
            marginBottom: 28,
          }}
        >
          {[
            { id: "login", label: "Đăng nhập" },
            { id: "register", label: "Đăng ký" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => switchMode(t.id)}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s",
                background: mode === t.id ? "#fff" : "transparent",
                color: mode === t.id ? "#667eea" : "#6b7280",
                boxShadow: mode === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Họ tên (chỉ register) */}
          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Họ và tên *</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="Nguyễn Văn A"
                style={{
                  ...inputStyle,
                  borderColor: errors.full_name ? "#ef4444" : "#d1d5db",
                }}
                autoComplete="name"
              />
              {errors.full_name && <p style={errorStyle}>{errors.full_name}</p>}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
              style={{
                ...inputStyle,
                borderColor: errors.email ? "#ef4444" : "#d1d5db",
              }}
              autoComplete="email"
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>

          {/* Mật khẩu */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Mật khẩu *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={
                mode === "register" ? "Ít nhất 6 ký tự" : "Nhập mật khẩu"
              }
              style={{
                ...inputStyle,
                borderColor: errors.password ? "#ef4444" : "#d1d5db",
              }}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
            {errors.password && <p style={errorStyle}>{errors.password}</p>}
          </div>

          {/* Xác nhận mật khẩu (chỉ register) */}
          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Xác nhận mật khẩu *</label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={(e) =>
                  setForm({ ...form, confirm_password: e.target.value })
                }
                placeholder="Nhập lại mật khẩu"
                style={{
                  ...inputStyle,
                  borderColor: errors.confirm_password ? "#ef4444" : "#d1d5db",
                }}
                autoComplete="new-password"
              />
              {errors.confirm_password && (
                <p style={errorStyle}>{errors.confirm_password}</p>
              )}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 0",
              marginTop: 8,
              background: loading
                ? "#9ca3af"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading
              ? "⏳ Đang xử lý..."
              : mode === "login"
                ? "🔐 Đăng nhập"
                : "✅ Tạo tài khoản"}
          </button>
        </form>

        {/* Switch link */}
        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            style={{
              background: "none",
              border: "none",
              color: "#667eea",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
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
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};
const errorStyle = {
  color: "#ef4444",
  fontSize: 12,
  marginTop: 4,
  marginBottom: 0,
};
