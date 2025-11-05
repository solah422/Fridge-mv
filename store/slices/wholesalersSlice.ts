import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Wholesaler } from '../../types';
import { db } from '../../services/dbService';

interface WholesalersState {
  items: Wholesaler[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: WholesalersState = {
  items: [],
  status: 'idle',
};

export const fetchWholesalers = createAsyncThunk('wholesalers/fetch', async () => {
  return await db.wholesalers.toArray();
});

export const updateWholesalers = createAsyncThunk('wholesalers/update', async (wholesalers: Wholesaler[]) => {
    await db.wholesalers.bulkPut(wholesalers);
    return wholesalers;
});

const wholesalersSlice = createSlice({
  name: 'wholesalers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWholesalers.fulfilled, (state, action: PayloadAction<Wholesaler[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(updateWholesalers.fulfilled, (state, action: PayloadAction<Wholesaler[]>) => {
        state.items = action.payload;
      });
  },
});

export default wholesalersSlice.reducer;