import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ordersService from '../../services/ordersService';

const initialState = {
  orders: [],
  currentOrder: null,
  stats: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get orders
export const getOrders = createAsyncThunk(
  'orders/getOrders',
  async (filters = {}, thunkAPI) => {
    try {
      return await ordersService.getOrders(filters);
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

// Get single order
export const getOrder = createAsyncThunk(
  'orders/getOrder',
  async (orderNumber, thunkAPI) => {
    try {
      return await ordersService.getOrder(orderNumber);
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

// Create order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, thunkAPI) => {
    try {
      return await ordersService.createOrder(orderData);
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

// Get order stats
export const getOrderStats = createAsyncThunk(
  'orders/getOrderStats',
  async (filters = {}, thunkAPI) => {
    try {
      return await ordersService.getOrderStats(filters);
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

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderNumber, status }, thunkAPI) => {
    try {
      return await ordersService.updateOrderStatus(orderNumber, status);
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

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.orders = action.payload.data.orders;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentOrder = action.payload.data.order;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentOrder = action.payload.data.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getOrderStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload.data.stats;
      })
      .addCase(getOrderStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isSuccess = true;
        const updatedOrder = action.payload.data.order;
        state.orders = state.orders.map((order) =>
          order.orderNumber === updatedOrder.orderNumber ? updatedOrder : order
        );
      });
  },
});

export const { reset, clearCurrentOrder } = ordersSlice.actions;
export default ordersSlice.reducer;