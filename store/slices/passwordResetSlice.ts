import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PasswordResetRequest } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';
import { addNotification } from './notificationsSlice';

interface PasswordResetState {
  items: PasswordResetRequest[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: PasswordResetState = {
  items: [],
  status: 'idle',
};

export const fetchPasswordResetRequests = createAsyncThunk('passwordReset/fetch', async () => {
  return await api.get<PasswordResetRequest[]>('/password-reset/requests');
});

export const addPasswordResetRequest = createAsyncThunk(
    'passwordReset/add',
    async (requestData: Omit<PasswordResetRequest, 'id' | 'createdAt' | 'status'>) => {
        return await api.post<PasswordResetRequest>('/password-reset/request', requestData);
    }
);

export const updatePasswordResetRequests = createAsyncThunk('passwordReset/update', async (requests: PasswordResetRequest[]) => {
    return await api.put<PasswordResetRequest[]>('/password-reset/requests', requests);
});

export const approvePasswordReset = createAsyncThunk(
    'passwordReset/approve',
    async (requestId: string, { dispatch, rejectWithValue }) => {
        try {
            const { newCode, customerName } = await api.post<{ newCode: string, customerName: string }>(`/password-reset/approve`, { requestId });
            dispatch(addNotification({
                type: 'success',
                message: `Reset approved for ${customerName}. New one-time code: ${newCode}`,
                duration: 15000
            }));
            // Refetch all requests to get the updated list
            const updatedRequests = await api.get<PasswordResetRequest[]>('/password-reset/requests');
            return updatedRequests;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


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
      })
      .addCase(approvePasswordReset.fulfilled, (state, action: PayloadAction<PasswordResetRequest[]>) => {
        state.items = action.payload;
      });
  },
});

export const selectAllPasswordResetRequests = (state: RootState) => state.passwordReset.items;
export default passwordResetSlice.reducer;