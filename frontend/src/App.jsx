import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import UploadZone from "./components/UploadZone";
import TransactionGrid from "./components/TransactionGrid";
import LedgerView from "./components/LedgerView";
import DeductibleExpensesView from "./components/DeductibleExpensesView";
import RulesManager from "./components/RulesManager";
import PartnersManager from "./components/PartnersManager";
import {
  updateTransaction,
  confirmTransactions,
  deleteTransaction,
} from "./api/client";
import toast from "react-hot-toast";

const queryClient = new QueryClient();

function App() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [transactions, setTransactions] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [ledgerRefreshTrigger, setLedgerRefreshTrigger] = useState(0);

  const handleUploaded = (data) => {
    setTransactions(data.transactions);
    setCurrentBatch(data.batch_id);
    setActiveTab("transactions");
    // Reset ledger refresh trigger when new file is uploaded
    // Always set to -1 to clear ledger data
    setLedgerRefreshTrigger(-1);
  };

  const handleUpdate = async (id, data) => {
    try {
      const { data: updated } = await updateTransaction(id, data);
      setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Đã cập nhật giao dịch");
    } catch (err) {
      toast.error("Không thể cập nhật");
    }
  };

  const handleConfirm = async (ids) => {
    try {
      await confirmTransactions({ ids });
      toast.success(`Đã xác nhận ${ids.length} giao dịch`);
      // Reload transactions
      setTransactions((prev) =>
        prev.map((t) =>
          ids.includes(t.id) ? { ...t, status: "CONFIRMED" } : t,
        ),
      );
      // Trigger ledger data reload
      setLedgerRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error("Không thể xác nhận");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa giao dịch này?")) return;
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Đã xóa giao dịch");
    } catch (err) {
      toast.error("Không thể xóa");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
        <Toaster position="top-right" />

        {/* Header */}
        <header
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            padding: "24px 32px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Hệ Thống Kế Toán Tự Động
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: 14 }}>
            Upload sao kê → Phân loại tự động → Xác nhận → Sổ kế toán
          </p>
        </header>

        {/* Tabs */}
        <div
          style={{
            background: "#fff",
            borderBottom: "2px solid #e5e7eb",
            padding: "0 32px",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "transactions", label: "📊 Giao dịch" },
              { id: "ledgers", label: "📚 Sổ kế toán" },
              { id: "deductible", label: "💰 Chi phí được trừ" },
              { id: "partners", label: "🤝 Đối tác" },
              { id: "rules", label: "⚙️ Rules" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "16px 24px",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "3px solid #667eea"
                      : "3px solid transparent",
                  color: activeTab === tab.id ? "#667eea" : "#6b7280",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main style={{ padding: 32, maxWidth: 1600, margin: "0 auto" }}>
          {activeTab === "transactions" && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <UploadZone onUploaded={handleUploaded} />
              </div>
              {currentBatch && (
                <div
                  style={{
                    background: "#fff",
                    padding: 24,
                    borderRadius: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <TransactionGrid
                    transactions={transactions}
                    onUpdate={handleUpdate}
                    onConfirm={handleConfirm}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "ledgers" && (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <LedgerView refreshTrigger={ledgerRefreshTrigger} />
            </div>
          )}

          {activeTab === "deductible" && (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <DeductibleExpensesView refreshTrigger={ledgerRefreshTrigger} />
            </div>
          )}

          {activeTab === "rules" && (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <RulesManager />
            </div>
          )}

          {activeTab === "partners" && (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <PartnersManager refreshTrigger={ledgerRefreshTrigger} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            padding: 24,
            color: "#9ca3af",
            fontSize: 14,
          }}
        >
          <p>
            © 2026 Hệ Thống Kế Toán Tự Động | Powered by React + Node.js + MySQL
          </p>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
