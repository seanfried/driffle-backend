import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const productsService = {
  // Create axios instance
  api: axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  // Get products with filters
  getProducts: async (filters = {}) => {
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

    const response = await productsService.api.get(`/products?${params}`);
    return response.data;
  },

  // Get single product
  getProduct: async (slug) => {
    const response = await productsService.api.get(`/products/${slug}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await productsService.api.get(`/products/featured?${params}`);
    return response.data;
  },

  // Get sale products
  getSaleProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await productsService.api.get(`/products/sale?${params}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await productsService.api.get('/products/categories');
    return response.data;
  },

  // Get platforms
  getPlatforms: async () => {
    const response = await productsService.api.get('/products/platforms');
    return response.data;
  },

  // Create product
  createProduct: async (productData) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await productsService.api.post('/products', productData, config);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await productsService.api.put(`/products/${id}`, productData, config);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await productsService.api.delete(`/products/${id}`, config);
    return response.data;
  },

  // Upload product image
  uploadImage: async (id, formData) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      } 
    };
    const response = await productsService.api.post(`/products/${id}/images`, formData, config);
    return response.data;
  },

  // Create Review
  createReview: async (id, reviewData) => {
    const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await productsService.api.post(`/products/${id}/reviews`, reviewData, config);
    return response.data;
  },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      productsService.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete productsService.api.defaults.headers.common['Authorization'];
    }
  },
};

export default productsService;