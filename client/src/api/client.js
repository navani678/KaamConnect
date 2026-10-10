import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kaamconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap response envelope and handle 401
apiClient.interceptors.response.use(
  (response) => {
    // If backend envelope has { success: true, data: ... }
    if (response.data && response.data.success !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      // If 401 unauthorized, optionally clear token
      if (error.response.status === 401) {
        // Only redirect if not already on login/register
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          // Token expired or invalid
        }
      }
      const backendError = error.response.data?.error || {
        message: error.response.data?.message || error.message || 'Server error occurred'
      };
      return Promise.reject(backendError);
    }
    return Promise.reject({ message: error.message || 'Network error occurred' });
  }
);

export default apiClient;
