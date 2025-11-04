import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LoyaltySettings } from '../../types';
import { api } from '../../services/apiService';

interface LoyaltyState {
  loyaltySettings: LoyaltySettings;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: LoyaltyState = {
  loyaltySettings: { enabled: false, pointsPerMvr: 1, tiers: [] },
  status: 'idle',
};

export const fetchLoyaltySettings = createAsyncThunk('loyalty/fetchSettings', async () => {
  return await api.loyaltySettings.fetch();
});

export const saveLoyaltySettings = createAsyncThunk('loyalty/saveSettings', async (settings: LoyaltySettings) => {
    await api.loyaltySettings.save(settings);
    return settings;
});

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoyaltySettings.fulfilled, (state, action: PayloadAction<LoyaltySettings>) => {
        state.loyaltySettings = action.payload;
        state.status = 'succeeded';
      })
      .addCase(saveLoyaltySettings.fulfilled, (state, action: PayloadAction<LoyaltySettings>) => {
        state.loyaltySettings = action.payload;
      });
  },
});

export default loyaltySlice.reducer;