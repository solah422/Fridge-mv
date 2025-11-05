import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MonthlyStatement } from '../../types';
import { db } from '../../services/dbService';
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
  return await db.monthlyStatements.toArray();
});

export const addMonthlyStatements = createAsyncThunk('monthlyStatements/add', async (statements: MonthlyStatement[]) => {
    await db.monthlyStatements.bulkAdd(statements);
    // Return all statements from DB to ensure consistency
    return await db.monthlyStatements.toArray();
});

export const updateMonthlyStatement = createAsyncThunk('monthlyStatements/update', async (statement: MonthlyStatement) => {
    await db.monthlyStatements.put(statement);
    return await db.monthlyStatements.toArray();
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