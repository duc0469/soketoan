import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 60000,
});

// ─── Interceptor: tự động gắn token vào mọi request ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor: xử lý 401 (token hết hạn) ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const changePassword = (data) => api.put("/auth/password", data);

// ─── Upload file ──────────────────────────────────────────────────────────────
export const uploadFile = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) =>
      onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const getTransactions = (params) => api.get("/transactions", { params });
export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data);
export const confirmTransactions = (payload) =>
  api.post("/transactions/confirm", payload);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getBatches = () => api.get("/transactions/batches");
export const getTransactionLogs = (id) => api.get(`/transactions/${id}/logs`);
export const suggestRule = (transaction_id) =>
  api.post("/transactions/suggest-rule", { transaction_id });

// ─── Ledgers ──────────────────────────────────────────────────────────────────
export const getLedgers = (params) => api.get("/ledgers", { params });
export const getLedgerSummary = (params) =>
  api.get("/ledgers/summary", { params });

// ─── Rules ────────────────────────────────────────────────────────────────────
export const getRules = () => api.get("/rules");
export const createRule = (data) => api.post("/rules", data);
export const updateRule = (id, data) => api.put(`/rules/${id}`, data);
export const deleteRule = (id) => api.delete(`/rules/${id}`);
export const checkKeywordSuggestions = (data) =>
  api.post("/rules/suggestions", data);
export const getCommonKeywords = (ledgerType) =>
  api.get(`/rules/common-keywords/${ledgerType}`);

// ─── Partners ─────────────────────────────────────────────────────────────────
export const getPartners = () => api.get("/partners");
export const createPartner = (data) => api.post("/partners", data);
export const updatePartner = (id, data) => api.put(`/partners/${id}`, data);
export const deletePartner = (id) => api.delete(`/partners/${id}`);
export const getPartnerLedger = (params) =>
  api.get("/partners/ledger", { params });
export const getPartnerBalance = (params) =>
  api.get("/partners/balance", { params });
export const getPartnerTransactions = (params) =>
  api.get("/partners/transactions", { params });
export const testPartnerMatch = (data) => api.post("/partners/test", data);

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportToExcel = (params) => {
  return api.get("/export/excel", {
    params,
    responseType: "blob",
  });
};

export default api;
