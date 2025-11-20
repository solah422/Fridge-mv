import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectActiveView, setActiveView, setOnlineStatus, setShowWelcomePanel, selectMaterialYouSeedColor, selectActiveWallpaper, selectActiveTheme, fetchAppSettings, selectAppStatus } from './store/slices/appSlice';
import { fetchCustomers, updateCustomers } from './store/slices/customersSlice';
import { fetchProducts, updateProducts } from './store/slices/productsSlice';
import { fetchTransactions, saveTransaction } from './store/slices/transactionsSlice';
import { fetchWholesalers, updateWholesalers } from './store/slices/wholesalersSlice';
import { fetchPurchaseOrders, updatePurchaseOrders } from './store/slices/purchaseOrdersSlice';
import { fetchInventoryHistory, addInventoryEvents } from './store/slices/inventoryHistorySlice';
import { fetchLoyaltySettings, saveLoyaltySettings } from './store/slices/loyaltySlice';
import { fetchGiftCards } from './store/slices/giftCardSlice';
import { fetchDailyReports } from './store/slices/reportsSlice';
import { fetchPromotions } from './store/slices/promotionsSlice';
import { fetchProductRequests } from './store/slices/productRequestsSlice';
import { fetchProductSuggestions } from './store/slices/productSuggestionsSlice';
import { fetchPasswordResetRequests } from './store/slices/passwordResetSlice';
import { fetchMonthlyStatements, addMonthlyStatements, updateMonthlyStatement } from './store/slices/monthlyStatementsSlice';
import { fetchChaosSettings } from './store/slices/chaosSlice';
import { Product, Wholesaler, PurchaseOrder, InventoryEvent, Transaction, Customer, LoyaltySettings, MonthlyStatement } from './types';
import { logout, selectUser } from './store/slices/authSlice';
import { addNotification } from './store/slices/notificationsSlice';
import { generateMaterialYouPalette } from './utils/materialYouTheme';
import { fetchCustomerGroups } from './store/slices/customerGroupsSlice';
import { fetchCredentials } from './store/slices/credentialsSlice';

import { POSView } from './components/POSView';
import { InvoicesView } from './components/InvoicesView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { CustomersView } from './components/CustomersView';
import { SettingsView } from './components/SettingsView';
import { DashboardView } from './components/DashboardView';
import { LoginView } from './components/LoginView';
import { CustomerPortalView } from './CustomerPortalView';
import { RequestsView } from './components/RequestsView';
import { ToastContainer } from './components/ToastContainer';
import { FinanceLayout } from './components/FinanceLayout';
import { WelcomePanel } from './components/WelcomePanel';

const APP_VERSION = '17.0.0';

// FIX: Added 'requests' to the View type to allow it as a valid view, resolving type comparison errors.
type View = 'dashboard' | 'pos' | 'invoices' | 'inventory' | 'reports' | 'customers' | 'settings' | 'requests';
export type Theme = 'light' | 'dark' | 'redbox' | 'amoled' | 'material-you' | 'glassmorphism';

const AdminLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeView = useAppSelector(selectActiveView);
  const isOnline = useAppSelector(state => state.app.isOnline);
  
  // Set initial view to dashboard
  useEffect(() => {
    dispatch(setActiveView('dashboard'));
  }, [dispatch]);
  
  // FIX: Added selectors and handlers to pass as props to child views
  const products = useAppSelector(state => state.products.items);
  const wholesalers = useAppSelector(state => state.wholesalers.items);
  const purchaseOrders = useAppSelector(state => state.purchaseOrders.items);
  const inventoryHistory = useAppSelector(state => state.inventoryHistory.items);
  const customers = useAppSelector(state => state.customers.items);
  const transactions = useAppSelector(state => state.transactions.items);
  const loyaltySettings = useAppSelector(state => state.loyalty.loyaltySettings);

  const handleProductsUpdate = useCallback((updatedProducts: Product[]) => dispatch(updateProducts(updatedProducts)), [dispatch]);
  const handleWholesalersUpdate = useCallback((updatedWholesalers: Wholesaler[]) => dispatch(updateWholesalers(updatedWholesalers)), [dispatch]);
  const handlePurchaseOrdersUpdate = useCallback((updatedPOs: PurchaseOrder[]) => dispatch(updatePurchaseOrders(updatedPOs)), [dispatch]);
  const handleInventoryHistoryUpdate = useCallback((newHistory: InventoryEvent[]) => dispatch(addInventoryEvents(newHistory)), [dispatch]);
  const handleCustomersUpdate = useCallback((updatedCustomers: Customer[]) => dispatch(updateCustomers(updatedCustomers)), [dispatch]);
  const handleLoyaltySettingsUpdate = useCallback((settings: LoyaltySettings) => dispatch(saveLoyaltySettings(settings)), [dispatch]);


  const renderView = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <POSView />;
      case 'invoices':
        return <InvoicesView />;
      case 'inventory':
        return <InventoryView 
          products={products}
          wholesalers={wholesalers}
          purchaseOrders={purchaseOrders}
          inventoryHistory={inventoryHistory}
          onProductsUpdate={handleProductsUpdate}
          onWholesalersUpdate={handleWholesalersUpdate}
          onPurchaseOrdersUpdate={handlePurchaseOrdersUpdate}
          onInventoryHistoryUpdate={handleInventoryHistoryUpdate}
        />;
      case 'reports':
        return <ReportsView />;
      case 'customers':
        return <CustomersView
          customers={customers}
          onCustomersUpdate={handleCustomersUpdate}
          transactions={transactions}
          loyaltySettings={loyaltySettings}
          onLoyaltySettingsUpdate={handleLoyaltySettingsUpdate}
        />;
      case 'settings':
        return <SettingsView />;
      case 'requests':
        return <RequestsView />;
      default:
        return <DashboardView />;
    }
  };
  
  const handleSetView = useCallback((view: View) => {
      dispatch(setActiveView(view));
  }, [dispatch]);

  const NavButton: React.FC<{ view: View; label: string; notificationCount?: number; }> = ({ view, label, notificationCount = 0 }) => (
    <button
      onClick={() => handleSetView(view)}
      className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeView === view
          ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))]'
          : 'text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-bg-subtle))]'
      }`}
    >
      {label}
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[rgb(var(--color-bg-card))]">
          {notificationCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className="bg-[rgb(var(--color-bg-card))] shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-[rgb(var(--color-text-base))]">Fridge MV (Admin)</h1>
              {!isOnline && (
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1 rounded-full text-sm font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      Offline Mode
                  </div>
              )}
            </div>
            <nav className="hidden md:flex items-center space-x-2">
              <NavButton view="dashboard" label="Dashboard" />
              <NavButton view="pos" label="POS" />
              <NavButton view="invoices" label="Invoices" />
              <NavButton view="inventory" label="Inventory" />
              <NavButton view="reports" label="Reports" />
              <NavButton view="customers" label="Customers" />
              <NavButton view="requests" label="Requests" />
            </nav>
            <div className="flex items-center gap-2">
                <button onClick={() => handleSetView('settings')} className="p-2 rounded-full hover:bg-[rgb(var(--color-bg-subtle))] transition-colors" aria-label="Open settings">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[rgb(var(--color-text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                 <button onClick={() => dispatch(logout())} className="p-2 rounded-full hover:bg-[rgb(var(--color-bg-subtle))] transition-colors" aria-label="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[rgb(var(--color-text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-[rgb(var(--color-bg-card))] shadow-lg z-30">
        <nav className="flex justify-around py-2">
           <NavButton view="dashboard" label="Dashboard" />
           <NavButton view="pos" label="POS" />
           <NavButton view="inventory" label="Inventory" />
           <NavButton view="requests" label="Requests" />
        </nav>
      </footer>
    </>
  );
};


const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectActiveTheme);
  const materialYouSeedColor = useAppSelector(selectMaterialYouSeedColor);
  const activeWallpaper = useAppSelector(selectActiveWallpaper);
  const user = useAppSelector(selectUser);
  const appStatus = useAppSelector(selectAppStatus);
  const showWelcomePanel = useAppSelector(state => state.app.showWelcomePanel);
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Show welcome panel on login
  useEffect(() => {
    if (user) {
      const welcomeSeen = sessionStorage.getItem(`welcome_seen_${APP_VERSION}`);
      if (!welcomeSeen) {
        dispatch(setShowWelcomePanel(true));
        sessionStorage.setItem(`welcome_seen_${APP_VERSION}`, 'true');
      }
    }
  }, [user, dispatch]);

  // Initial data fetch from API
  useEffect(() => {
    const initializeApp = async () => {
      // Dispatch all data fetching thunks. These now call the backend API.
      dispatch(fetchAppSettings());
      dispatch(fetchCredentials());
      dispatch(fetchCustomers());
      dispatch(fetchCustomerGroups());
      dispatch(fetchProducts());
      dispatch(fetchTransactions());
      dispatch(fetchWholesalers());
      dispatch(fetchPurchaseOrders());
      dispatch(fetchInventoryHistory());
      dispatch(fetchLoyaltySettings());
      dispatch(fetchGiftCards());
      dispatch(fetchDailyReports());
      dispatch(fetchPromotions());
      dispatch(fetchProductRequests());
      dispatch(fetchProductSuggestions());
      dispatch(fetchPasswordResetRequests());
      dispatch(fetchMonthlyStatements());
      dispatch(fetchChaosSettings());
    };
    
    // Only fetch data if a user is logged in
    if (user) {
        initializeApp();
    }
  }, [dispatch, user]);
  
  // Online/Offline status handling
  useEffect(() => {
    const updateStatus = () => dispatch(setOnlineStatus(navigator.onLine));
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus(); // Initial check
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, [dispatch]);

  // Dynamic Theme Management
  useEffect(() => {
    const root = document.documentElement;
    const appContainer = appContainerRef.current;
    if (!appContainer) return;

    // Handle wallpaper for Glassmorphism theme
    if (activeWallpaper) {
      appContainer.style.backgroundImage = `url(${activeWallpaper})`;
      appContainer.style.backgroundSize = 'cover';
      appContainer.style.backgroundPosition = 'center';
      appContainer.style.backgroundAttachment = 'fixed';
    } else {
      appContainer.style.backgroundImage = '';
    }

    // Cleanup all theme classes
    root.classList.remove('dark', 'theme-redbox', 'theme-amoled', 'theme-material-you', 'theme-glassmorphism');

    // Apply new theme class
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'redbox') {
      root.classList.add('dark', 'theme-redbox');
    } else if (theme === 'amoled') {
      root.classList.add('dark', 'theme-amoled');
    } else if (theme === 'material-you') {
        root.classList.add('dark', 'theme-material-you');
    } else if (theme === 'glassmorphism') {
        root.classList.add('dark', 'theme-glassmorphism');
    }
  }, [theme, activeWallpaper]);
  
  // Material You Dynamic Color Updater
  useEffect(() => {
    if (theme === 'material-you') {
        const palette = generateMaterialYouPalette(materialYouSeedColor);
        const root = document.documentElement;
        for (const [key, value] of Object.entries(palette)) {
            root.style.setProperty(key, value);
        }
    }
  }, [theme, materialYouSeedColor]);

  const renderContent = () => {
    if (appStatus === 'loading' && user) {
        return <div className="flex justify-center items-center min-h-screen text-lg">Loading App Data...</div>
    }
    if (!user) {
      return <LoginView />;
    }
    if (user.role === 'admin') {
      return <AdminLayout />;
    }
    if (user.role === 'customer') {
      return <CustomerPortalView />;
    }
    if (user.role === 'finance') {
      return <FinanceLayout />;
    }
    return null;
  }

  return (
    <div ref={appContainerRef} className={`min-h-screen font-sans ${user ? 'bg-[rgb(var(--color-bg-base))] text-[rgb(var(--color-text-base))]' : ''}`}>
      {!user && <div className="login-background"></div>}
      <ToastContainer />
      {showWelcomePanel && <WelcomePanel version={APP_VERSION} onClose={() => dispatch(setShowWelcomePanel(false))} />}
      {renderContent()}
    </div>
  );
};

export default App;