import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await api.get<Product[]>('/products');
  return response;
});

export const updateProducts = createAsyncThunk('products/updateProducts', async (products: Product[]) => {
    const response = await api.put<Product[]>('/products', products);
    return response;
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        // Assuming the API returns the full, updated list for simplicity.
        state.items = action.payload;
      });
  },
});

export const selectAllProducts = (state: RootState) => state.products.items;

export default productsSlice.reducer;