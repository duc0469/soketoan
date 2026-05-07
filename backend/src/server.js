require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/upload");
const transactionRoutes = require("./routes/transactions");
const ledgerRoutes = require("./routes/ledgers");
const ruleRoutes = require("./routes/rules");
const exportRoutes = require("./routes/export");
const partnerRoutes = require("./routes/partners");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
// Public routes (không cần đăng nhập)
app.use("/api/auth", authRoutes);

// Protected routes (cần đăng nhập)
app.use("/api/upload", authMiddleware, uploadRoutes);
app.use("/api/transactions", authMiddleware, transactionRoutes);
app.use("/api/ledgers", authMiddleware, ledgerRoutes);
app.use("/api/rules", authMiddleware, ruleRoutes);
app.use("/api/export", authMiddleware, exportRoutes);
app.use("/api/partners", authMiddleware, partnerRoutes);

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date() }),
);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File quá lớn (tối đa 20MB)" });
  }
  res.status(500).json({ error: err.message || "Lỗi server" });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
