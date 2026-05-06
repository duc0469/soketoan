import React, { useState } from "react";
import TransactionRow from "./TransactionRow";
import TransactionToolbar from "./TransactionToolbar";

export default function TransactionGrid({
  transactions,
  onUpdate,
  onConfirm,
  onDelete,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selected, setSelected] = useState(new Set());

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditData({
      debit_account: row.debit_account || "",
      credit_account: row.credit_account || "",
      ledger_type: row.ledger_type || "CHI_PHI", // Mặc định Chi Phí
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
    if (selected.size === transactions.length) setSelected(new Set());
    else setSelected(new Set(transactions.map((t) => t.id)));
  };

  const handleConfirmSelected = () => {
    if (selected.size === 0) return;
    onConfirm(Array.from(selected));
    setSelected(new Set());
  };

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
      <TransactionToolbar
        selectedCount={selected.size}
        totalCount={transactions.length}
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
                  checked={selected.size === transactions.length}
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
            {transactions.map((transaction) => (
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
    </div>
  );
}

const thStyle = {
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: 600,
  color: "#374151",
  fontSize: 13,
};
