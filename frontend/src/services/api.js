import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://smart-mining-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smsb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ---- Convenience wrappers ----
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const minerApi = {
  getAll: () => api.get('/miners'),
  getById: (id) => api.get(`/miners/${id}`),
  create: (data) => api.post('/miners', data),
  update: (id, data) => api.put(`/miners/${id}`, data),
  deactivate: (id) => api.delete(`/miners/${id}`),
};

export const sensorApi = {
  ingest: (data) => api.post('/sensors/ingest', data),
  triggerSOS: (beltId, location) => api.post('/sensors/sos', { beltId, location }),
  history: (minerId, limit = 50) => api.get(`/sensors/${minerId}/history?limit=${limit}`),
};

export const alertApi = {
  getAll: (params = {}) => api.get('/alerts', { params }),
  resolve: (id, resolvedBy) => api.patch(`/alerts/${id}/resolve`, { resolvedBy }),
  stats: () => api.get('/alerts/stats'),
};
