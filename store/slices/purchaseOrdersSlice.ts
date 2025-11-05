import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PurchaseOrder } from '../../types';
import { db } from '../../services/dbService';

interface PurchaseOrdersState {
  items: PurchaseOrder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: PurchaseOrdersState = {
  items: [],
  status: 'idle',
};

export const fetchPurchaseOrders = createAsyncThunk('purchaseOrders/fetch', async () => {
  return await db.purchaseOrders.toArray();
});

export const updatePurchaseOrders = createAsyncThunk('purchaseOrders/update', async (orders: PurchaseOrder[]) => {
    await db.purchaseOrders.bulkPut(orders);
    return orders;
});

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrders.fulfilled, (state, action: PayloadAction<PurchaseOrder[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(updatePurchaseOrders.fulfilled, (state, action: PayloadAction<PurchaseOrder[]>) => {
        state.items = action.payload;
      });
  },
});

export default purchaseOrdersSlice.reducer;