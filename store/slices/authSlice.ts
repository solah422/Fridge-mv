import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '..';
import { Customer } from '../../types';
import { storageService } from '../../services/storageService';
// FIX: Import db service and crypto utils, remove deprecated apiService.
import { db } from '../../services/dbService';
import { hashPassword } from '../../utils/crypto';
import { updateCustomers } from './customersSlice';
import { addPasswordResetRequest } from './passwordResetSlice';
import { addNotification } from './notificationsSlice';

// FIX: Add 'finance' role.
type UserRole = 'admin' | 'customer' | 'finance';

interface User {
    // FIX: Add 'finance' id type.
    id: number | 'admin' | 'finance';
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
// FIX: Rewrote login logic to use secure hashing and the credentials database table.
export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }: { username: string, password: string }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const customers = state.customers.items;
        
        const hashedPassword = await hashPassword(password);
        
        // Check for admin
        if (username.toLowerCase() === 'admin') {
            const adminCredential = await db.credentials.where('username').equals('admin').first();
            if (adminCredential && adminCredential.hashedPassword === hashedPassword) {
                const adminUser: User = { id: 'admin', username: 'admin', role: 'admin' };
                storageService.setItem('user', adminUser);
                return adminUser;
            }
        }
        
        // Check for finance
        if (username.toLowerCase() === 'finance') {
            const financeCredential = await db.credentials.where('username').equals('finance').first();
            if (financeCredential && financeCredential.hashedPassword === hashedPassword) {
                const financeUser: User = { id: 'finance', username: 'finance', role: 'finance', name: 'Finance Manager' };
                storageService.setItem('user', financeUser);
                return financeUser;
            }
        }
        
        // Check for customer
        const customerRedboxId = parseInt(username, 10);
        if (!isNaN(customerRedboxId)) {
            const customerCredential = await db.credentials.where('redboxId').equals(customerRedboxId).first();
            if (customerCredential && customerCredential.hashedPassword === hashedPassword) {
                const customer = customers.find(c => c.redboxId === customerRedboxId);
                if (customer) {
                    const customerUser: User = { id: customer.id, username: customer.redboxId!.toString(), role: 'customer', name: customer.name };
                    storageService.setItem('user', customerUser);
                    return customerUser;
                }
            }
        }

        return rejectWithValue('Invalid username or password');
    }
);

// FIX: Rewrote admin password update logic to use secure hashing and the credentials database table.
export const updateAdminPassword = createAsyncThunk(
    'auth/updateAdminPassword',
    async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }, { rejectWithValue }) => {
        const adminCredential = await db.credentials.where('username').equals('admin').first();
        if (!adminCredential) {
            return rejectWithValue('Admin account not found.');
        }
        const currentHashedPassword = await hashPassword(currentPassword);
        if (adminCredential.hashedPassword !== currentHashedPassword) {
            return rejectWithValue('Current password does not match.');
        }
        const newHashedPassword = await hashPassword(newPassword);
        await db.credentials.update(adminCredential.id!, { hashedPassword: newHashedPassword });
        return;
    }
);

// FIX: Rewrote finance password update logic to use secure hashing and the credentials database table.
export const updateFinancePassword = createAsyncThunk(
    'auth/updateFinancePassword',
    async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }, { rejectWithValue }) => {
        const financeCredential = await db.credentials.where('username').equals('finance').first();
        if (!financeCredential) {
            return rejectWithValue('Finance account not found.');
        }
        const currentHashedPassword = await hashPassword(currentPassword);
        if (financeCredential.hashedPassword !== currentHashedPassword) {
            return rejectWithValue('Current password does not match.');
        }
        const newHashedPassword = await hashPassword(newPassword);
        await db.credentials.update(financeCredential.id!, { hashedPassword: newHashedPassword });
        return;
    }
);

// FIX: Rewrote mandatory finance password update logic to use secure hashing and the credentials/appSettings tables.
export const forceFinancePasswordUpdate = createAsyncThunk(
    'auth/forceFinancePasswordUpdate',
    async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }, { rejectWithValue }) => {
        const financeCredential = await db.credentials.where('username').equals('finance').first();
         if (!financeCredential) {
            return rejectWithValue('Finance account not found.');
        }
        const currentHashedPassword = await hashPassword(currentPassword);
        if (financeCredential.hashedPassword !== currentHashedPassword) {
            return rejectWithValue('Invalid temporary password. Please contact an admin.');
        }
        const newHashedPassword = await hashPassword(newPassword);
        await db.credentials.update(financeCredential.id!, { hashedPassword: newHashedPassword });
        await db.appSettings.put({ key: 'financePasswordChanged', value: true });
        return;
    }
);

