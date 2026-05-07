import React, { useState } from "react";
import { exportToExcel } from "../api/client";
import toast from "react-hot-toast";

export default function ExportButton({ filters }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await exportToExcel(filters);

      // Create blob from response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      link.download = `So_Ke_Toan_${timestamp}.xlsx`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Đã xuất file Excel thành công!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Không thể xuất file Excel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        padding: "10px 20px",
        background: loading ? "#9ca3af" : "#10b981",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {loading ? <span>Đang xuất...</span> : <span>Xuất Excel</span>}
    </button>
  );
}
