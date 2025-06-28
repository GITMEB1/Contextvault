import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { clearAuth } = useAuthStore.getState();

    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = data.error?.message || 'An unexpected error occurred.';

      switch (status) {
        case 400:
          errorMessage = errorMessage || 'Bad Request.';
          break;
        case 401:
          errorMessage = errorMessage || 'Unauthorized. Please log in again.';
          clearAuth();
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = errorMessage || 'Forbidden. You do not have access.';
          break;
        case 404:
          errorMessage = errorMessage || 'Resource not found.';
          break;
        case 409:
          errorMessage = errorMessage || 'Conflict. The resource already exists.';
          break;
        case 429:
          errorMessage = errorMessage || 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = errorMessage || 'Server error. Please try again later.';
          break;
        default:
          errorMessage = errorMessage || `Error: ${status}`;
      }
      
      if (status !== 401) {
        toast.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      toast.error('No response from server. Please check your internet connection.');
      return Promise.reject(new Error('No response from server.'));
    } else {
      toast.error('Request setup error. Please try again.');
      return Promise.reject(new Error('Request setup error.'));
    }
  },
);

export default api;