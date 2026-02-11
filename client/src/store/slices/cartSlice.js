import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/cartService';

const initialState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get cart
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, thunkAPI) => {
    try {
      return await cartService.getCart();
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

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, thunkAPI) => {
    try {
      return await cartService.addToCart(productId, quantity);
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

// Update cart item
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, thunkAPI) => {
    try {
      return await cartService.updateCartItem(productId, quantity);
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

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, thunkAPI) => {
    try {
      return await cartService.removeFromCart(productId);
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

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, thunkAPI) => {
    try {
      return await cartService.clearCart();
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

// Merge carts
export const mergeCarts = createAsyncThunk(
  'cart/mergeCarts',
  async (_, thunkAPI) => {
    try {
      return await cartService.mergeCarts();
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

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalItems = action.payload.totalItems || 0;
      state.subtotal = action.payload.subtotal || 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const cartData = action.payload.data.cart;
        state.items = cartData.items || [];
        state.totalItems = cartData.totalItems || 0;
        state.subtotal = cartData.subtotal || 0;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isSuccess = true;
        const cartData = action.payload.data.cart;
        state.items = cartData.items || [];
        state.totalItems = cartData.totalItems || 0;
        state.subtotal = cartData.subtotal || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isSuccess = true;
        const cartData = action.payload.data.cart;
        state.items = cartData.items || [];
        state.totalItems = cartData.totalItems || 0;
        state.subtotal = cartData.subtotal || 0;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isSuccess = true;
        const cartData = action.payload.data.cart;
        state.items = cartData.items || [];
        state.totalItems = cartData.totalItems || 0;
        state.subtotal = cartData.subtotal || 0;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isSuccess = true;
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(mergeCarts.fulfilled, (state, action) => {
        state.isSuccess = true;
        const cartData = action.payload.data.cart;
        state.items = cartData.items || [];
        state.totalItems = cartData.totalItems || 0;
        state.subtotal = cartData.subtotal || 0;
      })
      .addCase(mergeCarts.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, setCart } = cartSlice.actions;
export default cartSlice.reducer;