import axios from 'axios';

const API_URL = '/api';

// Set up axios interceptor to add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept 401 responses and log out user
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Register a new user
export const register = async (username, password, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      password,
      confirm_password: confirmPassword
    });
    
    if (response.data.success) {
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Login user
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password
    });
    
    if (response.data.success) {
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Logout user
export const logout = async () => {
  try {
    await axios.post(`${API_URL}/logout`);
    localStorage.removeItem('token');
    return { success: true };
  } catch (error) {
    localStorage.removeItem('token');
    throw error.response ? error.response.data : error;
  }
};

// Get current user
export const getUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}; 