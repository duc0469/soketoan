/**
 * AUTH MIDDLEWARE
 * Xác thực JWT token từ header Authorization
 */

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "accounting_secret_key_2026";

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, full_name }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
  }
};
