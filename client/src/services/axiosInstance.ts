import axios from 'axios';
import { ROUTES, LS_KEYS } from '../constants';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add accessToken to Authorization header if exists
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(LS_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Extract data and handle accessToken on login
axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu là login và có accessToken thì lưu vào localStorage
    if (
      response.config.url?.includes('/auth/login') &&
      response.data?.result?.accessToken
    ) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          LS_KEYS.ACCESS_TOKEN,
          response.data.result.accessToken
        );
      }
    }
    return response.data;
  },
  (error) => {
    // Xử lý 401 Unauthorized: xoá token và redirect ngay về login
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(LS_KEYS.ACCESS_TOKEN);
      if (window.location.pathname !== ROUTES.LOGIN.INDEX) {
        window.location.replace(ROUTES.LOGIN.INDEX);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
