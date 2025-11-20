import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';
import { storageService } from '../../services/storageService';
import { api } from '../../services/apiService';
import { addPasswordResetRequest } from './passwordResetSlice';
import { addNotification } from './notificationsSlice';

type UserRole = 'admin' | 'customer' | 'finance';

interface User {
    id: number | 'admin' | 'finance';
    username: string;
    role: UserRole;
    name?: string;
    token?: string; // To hold the auth token
    // FIX: Added mustChangePassword to support mandatory password changes for new users.
    mustChangePassword?: boolean;
}

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const savedUser = storageService.getItem<User | null>('user', null);

const initialState: AuthState = {
  user: savedUser,
  status: 'idle',
  error: null,
};

// Thunks for API interaction
export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }: { username: string, password: string }, { rejectWithValue }) => {
        try {
            const { user, token } = await api.post<{ user: Omit<User, 'token'>, token: string }>('/login', { username, password });
            const authenticatedUser: User = { ...user, token };
            storageService.setItem('user', authenticatedUser);
            return authenticatedUser;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerCustomer = createAsyncThunk(
    'auth/registerCustomer',
    async (registrationData: { redboxId: string; oneTimeCode: string; password: string }, { dispatch, rejectWithValue }) => {
        try {
            const { user, token } = await api.post<{ user: Omit<User, 'token'>, token: string }>('/register', registrationData);
            const authenticatedUser: User = { ...user, token };
            storageService.setItem('user', authenticatedUser);
            dispatch(addNotification({ type: 'success', message: `Registration successful! Welcome, ${user.name}.`}));
            return authenticatedUser;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePassword = createAsyncThunk(
    'auth/updatePassword',
    async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }, { dispatch, rejectWithValue }) => {
        try {
            await api.post('/user/password', { currentPassword, newPassword });
            dispatch(addNotification({ type: 'success', message: 'Password updated successfully.'}));
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const requestPasswordReset = createAsyncThunk(
    'auth/requestPasswordReset',
    async (identifier: string, { dispatch, rejectWithValue }) => {
        try {
            const { message } = await api.post<{ message: string }>('/password-reset/request', { identifier });
            // The backend should handle sending notifications to admins.
            // We show a generic success message to the user.
            dispatch(addNotification({ type: 'info', message: 'If an account with that identifier exists, a reset request has been sent.' }));
            return message;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      storageService.setItem('user', null);
    },
    clearAuthError(state) {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(registerCustomer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // FIX: Handle successful password updates to clear the mandatory change flag.
      .addCase(updatePassword.fulfilled, (state) => {
        if (state.user) {
            const updatedUser = { ...state.user, mustChangePassword: false };
            state.user = updatedUser;
            storageService.setItem('user', updatedUser);
        }
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;