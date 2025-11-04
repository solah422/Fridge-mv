import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChaosSettings, ImpulseBuySettings, PantryLotterySettings, DebtDerbySettings, AIPersonalitySwapSettings, AIPersonality } from '../../types';
import { api } from '../../services/apiService';
import { RootState } from '..';

interface ChaosState {
  settings: ChaosSettings | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ChaosState = {
  settings: null,
  status: 'idle',
};

export const fetchChaosSettings = createAsyncThunk('chaos/fetchSettings', async () => {
  return await api.chaosSettings.fetch();
});

export const saveChaosSettings = createAsyncThunk(
  'chaos/saveSettings',
  async (settings: ChaosSettings, { rejectWithValue }) => {
    try {
      await api.chaosSettings.save(settings);
      return settings;
    } catch (error) {
      return rejectWithValue('Failed to save settings');
    }
  }
);

const chaosSlice = createSlice({
  name: 'chaos',
  initialState,
  reducers: {
    updateImpulseBuySettings(state, action: PayloadAction<Partial<ImpulseBuySettings>>) {
      if (state.settings) {
        state.settings.impulseBuy = { ...state.settings.impulseBuy, ...action.payload };
      }
    },
    updatePantryLotterySettings(state, action: PayloadAction<Partial<PantryLotterySettings>>) {
      if (state.settings) {
        state.settings.pantryLottery = { ...state.settings.pantryLottery, ...action.payload };
      }
    },
    updateDebtDerbySettings(state, action: PayloadAction<Partial<DebtDerbySettings>>) {
      if (state.settings) {
        state.settings.debtDerby = { ...state.settings.debtDerby, ...action.payload };
      }
    },
    updateAIPersonalitySwapSettings(state, action: PayloadAction<Partial<AIPersonalitySwapSettings>>) {
      if (state.settings) {
        state.settings.aiPersonalitySwap = { ...state.settings.aiPersonalitySwap, ...action.payload };
      }
    },
    addOrUpdateAIPersonality(state, action: PayloadAction<AIPersonality>) {
        if(state.settings) {
            const index = state.settings.aiPersonalitySwap.personalities.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.settings.aiPersonalitySwap.personalities[index] = action.payload;
            } else {
                state.settings.aiPersonalitySwap.personalities.push(action.payload);
            }
        }
    },
    removeAIPersonality(state, action: PayloadAction<string>) {
        if(state.settings) {
            state.settings.aiPersonalitySwap.personalities = state.settings.aiPersonalitySwap.personalities.filter(p => p.id !== action.payload);
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChaosSettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChaosSettings.fulfilled, (state, action: PayloadAction<ChaosSettings>) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchChaosSettings.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(saveChaosSettings.fulfilled, (state, action: PayloadAction<ChaosSettings>) => {
        state.settings = action.payload;
      });
  },
});

export const { 
    updateImpulseBuySettings, 
    updatePantryLotterySettings,
    updateDebtDerbySettings,
    updateAIPersonalitySwapSettings,
    addOrUpdateAIPersonality,
    removeAIPersonality,
} = chaosSlice.actions;

export const selectChaosSettings = (state: RootState) => state.chaos.settings;

export default chaosSlice.reducer;
