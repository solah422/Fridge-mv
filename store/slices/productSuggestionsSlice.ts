import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductSuggestion } from '../../types';
import { api } from '../../services/apiService';
import type { RootState } from '..';

interface ProductSuggestionsState {
  items: ProductSuggestion[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProductSuggestionsState = {
  items: [],
  status: 'idle',
};

export const fetchProductSuggestions = createAsyncThunk('productSuggestions/fetch', async () => {
  return await api.get<ProductSuggestion[]>('/product-suggestions');
});

export const updateProductSuggestions = createAsyncThunk('productSuggestions/update', async (suggestions: ProductSuggestion[]) => {
    return await api.put<ProductSuggestion[]>('/product-suggestions', suggestions);
});

export const addProductSuggestion = createAsyncThunk(
    'productSuggestions/add',
    async (suggestionData: Omit<ProductSuggestion, 'id' | 'createdAt' | 'status'>) => {
        const newSuggestion = await api.post<ProductSuggestion>('/product-suggestions', suggestionData);
        return newSuggestion;
    }
);

const productSuggestionsSlice = createSlice({
  name: 'productSuggestions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductSuggestions.fulfilled, (state, action: PayloadAction<ProductSuggestion[]>) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(updateProductSuggestions.fulfilled, (state, action: PayloadAction<ProductSuggestion[]>) => {
        state.items = action.payload;
      })
      .addCase(addProductSuggestion.fulfilled, (state, action: PayloadAction<ProductSuggestion>) => {
        state.items.push(action.payload);
      });
  },
});

export const selectAllProductSuggestions = (state: RootState) => state.productSuggestions.items;
export default productSuggestionsSlice.reducer;