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
    const response = await api.get<{ value: LoyaltySettings }>('/settings/loyalty');
    return response.value;
});

export const saveLoyaltySettings = createAsyncThunk('loyalty/saveSettings', async (settings: LoyaltySettings) => {
    const response = await api.post<{ value: LoyaltySettings }>('/settings/loyalty', settings);
    return response.value;
});

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoyaltySettings.fulfilled, (state, action: PayloadAction<LoyaltySettings>) => {
        if(action.payload) {
            state.loyaltySettings = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(saveLoyaltySettings.fulfilled, (state, action: PayloadAction<LoyaltySettings>) => {
        state.loyaltySettings = action.payload;
      });
  },
});

export default loyaltySlice.reducer;