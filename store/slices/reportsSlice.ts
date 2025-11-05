import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DailyReport } from '../../types';
import { db } from '../../services/dbService';
import { RootState } from '..';

interface ReportsState {
  dailyReports: DailyReport[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReportsState = {
  dailyReports: [],
  status: 'idle',
  error: null,
};

export const fetchDailyReports = createAsyncThunk('reports/fetchDailyReports', async () => {
  return await db.dailyReports.toArray();
});

export const addDailyReport = createAsyncThunk('reports/addDailyReport', async (report: DailyReport) => {
    await db.dailyReports.add(report);
    return report;
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyReports.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDailyReports.fulfilled, (state, action: PayloadAction<DailyReport[]>) => {
        state.status = 'succeeded';
        state.dailyReports = action.payload;
      })
      .addCase(fetchDailyReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addDailyReport.fulfilled, (state, action: PayloadAction<DailyReport>) => {
        state.dailyReports.push(action.payload);
      });
  },
});

export const selectAllDailyReports = (state: RootState) => state.reports.dailyReports;
export default reportsSlice.reducer;