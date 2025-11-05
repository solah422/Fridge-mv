import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PasswordResetRequest } from '../../types';
import { db } from '../../services/dbService';
import { RootState } from '..';
import { generateOneTimeCode } from '../../utils/crypto';
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
  return await db.passwordResetRequests.toArray();
});

export const addPasswordResetRequest = createAsyncThunk(
    'passwordReset/add',
    async (requestData: Omit<PasswordResetRequest, 'id' | 'createdAt' | 'status'>) => {
        const newRequest: PasswordResetRequest = {
            ...requestData,
            id: `RESET-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'pending',
        };
        await db.passwordResetRequests.add(newRequest);
        return newRequest;
    }
);

export const updatePasswordResetRequests = createAsyncThunk('passwordReset/update', async (requests: PasswordResetRequest[]) => {
    await db.passwordResetRequests.bulkPut(requests);
    return requests;
});

export const approvePasswordReset = createAsyncThunk(
    'passwordReset/approve',
    async (requestId: string, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const request = state.passwordReset.items.find(r => r.id === requestId);

        if (!request) {
            return rejectWithValue('Request not found.');
        }

        const credential = await db.credentials.where('redboxId').equals(request.redboxId).first();
        if (!credential) {
            return rejectWithValue('Credential for customer not found.');
        }

        const newCode = generateOneTimeCode();

        await db.transaction('rw', db.credentials, db.passwordResetRequests, async () => {
            // 1. Reset password and set new one-time code
            await db.credentials.update(credential.id!, {
                hashedPassword: null,
                oneTimeCode: newCode
            });
            // 2. Mark request as completed
            await db.passwordResetRequests.update(requestId, { status: 'completed' });
        });

        dispatch(addNotification({
            type: 'success',
            message: `Reset approved for ${request.customerName}. New one-time code: ${newCode}`,
            duration: 15000 // Keep notification on screen longer
        }));
        
        // Return updated list of requests
        return await db.passwordResetRequests.toArray();
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
