import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subscriptionService from '../../services/subscriptionService';

const initialState = {
  subscription: null,
  history: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get subscription
export const getSubscription = createAsyncThunk(
  'subscription/getSubscription',
  async (_, thunkAPI) => {
    try {
      return await subscriptionService.getSubscription();
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

// Create subscription
export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (subscriptionData, thunkAPI) => {
    try {
      return await subscriptionService.createSubscription(subscriptionData);
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

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (cancelData, thunkAPI) => {
    try {
      return await subscriptionService.cancelSubscription(cancelData);
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

// Get subscription history
export const getSubscriptionHistory = createAsyncThunk(
  'subscription/getSubscriptionHistory',
  async (_, thunkAPI) => {
    try {
      return await subscriptionService.getSubscriptionHistory();
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

export const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearSubscription: (state) => {
      state.subscription = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data.subscription;
      })
      .addCase(getSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.subscription = action.payload.data.subscription;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.subscription) {
          state.subscription.status = action.payload.data.subscription.status;
          state.subscription.cancelAtPeriodEnd = action.payload.data.subscription.cancelAtPeriodEnd;
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSubscriptionHistory.fulfilled, (state, action) => {
        state.history = action.payload.data.subscriptions;
      })
      .addCase(getSubscriptionHistory.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;