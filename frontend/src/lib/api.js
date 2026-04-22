import axios from 'axios';

const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('em_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      // Token invalid — clear and redirect handled by context
    }
    return Promise.reject(err);
  }
);

export default API;
