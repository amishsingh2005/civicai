import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/auth';

const authApi = {
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail;
      if (Array.isArray(message)) {
        throw message.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      }
      throw message || 'Signup failed';
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.detail;
      if (Array.isArray(message)) {
        throw message.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      }
      throw message || 'Login failed';
    }
  },
};

export default authApi;
