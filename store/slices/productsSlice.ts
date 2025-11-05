import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../../types';
import { db } from '../../services/dbService';
import { RootState } from '..';

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
  const response = await db.products.toArray();
  return response;
});

export const updateProducts = createAsyncThunk('products/updateProducts', async (products: Product[]) => {
    await db.products.bulkPut(products);
    return products;
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
        state.items = action.payload;
      });
  },
});

export const selectAllProducts = (state: RootState) => state.products.items;

export default productsSlice.reducer;