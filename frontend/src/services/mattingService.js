import axios from 'axios';

const API_URL = '/api';

// Process an image
export const processImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axios.post(`${API_URL}/matting`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get user's matting history
export const getMattingHistory = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/matting/history`, {
      params: { page, limit }
    });
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}; 