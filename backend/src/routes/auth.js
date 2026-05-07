/**
 * AUTH ROUTES
 * POST /api/auth/register  - Đăng ký tài khoản
 * POST /api/auth/login     - Đăng nhập
 * GET  /api/auth/me        - Lấy thông tin user hiện tại
 * PUT  /api/auth/profile   - Cập nhật tên hiển thị
 * PUT  /api/auth/password  - Đổi mật khẩu
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "accounting_secret_key_2026";
const JWT_EXPIRES = "7d"; // Token hết hạn sau 7 ngày

// ─── Validate email ───────────────────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { email, password, full_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Email không hợp lệ" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
  }

  // Kiểm tra email đã tồn tại chưa
  const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
    email.toLowerCase(),
  ]);
  if (existing.length > 0) {
    return res.status(409).json({ error: "Email này đã được đăng ký" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Tạo user
  const [result] = await db.query(
    "INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)",
    [email.toLowerCase(), hashedPassword, full_name || null],
  );

  // Tạo token
  const token = jwt.sign(
    {
      id: result.insertId,
      email: email.toLowerCase(),
      full_name: full_name || null,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );

  res.status(201).json({
    message: "Đăng ký thành công",
    token,
    user: {
      id: result.insertId,
      email: email.toLowerCase(),
      full_name: full_name || null,
    },
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email và mật khẩu là bắt buộc" });
  }

  // Tìm user
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
    email.toLowerCase(),
  ]);
  if (rows.length === 0) {
    return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
  }

  const user = rows[0];

  if (!user.is_active) {
    return res.status(403).json({ error: "Tài khoản đã bị vô hiệu hóa" });
  }

  // Kiểm tra password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
  }

  // Tạo token
  const token = jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );

  res.json({
    message: "Đăng nhập thành công",
    token,
    user: { id: user.id, email: user.email, full_name: user.full_name },
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  const [[user]] = await db.query(
    "SELECT id, email, full_name, created_at FROM users WHERE id = ?",
    [req.user.id],
  );
  if (!user)
    return res.status(404).json({ error: "Không tìm thấy người dùng" });
  res.json(user);
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put("/profile", authMiddleware, async (req, res) => {
  const { full_name } = req.body;
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: "Tên hiển thị không được để trống" });
  }
  await db.query("UPDATE users SET full_name = ? WHERE id = ?", [
    full_name.trim(),
    req.user.id,
  ]);
  res.json({ message: "Đã cập nhật tên", full_name: full_name.trim() });
});

// ─── PUT /api/auth/password ───────────────────────────────────────────────────
router.put("/password", authMiddleware, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
  }
  if (new_password.length < 6) {
    return res
      .status(400)
      .json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  }

  const [[user]] = await db.query("SELECT password FROM users WHERE id = ?", [
    req.user.id,
  ]);
  const isMatch = await bcrypt.compare(current_password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Mật khẩu hiện tại không đúng" });
  }

  const hashed = await bcrypt.hash(new_password, 12);
  await db.query("UPDATE users SET password = ? WHERE id = ?", [
    hashed,
    req.user.id,
  ]);
  res.json({ message: "Đã đổi mật khẩu thành công" });
});

module.exports = router;
