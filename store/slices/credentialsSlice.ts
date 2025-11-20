import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Credential } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';
import { generateActivationCode } from './customersSlice'; 
import { addNotification } from './notificationsSlice';

interface CredentialsState {
  items: Credential[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CredentialsState = {
  items: [],
  status: 'idle',
};

// This might be an admin-only endpoint
export const fetchCredentials = createAsyncThunk('credentials/fetchCredentials', async () => {
  const response = await api.get<Credential[]>('/credentials');
  return response;
});

export const updateCredentialRole = createAsyncThunk(
    'credentials/updateRole',
    async ({ redboxId, role }: { redboxId: number; role: Credential['role'] }, { dispatch, rejectWithValue }) => {
        try {
            // Assuming the backend has an endpoint to update roles specifically
            // or a general credential update endpoint. Using a specific one for clarity.
            const response = await api.put<Credential>('/credentials/role', { redboxId, role });
            dispatch(addNotification({ type: 'success', message: `User permission updated to: ${role.toUpperCase()}` }));
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCredentials.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCredentials.fulfilled, (state, action: PayloadAction<Credential[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCredentials.rejected, (state) => {
        state.status = 'failed';
      })
      // When a new activation code is generated via customersSlice, update it here too.
      .addCase(generateActivationCode.fulfilled, (state, action: PayloadAction<{ redboxId: number; code: string }>) => {
        const { redboxId, code } = action.payload;
        const index = state.items.findIndex(cred => cred.redboxId === redboxId);
        if (index !== -1) {
            state.items[index].oneTimeCode = code;
        }
      })
      .addCase(updateCredentialRole.fulfilled, (state, action: PayloadAction<Credential>) => {
          const updatedCred = action.payload;
          const index = state.items.findIndex(c => c.redboxId === updatedCred.redboxId);
          if (index !== -1) {
              state.items[index] = updatedCred;
          } else {
              // If for some reason it wasn't in the list (shouldn't happen if fetched), add it
              state.items.push(updatedCred);
          }
      });
  },
});

export const selectAllCredentials = (state: RootState) => state.credentials.items;

export default credentialsSlice.reducer;