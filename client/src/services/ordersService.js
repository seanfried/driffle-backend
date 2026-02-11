import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ordersService = {
  // Create axios instance
  api: axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  // Get orders
  getOrders: async (filters = {}) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        if (Array.isArray(filters[key])) {
          filters[key].forEach(value => params.append(key, value));
        } else {
          params.append(key, filters[key]);
        }
      }
    });

    const response = await ordersService.api.get(`/orders?${params}`, config);
    return response.data;
  },

  // Get single order
  getOrder: async (orderNumber) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await ordersService.api.get(`/orders/${orderNumber}`, config);
    return response.data;
  },

  // Create order
  createOrder: async (orderData) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await ordersService.api.post('/orders', orderData, config);
    return response.data;
  },

  // Get order stats
  getOrderStats: async (filters = {}) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        if (Array.isArray(filters[key])) {
          filters[key].forEach(value => params.append(key, value));
        } else {
          params.append(key, filters[key]);
        }
      }
    });

    const response = await ordersService.api.get(`/orders/stats?${params}`, config);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderNumber, status) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await ordersService.api.put(`/orders/${orderNumber}/status`, { status }, config);
    return response.data;
  },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      ordersService.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete ordersService.api.defaults.headers.common['Authorization'];
    }
  },
};

export default ordersService;