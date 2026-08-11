import axios from 'axios';

const customApiUrl = (import.meta as any).env?.VITE_API_URL;
const isDev = (import.meta as any).env?.DEV;

const api = axios.create({
  baseURL: customApiUrl || (isDev ? '/api' : 'https://durga-enterprise.onrender.com/api'),
});

// Interceptor to inject JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthenticated 401 response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
