import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../types';
import { api } from '../../services/apiService';
import { RootState } from '..';

interface CustomersState {
  items: Customer[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async () => {
  const response = await api.customers.fetch();
  return response;
});

export const updateCustomers = createAsyncThunk('customers/updateCustomers', async (customers: Customer[]) => {
    await api.customers.save(customers);
    return customers;
});

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.items = action.payload;
      });
  },
});

export const selectAllCustomers = (state: RootState) => state.customers.items;

export default customersSlice.reducer;
