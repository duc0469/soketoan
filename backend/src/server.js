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

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/upload", uploadRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ledgers", ledgerRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/export", exportRoutes);

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
