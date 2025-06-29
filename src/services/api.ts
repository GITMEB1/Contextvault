import axios from 'axios';
import toast from 'react-hot-toast';

// Create API instance with proper base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1';

console.log('🔧 API Base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error);

    // Handle network errors
    if (!error.response) {
      let errorMessage = 'Connection failed';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to backend. Please check if the server is running on localhost:8000';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and ensure the backend is running.';
      } else {
        errorMessage = `Connection error: ${error.message}`;
      }
      
      console.error('🔌 Network Error Details:', {
        code: error.code,
        message: error.message,
        config: error.config
      });
      
      toast.error(errorMessage);
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    let errorMessage = data?.error?.message || data?.message || 'An unexpected error occurred.';

    switch (status) {
      case 400:
        errorMessage = errorMessage || 'Bad Request.';
        break;
      case 401:
        errorMessage = errorMessage || 'Unauthorized. Please log in again.';
        // Only clear auth and redirect if we're not already on a public page
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/'].includes(currentPath)) {
          localStorage.removeItem('token');
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
    
    // Only show toast for non-401 errors to avoid spam
    if (status !== 401) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(new Error(errorMessage));
  },
);

export default api;