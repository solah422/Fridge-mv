import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import { Customer } from '../../types';
import { storageService } from '../../services/storageService';
import { api } from '../../services/apiService';
import { updateCustomers } from './customersSlice';
import { addPasswordResetRequest } from './passwordResetSlice';
import { addNotification } from './notificationsSlice';

type UserRole = 'admin' | 'customer';

interface User {
    id: number | 'admin';
    username: string;
    role: UserRole;
    name?: string; // for customers
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

// Thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }: { username: string, password: string }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const customers = state.customers.items;
        
        // Check for admin
        if (username.toLowerCase() === 'admin') {
            const { adminPassword } = await api.auth.fetch();
            if (password === adminPassword) {
                const adminUser: User = { id: 'admin', username: 'admin', role: 'admin' };
                storageService.setItem('user', adminUser);
                return adminUser;
            }
        }
        
        // Check for customer
        const customer = customers.find(c => c.redboxId?.toString() === username);
        if (customer && customer.password === password) {
            const customerUser: User = { id: customer.id, username: customer.redboxId!.toString(), role: 'customer', name: customer.name };
            storageService.setItem('user', customerUser);
            return customerUser;
        }

        return rejectWithValue('Invalid username or password');
    }
);

export const updateAdminPassword = createAsyncThunk(
    'auth/updateAdminPassword',
    async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }, { rejectWithValue }) => {
        const authData = await api.auth.fetch();
        if (authData.adminPassword !== currentPassword) {
            return rejectWithValue('Current password does not match.');
        }
        await api.auth.save({ adminPassword: newPassword });
        return;
    }
);

export const requestPasswordReset = createAsyncThunk(
    'auth/requestPasswordReset',
    async (identifier: string, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const customers = state.customers.items;
        const lowerIdentifier = identifier.toLowerCase();

        if (lowerIdentifier === 'admin') {
            const message = 'Admin password cannot be reset from this form.';
            dispatch(addNotification({ type: 'error', message }));
            return rejectWithValue(message);
        }

        const customer = customers.find(c => 
            c.redboxId?.toString() === lowerIdentifier || (c.email && c.email.toLowerCase() === lowerIdentifier)
        );

        if (customer && customer.password && customer.redboxId) {
            // Check if a pending request already exists for this customer
            const existingRequests = state.passwordReset.items;
            const hasPendingRequest = existingRequests.some(req => req.customerId === customer.id && req.status === 'pending');
            if (hasPendingRequest) {
                const message = 'A reset request for this account is already pending admin approval.';
                dispatch(addNotification({ type: 'info', message }));
                return { message };
            }

            await dispatch(addPasswordResetRequest({
                customerId: customer.id,
                customerName: customer.name,
                redboxId: customer.redboxId
            }));
            const successMessage = `A password reset request has been sent to the administrator.`;
            dispatch(addNotification({ type: 'success', message: successMessage }));
            return { message: successMessage };
        } else {
            // Generic message to prevent account enumeration
            const genericMessage = `If an account with that identifier exists, a reset request has been sent.`;
            dispatch(addNotification({ type: 'info', message: genericMessage }));
            return { message: genericMessage };
        }
    }
);

export const registerCustomer = createAsyncThunk(
    'auth/registerCustomer',
    async (registrationData: { redboxId: string; password: string }, { getState, dispatch, rejectWithValue }) => {
        const { redboxId, password } = registrationData;
        const numericRedboxId = parseInt(redboxId, 10);

        if (isNaN(numericRedboxId)) {
            return rejectWithValue('Redbox ID must be a number.');
        }

        const state = getState() as RootState;
        const customers = state.customers.items;

        const customerIndex = customers.findIndex(c => c.redboxId === numericRedboxId);

        if (customerIndex === -1) {
            return rejectWithValue('Invalid Redbox ID. Please contact an admin to get your ID.');
        }

        const targetCustomer = customers[customerIndex];

        if (targetCustomer.password) { // If password is set, it's considered registered
            return rejectWithValue('This Redbox ID has already been registered. Please use "Forgot Password" if you need to reset your access.');
        }

        const updatedCustomer: Customer = {
            ...targetCustomer,
            password,
        };

        const updatedCustomers = [...customers];
        updatedCustomers[customerIndex] = updatedCustomer;
        
        await dispatch(updateCustomers(updatedCustomers));
        
        // Log in the new user
        const customerUser: User = { id: updatedCustomer.id, username: updatedCustomer.redboxId!.toString(), role: 'customer', name: updatedCustomer.name };
        storageService.setItem('user', customerUser);
        
        dispatch(addNotification({ type: 'success', message: `Registration successful! Welcome, ${updatedCustomer.name}.`}));

        return customerUser;
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
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;