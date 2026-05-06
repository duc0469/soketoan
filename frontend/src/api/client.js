import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 60000,
});

// Upload file
export const uploadFile = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) =>
      onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
};

// Transactions
export const getTransactions = (params) => api.get("/transactions", { params });
export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data);
export const confirmTransactions = (payload) =>
  api.post("/transactions/confirm", payload);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getBatches = () => api.get("/transactions/batches");

// Ledgers
export const getLedgers = (params) => api.get("/ledgers", { params });
export const getLedgerSummary = (params) =>
  api.get("/ledgers/summary", { params });

// Rules
export const getRules = () => api.get("/rules");
export const createRule = (data) => api.post("/rules", data);
export const updateRule = (id, data) => api.put(`/rules/${id}`, data);
export const deleteRule = (id) => api.delete(`/rules/${id}`);

// Export
export const exportToExcel = (params) => {
  return api.get("/export/excel", {
    params,
    responseType: "blob", // Important for file download
  });
};

export default api;
