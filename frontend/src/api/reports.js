import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/reports';

const reportApi = {
  createReport: async (reportData) => {
    try {
      const formData = new FormData();
      formData.append('user_id', reportData.user_id);
      formData.append('latitude', reportData.latitude);
      formData.append('longitude', reportData.longitude);
      if (reportData.description) {
        formData.append('description', reportData.description);
      }
      formData.append('image', reportData.image);

      const response = await axios.post(`${API_BASE_URL}/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to create report';
    }
  },
  getFeed: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feed`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to fetch feed';
    }
  },
};

export default reportApi;
