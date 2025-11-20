import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InventoryEvent } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

interface InventoryHistoryState {
  items: InventoryEvent[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InventoryHistoryState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchInventoryHistory = createAsyncThunk('inventoryHistory/fetchInventoryHistory', async () => {
  return await api.get<InventoryEvent[]>('/inventory-history');
});

// Adding events is now a side-effect of other actions (transactions, POs) handled by the backend.
// This thunk can be used for manual adjustments.
export const addInventoryEvents = createAsyncThunk('inventoryHistory/addInventoryEvents', async (events: InventoryEvent[]) => {
    return await api.post<InventoryEvent[]>('/inventory-history', events);
});

const inventoryHistorySlice = createSlice({
  name: 'inventoryHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInventoryHistory.fulfilled, (state, action: PayloadAction<InventoryEvent[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchInventoryHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addInventoryEvents.fulfilled, (state, action: PayloadAction<InventoryEvent[]>) => {
        state.items.push(...action.payload);
      });
  },
});

export default inventoryHistorySlice.reducer;