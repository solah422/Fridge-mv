import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

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
  const response = await api.get<Customer[]>('/customers');
  return response;
});

export const updateCustomers = createAsyncThunk('customers/updateCustomers', async (customers: Customer[]) => {
    const response = await api.put<Customer[]>('/customers', customers);
    return response;
});

export const createCustomerWithCredential = createAsyncThunk(
    'customers/createWithCredential',
    async (customerData: Omit<Customer, 'id'>, { rejectWithValue }) => {
        try {
            const newCustomer = await api.post<Customer>('/customers', customerData);
            return newCustomer;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const generateActivationCode = createAsyncThunk(
    'customers/generateActivationCode',
    async (redboxId: number, { rejectWithValue }) => {
        try {
            const response = await api.post<{ redboxId: number, code: string }>('/customers/generate-code', { redboxId });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


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
        // This assumes the API returns the full updated list.
        // If it only returns the changed items, a different logic would be needed.
        state.items = action.payload;
      })
      .addCase(createCustomerWithCredential.fulfilled, (state, action: PayloadAction<Customer | undefined>) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
      });
  },
});

export const selectAllCustomers = (state: RootState) => state.customers.items;

export default customersSlice.reducer;