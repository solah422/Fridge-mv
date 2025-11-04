import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InventoryEvent } from '../../types';
import { api } from '../../services/apiService';
import { RootState } from '..';

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
  return await api.inventoryHistory.fetch();
});

export const addInventoryEvents = createAsyncThunk('inventoryHistory/addInventoryEvents', async (events: InventoryEvent[], { getState }) => {
    const state = getState() as RootState;
    const updatedHistory = [...state.inventoryHistory.items, ...events];
    await api.inventoryHistory.save(updatedHistory);
    return updatedHistory;
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
        state.items = action.payload;
      });
  },
});

export default inventoryHistorySlice.reducer;
