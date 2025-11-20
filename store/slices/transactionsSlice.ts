import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, ReturnEvent, InventoryEvent, Customer, GiftCard, Product } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

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
  const response = await api.get<Transaction[]>('/transactions');
  return response;
});

export const saveTransaction = createAsyncThunk(
  'transactions/saveTransaction',
  async ({ transaction, source }: { transaction: Transaction, source: 'pos' | 'customer' }, { rejectWithValue, dispatch }) => {
    try {
        // Optimistic Update
        dispatch(transactionsSlice.actions.addTransactionOptimistic(transaction));
        
        // The backend is now responsible for atomicity (updating products, customers, etc.)
        const response = await api.post<{
            transaction: Transaction,
            updatedProducts: Product[],
            updatedCustomer: Customer,
            updatedGiftCards: GiftCard[],
            saleEvents: InventoryEvent[],
        }>('/transactions', { transaction, source });
        
        return response;
    } catch (error: any) {
        // Here you might want to dispatch an action to revert the optimistic update
        return rejectWithValue(error.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
    'transactions/updateTransaction',
    async (updatedTransaction: Transaction) => {
        // API should handle returns logic (updating stock, etc.)
        const response = await api.put<Transaction[]>(`/transactions/${updatedTransaction.id}`, updatedTransaction);
        return response;
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
         // The optimistic update already added it. Here we replace it with the final version from the server.
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