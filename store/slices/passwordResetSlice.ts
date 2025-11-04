import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PasswordResetRequest } from '../../types';
import { api } from '../../services/apiService';
import { RootState } from '..';

interface PasswordResetState {
  items: PasswordResetRequest[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: PasswordResetState = {
  items: [],
  status: 'idle',
};

export const fetchPasswordResetRequests = createAsyncThunk('passwordReset/fetch', async () => {
  return await api.passwordResetRequests.fetch();
});

export const addPasswordResetRequest = createAsyncThunk(
    'passwordReset/add',
    async (requestData: Omit<PasswordResetRequest, 'id' | 'createdAt' | 'status'>, { getState }) => {
        const state = getState() as RootState;
        const newRequest: PasswordResetRequest = {
            ...requestData,
            id: `RESET-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'pending',
        };
        const updatedRequests = [...state.passwordReset.items, newRequest];
        await api.passwordResetRequests.save(updatedRequests);
        return newRequest;
    }
);

export const updatePasswordResetRequests = createAsyncThunk('passwordReset/update', async (requests: PasswordResetRequest[]) => {
    await api.passwordResetRequests.save(requests);
    return requests;
});

const passwordResetSlice = createSlice({
  name: 'passwordReset',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPasswordResetRequests.fulfilled, (state, action: PayloadAction<PasswordResetRequest[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(addPasswordResetRequest.fulfilled, (state, action: PayloadAction<PasswordResetRequest>) => {
        state.items.push(action.payload);
      })
      .addCase(updatePasswordResetRequests.fulfilled, (state, action: PayloadAction<PasswordResetRequest[]>) => {
        state.items = action.payload;
      });
  },
});

export const selectAllPasswordResetRequests = (state: RootState) => state.passwordReset.items;
export default passwordResetSlice.reducer;
