import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, ReturnEvent, InventoryEvent } from '../../types';
import { api, saveTransactionOffline } from '../../services/apiService';
import { RootState } from '..';
import { updateProducts } from './productsSlice';
import { updateCustomers } from './customersSlice';
import { addInventoryEvents } from './inventoryHistorySlice';
import { saveGiftCards } from './giftCardSlice';

interface TransactionsState {
  items: Transaction[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTransactions = createAsyncThunk('transactions/fetchTransactions', async () => {
  const response = await api.transactions.fetch();
  return response;
});

export const saveTransaction = createAsyncThunk(
  'transactions/saveTransaction',
  async ({ transaction, source }: { transaction: Transaction, source: 'pos' | 'customer' }, { getState, dispatch }) => {
    const state = getState() as RootState;
    
    // Optimistic Update: Add transaction to state immediately
    dispatch(transactionsSlice.actions.addTransactionOptimistic(transaction));

    // Prepare updates for other slices
    let updatedProducts = [...state.products.items];
    const saleEvents: InventoryEvent[] = [];
    const { loyaltySettings } = state.loyalty;

    transaction.items.forEach(item => {
        const product = updatedProducts.find(p => p.id === item.id);
        if (!product) return;

        if (product.isBundle && product.bundleItems) {
            product.bundleItems.forEach(bundleItem => {
                const componentProductIndex = updatedProducts.findIndex(p => p.id === bundleItem.productId);
                if (componentProductIndex > -1) {
                    const totalDeduction = bundleItem.quantity * item.quantity;
                    updatedProducts[componentProductIndex].stock -= totalDeduction;
                    saleEvents.push({ id: `evt-${Date.now()}-${bundleItem.productId}`, productId: bundleItem.productId, type: 'sale', quantityChange: -totalDeduction, date: transaction.date, relatedId: transaction.id, notes: `Sale of bundle '${product.name}'` });
                }
            });
        } else {
            const productIndex = updatedProducts.findIndex(p => p.id === item.id);
            if (productIndex > -1) {
                updatedProducts[productIndex].stock -= item.quantity;
                saleEvents.push({ id: `evt-${Date.now()}-${item.id}`, productId: item.id, type: 'sale', quantityChange: -item.quantity, date: transaction.date, relatedId: transaction.id });
            }
        }
    });

    let updatedCustomers = [...state.customers.items];
    const customerIndex = updatedCustomers.findIndex(c => c.id === transaction.customer.id);

    if (customerIndex > -1 && loyaltySettings.enabled && loyaltySettings.pointsPerMvr > 0) {
        const customer = updatedCustomers[customerIndex];
        const sortedTiers = [...loyaltySettings.tiers].sort((a, b) => b.minPoints - a.minPoints);
        
        const currentTier = sortedTiers.find(t => t.id === customer.loyaltyTierId);
        const pointMultiplier = currentTier ? currentTier.pointMultiplier : 1;

        const pointsEarned = Math.floor(transaction.total * loyaltySettings.pointsPerMvr * pointMultiplier);
        
        if (pointsEarned > 0) {
            const newTotalPoints = (customer.loyaltyPoints || 0) + pointsEarned;
            customer.loyaltyPoints = newTotalPoints;

            // Check for tier promotion
            const newTier = sortedTiers.find(t => newTotalPoints >= t.minPoints);
            if (newTier && newTier.id !== customer.loyaltyTierId) {
                customer.loyaltyTierId = newTier.id;
            }
            updatedCustomers[customerIndex] = customer;
        }
    }
    
    // Dispatch updates for related slices
    dispatch(updateProducts(updatedProducts));
    dispatch(updateCustomers(updatedCustomers));
    dispatch(addInventoryEvents(saleEvents));
    
    // Gift Card Consumption Logic
    if (transaction.giftCardPayments && transaction.giftCardPayments.length > 0) {
        const { items: allGiftCards } = state.giftCards;
        let updatedGiftCards = [...allGiftCards];

        for (const payment of transaction.giftCardPayments) {
            const cardIndex = updatedGiftCards.findIndex(gc => gc.id === payment.cardId);
            if (cardIndex > -1) {
                const cardToUpdate = { ...updatedGiftCards[cardIndex] }; // Create a copy
                const newBalance = cardToUpdate.currentBalance - payment.amount;
                
                cardToUpdate.currentBalance = newBalance;
                cardToUpdate.isEnabled = newBalance > 0; // Deactivate if balance is 0 or less
                
                updatedGiftCards[cardIndex] = cardToUpdate;
            }
        }
        await dispatch(saveGiftCards(updatedGiftCards));
    }
    
    // API call
    if (state.app.isOnline) {
      // Re-get state after optimistic update to get the correct list to save
      const latestState = getState() as RootState;
      await api.transactions.save(latestState.transactions.items);
    } else {
      await saveTransactionOffline(transaction);
    }
    
    return transaction;
  }
);

export const updateTransaction = createAsyncThunk(
    'transactions/updateTransaction',
    async (updatedTransaction: Transaction, { getState }) => {
        const state = getState() as RootState;
        const newTransactions = state.transactions.items.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
        await api.transactions.save(newTransactions);
        return newTransactions;
    }
);


const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransactionOptimistic: (state, action: PayloadAction<Transaction>) => {
      // For optimistic UI update. The final state will be set by the thunk's fulfilled action.
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(saveTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
         // The optimistic update already added it, we just ensure it's correct and not duplicated.
         const existing = state.items.find(t => t.id === action.payload.id);
         if (!existing) {
             state.items.push(action.payload);
         } else {
            // if it exists, update it to ensure state is consistent
            state.items = state.items.map(item => item.id === action.payload.id ? action.payload : item);
         }
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.items = action.payload;
      });
  },
});

export default transactionsSlice.reducer;
