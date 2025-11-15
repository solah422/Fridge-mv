import Dexie, { Table } from 'dexie';
import { 
    Customer, Product, Transaction, Wholesaler, PurchaseOrder, InventoryEvent, 
    LoyaltySettings, GiftCard, DailyReport, Promotion, ProductRequest, 
    ProductSuggestion, PasswordResetRequest, MonthlyStatement, ChaosSettings, CustomerGroup,
    Credential
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_WHOLESALERS, INITIAL_CUSTOMERS } from '../constants';
import { hashPassword } from '../utils/crypto';

// Define the shape of the settings table
interface AppSetting {
    key: string;
    value: any;
}

export const db = new Dexie('fridgeMV') as Dexie & {
    credentials: Table<Credential, number>;
    customers: Table<Customer, number>;
    products: Table<Product, number>;
    transactions: Table<Transaction, string>;
    wholesalers: Table<Wholesaler, number>;
    purchaseOrders: Table<PurchaseOrder, string>;
    inventoryHistory: Table<InventoryEvent, string>;
    giftCards: Table<GiftCard, string>;
    dailyReports: Table<DailyReport, string>;
    promotions: Table<Promotion, string>;
    productRequests: Table<ProductRequest, string>;
    productSuggestions: Table<ProductSuggestion, string>;
    passwordResetRequests: Table<PasswordResetRequest, string>;
    monthlyStatements: Table<MonthlyStatement, string>;
    customerGroups: Table<CustomerGroup, number>;
    appSettings: Table<AppSetting, string>;
};

// Original Schema
db.version(1).stores({
    customers: '++id, &redboxId, groupId',
    products: '++id, category',
    transactions: 'id, customerId, date, paymentStatus, orderStatus',
    wholesalers: '++id, name',
    purchaseOrders: 'id, wholesalerId, date, status',
    inventoryHistory: 'id, productId, type, date',
    giftCards: 'id, customerId, isEnabled',
    dailyReports: 'id, date',
    promotions: 'id, &code',
    productRequests: 'id, customerId, status, createdAt',
    productSuggestions: 'id, customerId, status, createdAt',
    passwordResetRequests: 'id, customerId, redboxId, status',
    monthlyStatements: 'id, customerId, status, dueDate',
    customerGroups: '++id, name',
    appSettings: '&key',
});

// New Schema with Credentials table for secure auth
db.version(2).stores({
    credentials: '++id, username, &redboxId',
    customers: '++id, redboxId, groupId', // redboxId is now just an indexed link, not unique
    products: '++id, category',
    transactions: 'id, customerId, date, paymentStatus, orderStatus',
    wholesalers: '++id, name',
    purchaseOrders: 'id, wholesalerId, date, status',
    inventoryHistory: 'id, productId, type, date',
    giftCards: 'id, customerId, isEnabled',
    dailyReports: 'id, date',
    promotions: 'id, &code',
    productRequests: 'id, customerId, status, createdAt',
    productSuggestions: 'id, customerId, status, createdAt',
    passwordResetRequests: 'id, customerId, redboxId, status',
    monthlyStatements: 'id, customerId, status, dueDate',
    customerGroups: '++id, name',
    appSettings: '&key',
}).upgrade(async tx => {
    // Migration logic from version 1 to 2
    // 1. Wipe old customer data and insecure auth settings
    await tx.table('customers').clear();
    await tx.table('appSettings').where('key').equals('adminPassword').delete();
    await tx.table('appSettings').where('key').equals('financePassword').delete();
    
    // 2. Hash default passwords
    const adminHash = await hashPassword('adminpass123');
    const financeHash = await hashPassword('test');

    // 3. Populate new credentials table with secure admin/finance accounts
    await tx.table('credentials').bulkAdd([
        { username: 'admin', hashedPassword: adminHash, role: 'admin', redboxId: null, oneTimeCode: null },
        { username: 'finance', hashedPassword: financeHash, role: 'finance', redboxId: null, oneTimeCode: null },
    ]);
});


// --- Data Seeding on First Launch ---
db.on('populate', async () => {
    await db.products.bulkAdd(INITIAL_PRODUCTS);
    await db.wholesalers.bulkAdd(INITIAL_WHOLESALERS);
    await db.customers.bulkAdd(INITIAL_CUSTOMERS);
    
    const adminHash = await hashPassword('adminpass123');
    const financeHash = await hashPassword('test');

    const initialCredentials: Omit<Credential, 'id'>[] = [
        { username: 'admin', hashedPassword: adminHash, role: 'admin', redboxId: null, oneTimeCode: null },
        { username: 'finance', hashedPassword: financeHash, role: 'finance', redboxId: null, oneTimeCode: null },
    ];

    // Create credential stubs for each customer
    INITIAL_CUSTOMERS.forEach(customer => {
        if (customer.redboxId) {
            initialCredentials.push({
                redboxId: customer.redboxId,
                role: 'customer',
                hashedPassword: null,
                oneTimeCode: null
            });
        }
    });

    await db.credentials.bulkAdd(initialCredentials as Credential[]);

    // Default settings
    await db.appSettings.bulkAdd([
        { key: 'financePasswordChanged', value: false },
        { key: 'defaultTheme', value: 'dark' },
        { key: 'userTheme', value: null },
        { key: 'defaultWallpaper', value: null },
        { key: 'userWallpaper', value: null },
        { key: 'materialYouSeedColor', value: '#6750A4' },
        { key: 'companyLogo', value: null },
        { key: 'forecastingSettings', value: { lookbackDays: 30, reorderThresholdDays: 7 } },
        { key: 'creditSettings', value: { defaultCreditLimit: 500, creditLimitIncreaseCap: 5000 } },
        { key: 'loyaltySettings', value: {
            enabled: true,
            pointsPerMvr: 1,
            tiers: [
                { id: 'bronze', name: 'Bronze', minPoints: 0, pointMultiplier: 1, color: '#cd7f32' },
                { id: 'silver', name: 'Silver', minPoints: 500, pointMultiplier: 1.25, color: '#c0c0c0' },
                { id: 'gold', name: 'Gold', minPoints: 2000, pointMultiplier: 1.5, color: '#ffd700' },
            ]
        }},
    ]);
});

// --- Atomic Transaction Helper ---
export async function saveTransactionFlow(
    transaction: Transaction,
    updatedProducts: Product[],
    updatedCustomer: Customer | null,
    updatedGiftCards: GiftCard[],
    inventoryEvents: InventoryEvent[]
) {
    return db.transaction('rw', 
        db.transactions, 
        db.products, 
        db.customers, 
        db.giftCards, 
        db.inventoryHistory, 
        async () => {
            await db.transactions.add(transaction);
            await db.products.bulkPut(updatedProducts);
            if (updatedCustomer) {
                await db.customers.put(updatedCustomer);
            }
            if (updatedGiftCards.length > 0) {
                await db.giftCards.bulkPut(updatedGiftCards);
            }
            if (inventoryEvents.length > 0) {
                await db.inventoryHistory.bulkAdd(inventoryEvents);
            }
    });
}

// --- App Settings Helpers ---
export async function getAllAppSettings() {
    const settingsArray = await db.appSettings.toArray();
    const settingsObject = settingsArray.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {} as { [key: string]: any });
    return settingsObject;
}