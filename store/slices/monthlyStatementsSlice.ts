import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MonthlyStatement } from '../../types';
import { api } from '../../services/apiService';
import { RootState } from '..';

interface MonthlyStatementsState {
  items: MonthlyStatement[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: MonthlyStatementsState = {
  items: [],
  status: 'idle',
};

export const fetchMonthlyStatements = createAsyncThunk('monthlyStatements/fetch', async () => {
  return await api.monthlyStatements.fetch();
});

export const addMonthlyStatements = createAsyncThunk('monthlyStatements/add', async (statements: MonthlyStatement[], { getState }) => {
    const state = getState() as RootState;
    const updatedStatements = [...state.monthlyStatements.items];
    
    // Avoid duplicates
    statements.forEach(newStatement => {
        if (!updatedStatements.some(existing => existing.id === newStatement.id)) {
            updatedStatements.push(newStatement);
        }
    });

    await api.monthlyStatements.save(updatedStatements);
    return updatedStatements;
});

export const updateMonthlyStatement = createAsyncThunk('monthlyStatements/update', async (statement: MonthlyStatement, { getState }) => {
    const state = getState() as RootState;
    const updatedItems = state.monthlyStatements.items.map(s => s.id === statement.id ? statement : s);
    await api.monthlyStatements.save(updatedItems);
    return updatedItems;
});

const monthlyStatementsSlice = createSlice({
  name: 'monthlyStatements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyStatements.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMonthlyStatements.fulfilled, (state, action: PayloadAction<MonthlyStatement[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(addMonthlyStatements.fulfilled, (state, action: PayloadAction<MonthlyStatement[]>) => {
        state.items = action.payload;
      })
      .addCase(updateMonthlyStatement.fulfilled, (state, action: PayloadAction<MonthlyStatement[]>) => {
        state.items = action.payload;
      });
  },
});

export const selectAllMonthlyStatements = (state: RootState) => state.monthlyStatements.items;

export default monthlyStatementsSlice.reducer;
