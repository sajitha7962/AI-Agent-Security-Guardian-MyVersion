import axios from "axios";

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("guardian_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Global error normalisation
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Unknown error";
    return Promise.reject(new Error(message));
  }
);

export default api;

// ---------------------------------------------------------------------------
// Firewall
// ---------------------------------------------------------------------------
export const firewallAPI = {
  analyze: (prompt) =>
    api.post("/firewall/analyze", { prompt }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
export const actionsAPI = {
  evaluate: (actionId, context) =>
    api.post("/actions/evaluate", { action_id: actionId, context }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
export const analyticsAPI = {
  getSummary:  ()     => api.get("/analytics/summary").then((r) => r.data),
  getTrends:   ()     => api.get("/analytics/trends").then((r) => r.data),
  getHeatmap:  ()     => api.get("/analytics/heatmap").then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------
export const policiesAPI = {
  list:    ()            => api.get("/policies").then((r) => r.data),
  create:  (body)        => api.post("/policies", body).then((r) => r.data),
  update:  (id, body)    => api.put(`/policies/${id}`, body).then((r) => r.data),
  remove:  (id)          => api.delete(`/policies/${id}`).then((r) => r.data),
  toggle:  (id, enabled) => api.patch(`/policies/${id}/toggle`, { enabled }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------
export const auditAPI = {
  list: (params) => api.get("/audit", { params }).then((r) => r.data),
  exportCSV: (params) =>
    api.get("/audit/export/csv", { params, responseType: "blob" }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Agents (multi-agent page)
// ---------------------------------------------------------------------------
export const agentsAPI = {
  list:      ()   => api.get("/agents").then((r) => r.data),
  getById:   (id) => api.get(`/agents/${id}`).then((r) => r.data),
  getEvents: (id) => api.get(`/agents/${id}/events`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// AI Copilot
// ---------------------------------------------------------------------------
export const copilotAPI = {
  chat: (messages, context) =>
    api.post("/copilot/chat", { messages, context }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Trust Engine
// ---------------------------------------------------------------------------
export const trustAPI = {
  getScore:   (agentId) => api.get(`/trust/${agentId}`).then((r) => r.data),
  getHistory: (agentId) => api.get(`/trust/${agentId}/history`).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// RAG Security
// ---------------------------------------------------------------------------
export const ragAPI = {
  scan: (documents, query) =>
    api.post("/rag/scan", { documents, query }).then((r) => r.data),
};

// ---------------------------------------------------------------------------
// Secret Detection
// ---------------------------------------------------------------------------
export const secretsAPI = {
  scan: (text) =>
    api.post("/secrets/scan", { text }).then((r) => r.data),
};
