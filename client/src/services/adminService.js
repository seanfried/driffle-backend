import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const adminService = {
  api: axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  getDashboardStats: async () => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await adminService.api.get('/admin/dashboard', config);
    return response.data;
  },

  getAuditLogs: async (params) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await adminService.api.get('/admin/logs', { ...config, params });
    return response.data;
  },

  getUsers: async (params) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await adminService.api.get('/admin/users', { ...config, params });
    return response.data;
  }
};

export default adminService;