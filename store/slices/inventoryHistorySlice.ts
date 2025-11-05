import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InventoryEvent } from '../../types';
import { db } from '../../services/dbService';
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
  return await db.inventoryHistory.toArray();
});

export const addInventoryEvents = createAsyncThunk('inventoryHistory/addInventoryEvents', async (events: InventoryEvent[], { getState }) => {
    await db.inventoryHistory.bulkAdd(events);
    const state = getState() as RootState;
    return [...state.inventoryHistory.items, ...events];
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
      // We don't need a fulfilled case for addInventoryEvents if we don't plan to replace the entire state.
      // The saveTransaction thunk will manage the related state updates.
      // Let's add it just in case it's called independently.
      .addCase(addInventoryEvents.fulfilled, (state, action: PayloadAction<InventoryEvent[]>) => {
        state.items = action.payload;
      });
  },
});

export default inventoryHistorySlice.reducer;