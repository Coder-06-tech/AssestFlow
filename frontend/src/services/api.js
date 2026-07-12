import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to attach Mock User headers
API.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userProfile = JSON.parse(savedUser);
        if (userProfile && userProfile.id) {
          config.headers['x-user-id'] = userProfile.id;
          config.headers['x-user-role'] = userProfile.role;
          config.headers['x-user-name'] = userProfile.name;
        }
      } catch (err) {
        console.error('Error parsing simulated user:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

export default API;
