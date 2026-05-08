import axios from 'axios';

// In development: Vite proxy handles /api → localhost:3001
// In production: VITE_API_URL points to Railway backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('finch_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
