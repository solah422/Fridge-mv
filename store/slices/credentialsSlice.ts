import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Credential } from '../../types';
import { db } from '../../services/dbService';
import { RootState } from '..';
import { generateActivationCode } from './customersSlice'; // Import the specific thunk

interface CredentialsState {
  items: Credential[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CredentialsState = {
  items: [],
  status: 'idle',
};

export const fetchCredentials = createAsyncThunk('credentials/fetchCredentials', async () => {
  const response = await db.credentials.toArray();
  return response;
});

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
      .addCase(generateActivationCode.fulfilled, (state, action: PayloadAction<{ redboxId: number; code: string }>) => {
        const { redboxId, code } = action.payload;
        const index = state.items.findIndex(cred => cred.redboxId === redboxId);
        if (index !== -1) {
            state.items[index].oneTimeCode = code;
        }
      });
  },
});

export const selectAllCredentials = (state: RootState) => state.credentials.items;

export default credentialsSlice.reducer;
