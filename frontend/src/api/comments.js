import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/comments';

const commentApi = {
  createComment: async (commentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/create`, commentData);
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      let message = 'Failed to post comment';
      if (Array.isArray(detail)) {
        message = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        message = detail.message || JSON.stringify(detail);
      } else if (detail) {
        message = detail;
      }
      throw message;
    }
  },

  getComments: async (reportId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${reportId}`);
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      let message = 'Failed to fetch comments';
      if (Array.isArray(detail)) {
        message = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        message = detail.message || JSON.stringify(detail);
      } else if (detail) {
        message = detail;
      }
      throw message;
    }
  },
};

export default commentApi;