// FIX: Rewrote customer password update logic to use secure hashing and the credentials database table.
export const updateCustomerPassword = createAsyncThunk(
    'auth/updateCustomerPassword',
    async ({ customerId, currentPassword, newPassword }: { customerId: number, currentPassword: string, newPassword: string }, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const customers = state.customers.items;
        const customer = customers.find(c => c.id === customerId);

        if (!customer || !customer.redboxId) {
            return rejectWithValue('Customer not found or has no Redbox ID.');
        }

        const credential = await db.credentials.where('redboxId').equals(customer.redboxId).first();
        if (!credential) {
            return rejectWithValue('Credential not found for this customer.');
        }

        const currentHashedPassword = await hashPassword(currentPassword);
        if (credential.hashedPassword !== currentHashedPassword) {
            return rejectWithValue('Current password does not match.');
        }

        const newHashedPassword = await hashPassword(newPassword);
        await db.credentials.update(credential.id!, { hashedPassword: newHashedPassword });
        
        dispatch(addNotification({ type: 'success', message: 'Password updated successfully.'}));
        return;
    }
);


export const requestPasswordReset = createAsyncThunk(
    'auth/requestPasswordReset',
    async (identifier: string, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const customers = state.customers.items;
        const lowerIdentifier = identifier.toLowerCase();

        if (lowerIdentifier === 'admin' || lowerIdentifier === 'finance') {
            const message = 'Admin/Finance passwords cannot be reset from this form. Please contact an administrator directly.';
            dispatch(addNotification({ type: 'error', message }));
            return rejectWithValue(message);
        }

        const customer = customers.find(c => 
            c.redboxId?.toString() === lowerIdentifier || (c.email && c.email.toLowerCase() === lowerIdentifier)
        );

        if (customer && customer.redboxId) {
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

// FIX: Rewrote customer registration to use one-time codes and secure hashing.
export const registerCustomer = createAsyncThunk(
    'auth/registerCustomer',
    async (registrationData: { redboxId: string; oneTimeCode: string; password: string }, { getState, dispatch, rejectWithValue }) => {
        const { redboxId, oneTimeCode, password } = registrationData;
        const numericRedboxId = parseInt(redboxId, 10);

        if (isNaN(numericRedboxId)) {
            return rejectWithValue('Redbox ID must be a number.');
        }

        const credential = await db.credentials.where('redboxId').equals(numericRedboxId).first();
        if (!credential) {
            return rejectWithValue('Invalid Redbox ID. Please contact an admin to get your ID.');
        }

        if (credential.hashedPassword) { // If password is set, it's considered registered
            return rejectWithValue('This Redbox ID has already been registered. Please use "Forgot Password" if you need to reset your access.');
        }
        
        if (credential.oneTimeCode !== oneTimeCode) {
            return rejectWithValue('Invalid activation code.');
        }

        const newHashedPassword = await hashPassword(password);
        await db.credentials.update(credential.id!, {
            hashedPassword: newHashedPassword,
            oneTimeCode: null // Consume the one-time code
        });
        
        // Log in the new user
        const state = getState() as RootState;
        const customers = state.customers.items;
        const customer = customers.find(c => c.redboxId === numericRedboxId);

        if (!customer) {
            return rejectWithValue('Customer profile not found after activation.');
        }
        
        const customerUser: User = { id: customer.id, username: customer.redboxId!.toString(), role: 'customer', name: customer.name };
        storageService.setItem('user', customerUser);
        
        dispatch(addNotification({ type: 'success', message: `Registration successful! Welcome, ${customer.name}.`}));

        return customerUser;
    }
);

// FIX: Added a generic `updatePassword` thunk to be used by UI components.
export const updatePassword = createAsyncThunk(
    'auth/updatePassword',
    async ({ currentPassword, newPassword }: { currentPassword: string, newPassword: string }, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const user = state.auth.user;

        if (!user) {
            return rejectWithValue('No user logged in.');
        }

        if (user.role === 'admin') {
            return dispatch(updateAdminPassword({ currentPassword, newPassword }));
        } else if (user.role === 'finance') {
            return dispatch(updateFinancePassword({ currentPassword, newPassword }));
        } else if (user.role === 'customer') {
            return dispatch(updateCustomerPassword({ customerId: user.id as number, currentPassword, newPassword }));
        }

        return rejectWithValue('Invalid user role for password update.');
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
