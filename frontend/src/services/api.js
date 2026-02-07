import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // Increased to 30s for Render free tier cold starts
});

// ─── Employee endpoints ─────────────────────────────────────
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  create: (data) => api.post('/employees', data),
  remove: (mongoId) => api.delete(`/employees/${mongoId}`),
};

// ─── Attendance endpoints ───────────────────────────────────
export const attendanceAPI = {
  mark: (data) => api.post('/attendance', data),
  getByEmployee: (employeeId) => api.get(`/attendance/employee/${employeeId}`),
  getAll: (params = {}) => api.get('/attendance', { params }),
};
