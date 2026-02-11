import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const communicationService = {
  api: axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  // Newsletter
  subscribeNewsletter: async (email) => {
    const response = await communicationService.api.post('/newsletter/subscribe', { email });
    return response.data;
  },

  // Notifications
  getNotifications: async (params) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await communicationService.api.get('/notifications', { ...config, params });
    return response.data;
  },

  markAsRead: async (id) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await communicationService.api.put(`/notifications/${id}/read`, {}, config);
    return response.data;
  },

  markAllAsRead: async () => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await communicationService.api.put('/notifications/mark-all-read', {}, config);
    return response.data;
  },

  deleteNotification: async (id) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await communicationService.api.delete(`/notifications/${id}`, config);
    return response.data;
  }
};

export default communicationService;