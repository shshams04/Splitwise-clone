import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      console.warn('Backend not available - running in demo mode');
      // Return mock data for demo
      return Promise.resolve({
        data: {
          user: null,
          groups: [],
          expenses: [],
          balances: { simplifiedBalances: [], groupMembers: [] }
        }
      });
    }
    return Promise.reject(error);
  }
);

export default api;
