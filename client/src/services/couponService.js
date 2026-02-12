import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const couponService = {
  api: axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  // Get all coupons (Admin)
  getCoupons: async () => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await couponService.api.get('/coupons', config);
    return response.data;
  },

  // Create a new coupon (Admin)
  createCoupon: async (couponData) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await couponService.api.post('/coupons', couponData, config);
    return response.data;
  },

  // Delete a coupon (Admin)
  deleteCoupon: async (id) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await couponService.api.delete(`/coupons/${id}`, config);
    return response.data;
  },

  // Apply a coupon (User)
  applyCoupon: async (code) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await couponService.api.post('/coupons/apply', { code }, config);
    return response.data;
  }
};

export default couponService;
