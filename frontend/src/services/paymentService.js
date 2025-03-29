import axios from 'axios';

const API_URL = '/api';

// Initialize a payment for credits
export const initializePayment = async (amount) => {
  try {
    const response = await axios.post(`${API_URL}/recharge`, {
      amount
    });
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get user's credit balance
export const getCreditBalance = async () => {
  try {
    const response = await axios.get(`${API_URL}/credit/balance`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get user's recharge history
export const getRechargeHistory = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/recharge/history`, {
      params: { page, limit }
    });
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}; 