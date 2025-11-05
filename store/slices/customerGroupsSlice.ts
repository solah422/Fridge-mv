import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CustomerGroup } from '../../types';
import { db } from '../../services/dbService';
import { RootState } from '..';

interface CustomerGroupsState {
  items: CustomerGroup[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CustomerGroupsState = {
  items: [],
  status: 'idle',
};

export const fetchCustomerGroups = createAsyncThunk('customerGroups/fetch', async () => {
  return await db.customerGroups.toArray();
});

export const updateCustomerGroups = createAsyncThunk('customerGroups/update', async (groups: CustomerGroup[]) => {
    await db.customerGroups.bulkPut(groups);
    return groups;
});

const customerGroupsSlice = createSlice({
  name: 'customerGroups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerGroups.fulfilled, (state, action: PayloadAction<CustomerGroup[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(updateCustomerGroups.fulfilled, (state, action: PayloadAction<CustomerGroup[]>) => {
        state.items = action.payload;
      });
  },
});

export const selectAllCustomerGroups = (state: RootState) => state.customerGroups.items;

export default customerGroupsSlice.reducer;