import { Customer, Product, Transaction, Wholesaler, PurchaseOrder, InventoryEvent, LoyaltySettings, GiftCard, DailyReport, Promotion, ProductRequest, ProductSuggestion, PasswordResetRequest, MonthlyStatement } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_WHOLESALERS } from '../constants';

const SIMULATED_LATENCY = 200; // ms

// Generic getter/setter for localStorage with default values
const getItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const setItem = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
};

const defaultLoyaltySettings: LoyaltySettings = {
    enabled: true,
    pointsPerMvr: 1,
    tiers: [
        { id: 'bronze', name: 'Bronze', minPoints: 0, pointMultiplier: 1, color: '#cd7f32' },
        { id: 'silver', name: 'Silver', minPoints: 500, pointMultiplier: 1.25, color: '#c0c0c0' },
        { id: 'gold', name: 'Gold', minPoints: 2000, pointMultiplier: 1.5, color: '#ffd700' },
    ]
};


// --- API Functions ---

// Helper to simulate async operations
const createApiCall = <T>(key: string, defaultValue: T): {
    fetch: () => Promise<T>;
    save: (data: T) => Promise<void>;
} => ({
    fetch: () => new Promise((resolve) => {
        setTimeout(() => {
            resolve(getItem(key, defaultValue));
        }, SIMULATED_LATENCY);
    }),
    save: (data: T) => new Promise((resolve) => {
        setTimeout(() => {
            setItem(key, data);
            resolve();
        }, SIMULATED_LATENCY);
    }),
});

interface AuthData {
    adminPassword: string;
    financePassword: string;
    financePasswordChanged: boolean;
}

// Create API endpoints for each data type
export const api = {
    customers: createApiCall<Customer[]>('customers', INITIAL_CUSTOMERS),
    products: createApiCall<Product[]>('products', INITIAL_PRODUCTS),
    transactions: createApiCall<Transaction[]>('transactions', []),
    wholesalers: createApiCall<Wholesaler[]>('wholesalers', INITIAL_WHOLESALERS),
    purchaseOrders: createApiCall<PurchaseOrder[]>('purchaseOrders', []),
    inventoryHistory: createApiCall<InventoryEvent[]>('inventoryHistory', []),
    loyaltySettings: createApiCall<LoyaltySettings>('loyaltySettings', defaultLoyaltySettings),
    giftCards: createApiCall<GiftCard[]>('giftCards', []),
    dailyReports: createApiCall<DailyReport[]>('dailyReports', []),
    promotions: createApiCall<Promotion[]>('promotions', []),
    auth: createApiCall<AuthData>('auth_data', { adminPassword: 'admin', financePassword: 'test', financePasswordChanged: false }),
    productRequests: createApiCall<ProductRequest[]>('productRequests', []),
    productSuggestions: createApiCall<ProductSuggestion[]>('productSuggestions', []),
    passwordResetRequests: createApiCall<PasswordResetRequest[]>('passwordResetRequests', []),
    monthlyStatements: createApiCall<MonthlyStatement[]>('monthlyStatements', []),
};

// --- Offline Handling ---

const OFFLINE_QUEUE_KEY = 'offline_transaction_queue';

export const saveTransactionOffline = async (transaction: Transaction): Promise<void> => {    
    return new Promise((resolve) => {
        setTimeout(() => {
            const queue = getItem<Transaction[]>(OFFLINE_QUEUE_KEY, []);
            queue.push(transaction);
            setItem(OFFLINE_QUEUE_KEY, queue);
            console.log("Transaction saved to offline queue.", transaction);
            resolve();
        }, SIMULATED_LATENCY);
    });
};

export const syncOfflineTransactions = async (): Promise<Transaction[]> => {
    const queue = getItem<Transaction[]>(OFFLINE_QUEUE_KEY, []);
    if (queue.length === 0) {
        return [];
    }

    console.log(`Syncing ${queue.length} offline transactions...`);
    const allTransactions = await api.transactions.fetch();
    const updatedTransactions = [...allTransactions, ...queue];
    await api.transactions.save(updatedTransactions);
    
    // Clear the queue
    setItem(OFFLINE_QUEUE_KEY, []);

    console.log("Sync complete.");
    return queue;
};