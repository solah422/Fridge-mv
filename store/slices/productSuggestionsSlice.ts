import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductSuggestion } from '../../types';
import { api } from '../../services/apiService';
import { RootState } from '..';

interface ProductSuggestionsState {
  items: ProductSuggestion[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProductSuggestionsState = {
  items: [],
  status: 'idle',
};

export const fetchProductSuggestions = createAsyncThunk('productSuggestions/fetch', async () => {
  return await api.productSuggestions.fetch();
});

export const updateProductSuggestions = createAsyncThunk('productSuggestions/update', async (suggestions: ProductSuggestion[]) => {
    await api.productSuggestions.save(suggestions);
    return suggestions;
});

export const addProductSuggestion = createAsyncThunk(
    'productSuggestions/add',
    async (suggestionData: Omit<ProductSuggestion, 'id' | 'createdAt' | 'status'>, { getState }) => {
        const state = getState() as RootState;
        const newSuggestion: ProductSuggestion = {
            ...suggestionData,
            id: `SUG-${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'pending',
        };
        const updatedSuggestions = [...state.productSuggestions.items, newSuggestion];
        await api.productSuggestions.save(updatedSuggestions);
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
