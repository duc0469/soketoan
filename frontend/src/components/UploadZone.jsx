import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { uploadFile } from "../api/client";

const ACCEPTED = ".pdf,.csv,.xlsx,.xls";

export default function UploadZone({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;
      const ext = file.name.split(".").pop().toLowerCase();
      if (!["pdf", "csv", "xlsx", "xls"].includes(ext)) {
        toast.error("Chỉ hỗ trợ PDF, CSV, XLSX, XLS");
        return;
      }
      setLoading(true);
      setProgress(0);
      try {
        const { data } = await uploadFile(file, setProgress);
        toast.success(
          `Đã xử lý ${data.total_rows} giao dịch từ "${data.file_name}"`,
        );
        // Cảnh báo số dư không khớp
        if (data.balance_warning) {
          toast.error(`⚠️ ${data.balance_warning}`, { duration: 8000 });
        }
        // Cảnh báo giao dịch trùng lặp
        if (data.duplicates && data.duplicates.length > 0) {
          toast(
            `⚠️ Phát hiện ${data.duplicates.length} giao dịch có thể trùng lặp`,
            {
              icon: "⚠️",
              duration: 6000,
              style: {
                background: "#fffbeb",
                color: "#92400e",
                border: "1px solid #f59e0b",
              },
            },
          );
        }
        onUploaded(data);
      } catch (err) {
        toast.error(err.response?.data?.error || "Upload thất bại");
      } finally {
        setLoading(false);
        setProgress(0);
      }
    },
    [onUploaded],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const onInputChange = (e) => handleFile(e.target.files[0]);

  return (
    <div>
      {/* Warning Message */}
      <div
        style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "start",
        }}
      >
        <span style={{ fontSize: 24 }}>⚠️</span>
        <div>
          <p style={{ fontWeight: 600, color: "#92400e", margin: 0 }}>
            Lưu ý quan trọng
          </p>
          <p style={{ color: "#78350f", fontSize: 14, margin: "4px 0 0 0" }}>
            Khi upload file mới, tất cả dữ liệu cũ sẽ bị xóa. Hãy xuất Excel để
            lưu trữ trước khi upload file mới.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? "#3b82f6" : "#d1d5db"}`,
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          background: dragging ? "#eff6ff" : "#fafafa",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          position: "relative",
        }}
      >
        {loading ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <p style={{ color: "#3b82f6", fontWeight: 600 }}>
              Đang xử lý... {progress}%
            </p>
            <div
              style={{
                background: "#e5e7eb",
                borderRadius: 4,
                height: 8,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  background: "#3b82f6",
                  height: 8,
                  borderRadius: 4,
                  width: `${progress}%`,
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📂</div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 4,
              }}
            >
              Kéo thả file sao kê vào đây
            </p>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
              Hỗ trợ: PDF, CSV, XLSX, XLS (tối đa 20MB)
            </p>
            <label
              style={{
                display: "inline-block",
                padding: "10px 24px",
                background: "#3b82f6",
                color: "#fff",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Chọn file
              <input
                type="file"
                accept={ACCEPTED}
                onChange={onInputChange}
                style={{ display: "none" }}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}
