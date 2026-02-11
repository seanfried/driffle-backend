import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productsService from '../../services/productsService';

const initialState = {
  products: [],
  featuredProducts: [],
  saleProducts: [],
  categories: [],
  platforms: [],
  currentProduct: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get products
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (filters = {}, thunkAPI) => {
    try {
      return await productsService.getProducts(filters);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single product
export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (slug, thunkAPI) => {
    try {
      return await productsService.getProduct(slug);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get featured products
export const getFeaturedProducts = createAsyncThunk(
  'products/getFeaturedProducts',
  async (_, thunkAPI) => {
    try {
      return await productsService.getFeaturedProducts();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get sale products
export const getSaleProducts = createAsyncThunk(
  'products/getSaleProducts',
  async (_, thunkAPI) => {
    try {
      return await productsService.getSaleProducts();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get categories
export const getCategories = createAsyncThunk(
  'products/getCategories',
  async (_, thunkAPI) => {
    try {
      return await productsService.getCategories();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get platforms
export const getPlatforms = createAsyncThunk(
  'products/getPlatforms',
  async (_, thunkAPI) => {
    try {
      return await productsService.getPlatforms();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, thunkAPI) => {
    try {
      return await productsService.createProduct(productData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }, thunkAPI) => {
    try {
      return await productsService.updateProduct(id, productData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, thunkAPI) => {
    try {
      await productsService.deleteProduct(id);
      return id;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Upload product image
export const uploadProductImage = createAsyncThunk(
  'products/uploadImage',
  async ({ id, formData }, thunkAPI) => {
    try {
      return await productsService.uploadImage(id, formData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create Review
export const createReview = createAsyncThunk(
  'products/createReview',
  async ({ id, reviewData }, thunkAPI) => {
    try {
      return await productsService.createReview(id, reviewData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = action.payload.data.products;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentProduct = action.payload.data.product;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.data.products;
      })
      .addCase(getFeaturedProducts.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSaleProducts.fulfilled, (state, action) => {
        state.saleProducts = action.payload.data.products;
      })
      .addCase(getSaleProducts.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data.categories;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getPlatforms.fulfilled, (state, action) => {
        state.platforms = action.payload.data.platforms;
      })
      .addCase(getPlatforms.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.currentProduct = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Upload image
      .addCase(uploadProductImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.currentProduct && state.currentProduct._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Review added successfully';
        if (state.currentProduct) {
          if (!state.currentProduct.reviews) state.currentProduct.reviews = [];
          // We need to fetch the full review with user populated, but for now push what we have
          // Actually, createReview returns { success: true, message, data: { review } }
          // The review object might not have 'user' populated with name/avatar immediately unless backend does it.
          // For best UX, we should probably reload the product or manually shape the object.
          // Let's just reload the product in the component for simplicity.
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;