import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductRequest } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

interface ProductRequestsState {
  items: ProductRequest[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProductRequestsState = {
  items: [],
  status: 'idle',
};

export const fetchProductRequests = createAsyncThunk('productRequests/fetch', async () => {
  return await api.get<ProductRequest[]>('/product-requests');
});

export const updateProductRequests = createAsyncThunk('productRequests/update', async (requests: ProductRequest[]) => {
    return await api.put<ProductRequest[]>('/product-requests', requests);
});

export const addProductRequest = createAsyncThunk(
    'productRequests/add',
    async (requestData: Omit<ProductRequest, 'id' | 'createdAt' | 'status'>) => {
        const newRequest = await api.post<ProductRequest>('/product-requests', requestData);
        return newRequest;
    }
);

const productRequestsSlice = createSlice({
  name: 'productRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductRequests.fulfilled, (state, action: PayloadAction<ProductRequest[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(updateProductRequests.fulfilled, (state, action: PayloadAction<ProductRequest[]>) => {
        state.items = action.payload;
      })
      .addCase(addProductRequest.fulfilled, (state, action: PayloadAction<ProductRequest>) => {
        state.items.push(action.payload);
      });
  },
});

export const selectAllProductRequests = (state: RootState) => state.productRequests.items;
export default productRequestsSlice.reducer;