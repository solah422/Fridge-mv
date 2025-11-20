import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DailyReport } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

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
  return await api.get<DailyReport[]>('/reports/daily');
});

// The backend will generate the report based on transactions for the day
export const addDailyReport = createAsyncThunk('reports/addDailyReport', async (report: DailyReport) => {
    return await api.post<DailyReport>('/reports/daily', report);
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