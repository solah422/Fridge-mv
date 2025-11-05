import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, ReturnEvent, InventoryEvent, Customer, GiftCard, Product } from '../../types';
import { db, saveTransactionFlow } from '../../services/dbService';
import { RootState } from '..';

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
  const response = await db.transactions.toArray();
  return response;
});

export const saveTransaction = createAsyncThunk(
  'transactions/saveTransaction',
  async ({ transaction, source }: { transaction: Transaction, source: 'pos' | 'customer' }, { getState, dispatch }) => {
    const state = getState() as RootState;
    
    // Optimistic Update: Add transaction to state immediately for snappy UI
    dispatch(transactionsSlice.actions.addTransactionOptimistic(transaction));

    // Prepare all database updates
    let updatedProducts: Product[] = [];
    let updatedCustomer: Customer | null = null;
    let updatedGiftCards: GiftCard[] = [];
    const saleEvents: InventoryEvent[] = [];
    
    const { loyaltySettings } = state.loyalty;
    const allProducts = [...state.products.items];

    // 1. Calculate Product Stock Changes
    transaction.items.forEach(item => {
        const product = allProducts.find(p => p.id === item.id);
        if (!product) return;

        if (product.isBundle && product.bundleItems) {
            product.bundleItems.forEach(bundleItem => {
                const componentProductIndex = allProducts.findIndex(p => p.id === bundleItem.productId);
                if (componentProductIndex > -1) {
                    const totalDeduction = bundleItem.quantity * item.quantity;
                    allProducts[componentProductIndex].stock -= totalDeduction;
                    saleEvents.push({ id: `evt-${Date.now()}-${bundleItem.productId}`, productId: bundleItem.productId, type: 'sale', quantityChange: -totalDeduction, date: transaction.date, relatedId: transaction.id, notes: `Sale of bundle '${product.name}'` });
                    updatedProducts.push(allProducts[componentProductIndex]);
                }
            });
        } else {
            const productIndex = allProducts.findIndex(p => p.id === item.id);
            if (productIndex > -1) {
                allProducts[productIndex].stock -= item.quantity;
                saleEvents.push({ id: `evt-${Date.now()}-${item.id}`, productId: item.id, type: 'sale', quantityChange: -item.quantity, date: transaction.date, relatedId: transaction.id });
                updatedProducts.push(allProducts[productIndex]);
            }
        }
    });

    // 2. Calculate Customer Loyalty Changes
    const allCustomers = [...state.customers.items];
    const customerIndex = allCustomers.findIndex(c => c.id === transaction.customerId);

    if (customerIndex > -1 && loyaltySettings.enabled && loyaltySettings.pointsPerMvr > 0) {
        const customer = { ...allCustomers[customerIndex] }; // Create a copy
        const sortedTiers = [...loyaltySettings.tiers].sort((a, b) => b.minPoints - a.minPoints);
        
        const currentTier = sortedTiers.find(t => t.id === customer.loyaltyTierId);
        const pointMultiplier = currentTier ? currentTier.pointMultiplier : 1;
        const pointsEarned = Math.floor(transaction.total * loyaltySettings.pointsPerMvr * pointMultiplier);
        
        if (pointsEarned > 0) {
            const newTotalPoints = (customer.loyaltyPoints || 0) + pointsEarned;
            customer.loyaltyPoints = newTotalPoints;
            const newTier = sortedTiers.find(t => newTotalPoints >= t.minPoints);
            if (newTier && newTier.id !== customer.loyaltyTierId) {
                customer.loyaltyTierId = newTier.id;
            }
        }
        updatedCustomer = customer;
    }
    
    // 3. Calculate Gift Card Balance Changes
    if (transaction.giftCardPayments && transaction.giftCardPayments.length > 0) {
        const allGiftCards = [...state.giftCards.items];
        for (const payment of transaction.giftCardPayments) {
            const cardIndex = allGiftCards.findIndex(gc => gc.id === payment.cardId);
            if (cardIndex > -1) {
                const cardToUpdate = { ...allGiftCards[cardIndex] };
                const newBalance = cardToUpdate.currentBalance - payment.amount;
                cardToUpdate.currentBalance = newBalance;
                cardToUpdate.isEnabled = newBalance > 0;
                updatedGiftCards.push(cardToUpdate);
            }
        }
    }
    
    // 4. Perform atomic database write
    await saveTransactionFlow(transaction, updatedProducts, updatedCustomer, updatedGiftCards, saleEvents);
    
    // 5. Return data to update Redux state from the single source of truth (DB)
    return { transaction, updatedProducts, updatedCustomer, updatedGiftCards, saleEvents };
  }
);

export const updateTransaction = createAsyncThunk(
    'transactions/updateTransaction',
    async (updatedTransaction: Transaction) => {
        await db.transactions.put(updatedTransaction);
        const allTransactions = await db.transactions.toArray();
        return allTransactions;
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
      .addCase(saveTransaction.fulfilled, (state, action) => {
         // The optimistic update already added it. Now, we replace the whole list with the DB's truth if needed,
         // but for now, we just confirm the single transaction is correct.
         const existingIndex = state.items.findIndex(t => t.id === action.payload.transaction.id);
         if (existingIndex !== -1) {
            state.items[existingIndex] = action.payload.transaction;
         }
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.items = action.payload;
      });
  },
});

export const { addTransactionOptimistic } = transactionsSlice.actions;

export default transactionsSlice.reducer;