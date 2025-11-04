import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import productsReducer from './slices/productsSlice';
import customersReducer from './slices/customersSlice';
import transactionsReducer from './slices/transactionsSlice';
import wholesalersReducer from './slices/wholesalersSlice';
import purchaseOrdersReducer from './slices/purchaseOrdersSlice';
import inventoryHistoryReducer from './slices/inventoryHistorySlice';
import loyaltyReducer from './slices/loyaltySlice';
import giftCardReducer from './slices/giftCardSlice';
import reportsReducer from './slices/reportsSlice';
import promotionsReducer from './slices/promotionsSlice';
import authReducer from './slices/authSlice';
import productRequestsReducer from './slices/productRequestsSlice';
import productSuggestionsReducer from './slices/productSuggestionsSlice';
import passwordResetReducer from './slices/passwordResetSlice';
import notificationsReducer from './slices/notificationsSlice';
import monthlyStatementsReducer from './slices/monthlyStatementsSlice';
import chaosReducer from './slices/chaosSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    products: productsReducer,
    customers: customersReducer,
    transactions: transactionsReducer,
    wholesalers: wholesalersReducer,
    purchaseOrders: purchaseOrdersReducer,
    inventoryHistory: inventoryHistoryReducer,
    loyalty: loyaltyReducer,
    giftCards: giftCardReducer,
    reports: reportsReducer,
    promotions: promotionsReducer,
    auth: authReducer,
    productRequests: productRequestsReducer,
    productSuggestions: productSuggestionsReducer,
    passwordReset: passwordResetReducer,
    notifications: notificationsReducer,
    monthlyStatements: monthlyStatementsReducer,
    chaos: chaosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;