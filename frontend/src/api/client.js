import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors and handle token expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors
        ? error.response.data.errors.map((e) => e.message).join(', ')
        : 'An unexpected error occurred. Please try again.');

    // If 401 unauthorized, notify or clear stale token
    if (error.response?.status === 401 && !window.location.pathname.includes('login')) {
      // Stale token cleanup
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
