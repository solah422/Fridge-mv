import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GiftCard } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

interface GiftCardState {
  items: GiftCard[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: GiftCardState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchGiftCards = createAsyncThunk('giftCards/fetchGiftCards', async () => {
  return await api.get<GiftCard[]>('/gift-cards');
});

export const saveGiftCards = createAsyncThunk('giftCards/saveGiftCards', async (cards: GiftCard[]) => {
    return await api.put<GiftCard[]>('/gift-cards', cards);
});

export const createGiftCard = createAsyncThunk(
    'giftCards/createGiftCard',
    async (cardData: { initialBalance: number; customerId: number; expiryDate?: string; }) => {
        const newCard = await api.post<GiftCard>('/gift-cards', cardData);
        return newCard;
    }
);


const giftCardSlice = createSlice({
  name: 'giftCards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGiftCards.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGiftCards.fulfilled, (state, action: PayloadAction<GiftCard[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchGiftCards.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(saveGiftCards.fulfilled, (state, action: PayloadAction<GiftCard[]>) => {
        state.items = action.payload;
      })
      .addCase(createGiftCard.fulfilled, (state, action: PayloadAction<GiftCard>) => {
        state.items.push(action.payload);
      });
  },
});

export default giftCardSlice.reducer;