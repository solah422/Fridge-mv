import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Promotion } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

interface PromotionsState {
  items: Promotion[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PromotionsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchPromotions = createAsyncThunk('promotions/fetchPromotions', async () => {
  return await api.get<Promotion[]>('/promotions');
});

export const updatePromotions = createAsyncThunk('promotions/updatePromotions', async (promotions: Promotion[]) => {
    return await api.put<Promotion[]>('/promotions', promotions);
});

const promotionsSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPromotions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPromotions.fulfilled, (state, action: PayloadAction<Promotion[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updatePromotions.fulfilled, (state, action: PayloadAction<Promotion[]>) => {
        state.items = action.payload;
      });
  },
});

export const selectAllPromotions = (state: RootState) => state.promotions.items;

export default promotionsSlice.reducer;