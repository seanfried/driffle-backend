import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const cartService = {
  // Create axios instance
  api: axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  // Get cart
  getCart: async () => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const sessionId = localStorage.getItem('sessionId');
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }

    const response = await cartService.api.get('/cart', config);
    return response.data;
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const sessionId = localStorage.getItem('sessionId');
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }

    const response = await cartService.api.post('/cart/items', { productId, quantity }, config);
    return response.data;
  },

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const sessionId = localStorage.getItem('sessionId');
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }

    const response = await cartService.api.put(`/cart/items/${productId}`, { quantity }, config);
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const sessionId = localStorage.getItem('sessionId');
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }

    const response = await cartService.api.delete(`/cart/items/${productId}`, config);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const sessionId = localStorage.getItem('sessionId');
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }

    const response = await cartService.api.delete('/cart', config);
    return response.data;
  },

  // Merge carts
  mergeCarts: async () => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const sessionId = localStorage.getItem('sessionId');
    
    const config = {
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }

    const response = await cartService.api.post('/cart/merge', {}, config);
    return response.data;
  },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      cartService.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete cartService.api.defaults.headers.common['Authorization'];
    }
  },
};

export default cartService;