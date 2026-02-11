import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const subscriptionService = {
  createSubscription: async (plan) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user ? user.token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(`${API_URL}/subscriptions`, { plan }, config);
    return response.data;
  },

  getMySubscription: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user ? user.token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/subscriptions/me`, config);
    return response.data;
  }
};

export default subscriptionService;