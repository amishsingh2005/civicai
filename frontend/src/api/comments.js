import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/comments';

const commentApi = {
  createComment: async (commentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/create`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to post comment';
    }
  },

  getComments: async (reportId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Failed to fetch comments';
    }
  },
};

export default commentApi;
