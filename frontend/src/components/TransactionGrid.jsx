import React, { useState, useMemo } from "react";
import TransactionRow from "./TransactionRow";
import TransactionToolbar from "./TransactionToolbar";
import { LEDGER_TYPE_LABELS } from "../utils/format";

const PAGE_SIZE = 50;

export default function TransactionGrid({
  transactions,
  onUpdate,
  onConfirm,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);

  // ── Search & Filter state ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterLedger, setFilterLedger] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterNoRule, setFilterNoRule] = useState(false);
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  // ── Filtered transactions (client-side) ───────────────────────────────────
  const filtered = useMemo(() => {
    let result = transactions || [];
    if (search)
      result = result.filter((t) =>
        t.description.includes(search.toUpperCase()),
      );
    if (filterLedger)
      result = result.filter((t) => t.ledger_type === filterLedger);
    if (filterStatus) result = result.filter((t) => t.status === filterStatus);
    if (filterNoRule) result = result.filter((t) => !t.rule_id);
    if (amountMin)
      result = result.filter(
        (t) => Math.abs(t.amount) >= parseFloat(amountMin),
      );
    if (amountMax)
      result = result.filter(
        (t) => Math.abs(t.amount) <= parseFloat(amountMax),
      );
    return result;
  }, [
    transactions,
    search,
    filterLedger,
    filterStatus,
    filterNoRule,
    amountMin,
    amountMax,
  ]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditData({
      debit_account: row.debit_account || "",
      credit_account: row.credit_account || "",
      ledger_type: row.ledger_type || "CHI_PHI",
      note: row.note || "",
    });
  };

  const handleSave = async () => {
    await onUpdate(editingId, editData);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((t) => t.id)));
  };

  const handleConfirmSelected = () => {
    if (selected.size === 0) return;
    onConfirm(Array.from(selected));
    setSelected(new Set());
  };

  const clearFilters = () => {
    setSearch("");
    setFilterLedger("");
    setFilterStatus("");
    setFilterNoRule(false);
    setAmountMin("");
    setAmountMax("");
    resetPage();
  };

  const hasFilters =
    search ||
    filterLedger ||
    filterStatus ||
    filterNoRule ||
    amountMin ||
    amountMax;

  if (!transactions || transactions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <p>Chưa có giao dịch nào. Hãy upload file sao kê.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Search & Filter bar ── */}
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
          }}
        >
          {/* Tìm kiếm nội dung */}
          <div>
            <label style={labelStyle}>🔍 Tìm nội dung</label>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Nhập từ khóa..."
              style={inputStyle}
            />
          </div>
          {/* Lọc loại sổ */}
          <div>
            <label style={labelStyle}>Loại sổ</label>
            <select
              value={filterLedger}
              onChange={(e) => {
                setFilterLedger(e.target.value);
                resetPage();
              }}
              style={inputStyle}
            >
              <option value="">Tất cả</option>
              {Object.entries(LEDGER_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          {/* Lọc trạng thái */}
          <div>
            <label style={labelStyle}>Trạng thái</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                resetPage();
              }}
              style={inputStyle}
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
            </select>
          </div>
          {/* Khoảng tiền */}
          <div>
            <label style={labelStyle}>Tiền từ (VND)</label>
            <input
              type="number"
              value={amountMin}
              onChange={(e) => {
                setAmountMin(e.target.value);
                resetPage();
              }}
              placeholder="0"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tiền đến (VND)</label>
            <input
              type="number"
              value={amountMax}
              onChange={(e) => {
                setAmountMax(e.target.value);
                resetPage();
              }}
              placeholder="Không giới hạn"
              style={inputStyle}
            />
          </div>
          {/* Chưa khớp rule */}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              <input
                type="checkbox"
                checked={filterNoRule}
                onChange={(e) => {
                  setFilterNoRule(e.target.checked);
                  resetPage();
                }}
              />
              Chưa khớp rule
            </label>
          </div>
        </div>
        {hasFilters && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Hiển thị <strong>{filtered.length}</strong> /{" "}
              {transactions.length} giao dịch
            </span>
            <button
              onClick={clearFilters}
              style={{
                fontSize: 12,
                padding: "4px 10px",
                background: "#e5e7eb",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              ✕ Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      <TransactionToolbar
        selectedCount={selected.size}
        totalCount={filtered.length}
        onConfirmSelected={handleConfirmSelected}
      />

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
            style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}
          >
            <tr>
              <th style={thStyle}>
                <input
                  type="checkbox"
                  checked={
                    paginated.length > 0 && selected.size === paginated.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th style={thStyle}>Ngày</th>
              <th style={thStyle}>Nội dung</th>
              <th style={thStyle}>Số tiền</th>
              <th style={thStyle}>TK Nợ</th>
              <th style={thStyle}>TK Có</th>
              <th style={thStyle}>Loại sổ</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                isEditing={editingId === transaction.id}
                editData={editData}
                isSelected={selected.has(transaction.id)}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={onDelete}
                onToggleSelect={toggleSelect}
                onEditDataChange={setEditData}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            style={pageBtn(page === 1)}
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={pageBtn(page === 1)}
          >
            ‹
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  ...pageBtn(false),
                  background: p === page ? "#667eea" : "#fff",
                  color: p === page ? "#fff" : "#374151",
                  fontWeight: p === page ? 700 : 400,
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={pageBtn(page === totalPages)}
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            style={pageBtn(page === totalPages)}
          >
            »
          </button>
          <span style={{ fontSize: 13, color: "#6b7280", marginLeft: 8 }}>
            Trang {page}/{totalPages} ({filtered.length} giao dịch)
          </span>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 3,
};
const inputStyle = {
  width: "100%",
  padding: "6px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 13,
};
const thStyle = {
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: 600,
  color: "#374151",
  fontSize: 13,
};
const pageBtn = (disabled) => ({
  padding: "6px 10px",
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: 4,
  cursor: disabled ? "not-allowed" : "pointer",
  color: disabled ? "#d1d5db" : "#374151",
  fontSize: 13,
});
