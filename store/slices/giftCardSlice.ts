import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GiftCard } from '../../types';
import { db } from '../../services/dbService';
import { RootState } from '..';

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
  return await db.giftCards.toArray();
});

export const saveGiftCards = createAsyncThunk('giftCards/saveGiftCards', async (cards: GiftCard[]) => {
    await db.giftCards.bulkPut(cards);
    return cards;
});

export const createGiftCard = createAsyncThunk(
    'giftCards/createGiftCard',
    async (cardData: { initialBalance: number; customerId: number; expiryDate?: string; }, { getState }) => {
        const newCard: GiftCard = {
            id: `GC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            initialBalance: cardData.initialBalance,
            currentBalance: cardData.initialBalance,
            isEnabled: true,
            customerId: cardData.customerId,
            expiryDate: cardData.expiryDate,
        };
        await db.giftCards.add(newCard);
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