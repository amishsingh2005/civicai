import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/reports';


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
      const message = error.response?.data?.detail;
      if (Array.isArray(message)) {
        throw message.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      }
      throw message || 'API Error';
    }
  },
  getFeed: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feed`, { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail;
      if (Array.isArray(message)) {
        throw message.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      }
      throw message || 'Failed to fetch feed';
    }
  },
  vote: async (voteData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/vote`, voteData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail;
      if (Array.isArray(message)) {
        throw message.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      }
      throw message || 'Failed to vote';
    }
  },

  getPostById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail;
      if (Array.isArray(message)) {
        throw message.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      }
      throw message || 'Failed to fetch report details';
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail;
      if (Array.isArray(message)) {
        throw message.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      }
      throw message || 'Failed to update status';
    }
  }
};


export default reportApi;
