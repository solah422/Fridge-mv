import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../../types';
import { db } from '../../services/dbService';
import { RootState } from '..';
import { generateOneTimeCode } from '../../utils/crypto';

interface CustomersState {
  items: Customer[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCustomers = createAsyncThunk('customers/fetchCustomers', async () => {
  const response = await db.customers.toArray();
  return response;
});

export const updateCustomers = createAsyncThunk('customers/updateCustomers', async (customers: Customer[]) => {
    await db.customers.bulkPut(customers);
    return customers;
});

export const createCustomerWithCredential = createAsyncThunk(
    'customers/createWithCredential',
    async (customerData: Omit<Customer, 'id'>, { rejectWithValue }) => {
        if (!customerData.redboxId) {
            return rejectWithValue('Redbox ID is required to create a customer credential.');
        }

        const existingCredential = await db.credentials.where('redboxId').equals(customerData.redboxId).first();
        if (existingCredential) {
            return rejectWithValue(`Redbox ID ${customerData.redboxId} is already in use.`);
        }

        try {
            // Use a transaction to ensure both records are created or neither are.
            const newCustomerId = await db.transaction('rw', db.customers, db.credentials, async () => {
                const newCustomer: Omit<Customer, 'id'> = {
                    ...customerData,
                    loyaltyPoints: 0,
                    createdAt: new Date().toISOString(),
                    creditBlocked: false,
                    notifications: [],
                };
                const createdId = await db.customers.add(newCustomer as Customer);

                await db.credentials.add({
                    redboxId: customerData.redboxId,
                    role: 'customer',
                    hashedPassword: null,
                    oneTimeCode: null,
                });
                return createdId;
            });
            const newCustomerRecord = await db.customers.get(newCustomerId);
            return newCustomerRecord;

        } catch (error) {
            console.error("Failed to create customer and credential:", error);
            return rejectWithValue('An error occurred during customer creation.');
        }
    }
);

export const generateActivationCode = createAsyncThunk(
    'customers/generateActivationCode',
    async (redboxId: number, { rejectWithValue }) => {
        const credential = await db.credentials.where('redboxId').equals(redboxId).first();
        if (!credential) {
            return rejectWithValue('No credential found for this Redbox ID.');
        }

        const code = generateOneTimeCode();
        await db.credentials.update(credential.id!, { oneTimeCode: code });
        return { code };
    }
);


const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateCustomers.fulfilled, (state, action: PayloadAction<Customer[]>) => {
        state.items = action.payload;
      })
      .addCase(createCustomerWithCredential.fulfilled, (state, action: PayloadAction<Customer | undefined>) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
      });
  },
});

export const selectAllCustomers = (state: RootState) => state.customers.items;

export default customersSlice.reducer;
