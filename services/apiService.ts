import { Customer, Product, Transaction, Wholesaler, PurchaseOrder, InventoryEvent, LoyaltySettings, GiftCard, DailyReport, Promotion, ProductRequest, ProductSuggestion, PasswordResetRequest, MonthlyStatement, ChaosSettings } from '../types';
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

const defaultChaosSettings: ChaosSettings = {
    impulseBuy: {
        enabled: false,
        discount: 75,
        duration: 90,
        frequency: 'daily',
        eligibleItems: [],
        startMessage: '⚡ FLASH SALE! ⚡ For the next {SECONDS} seconds, {ITEM_NAME} is {DISCOUNT_PERCENT}% OFF! GO!',
        endMessage: 'The window is CLOSED! {NUMBER_SOLD} items were claimed.',
    },
    pantryLottery: {
        enabled: false,
        itemName: 'Mystery Snack',
        itemPrice: 2.00,
        eligibleItems: [],
        jackpotChance: 1,
        jackpotReward: '10% off your entire month\'s bill!',
        jackpotMessage: '!!! {USER_NAME} HIT THE JACKPOT !!!',
    },
    debtDerby: {
        enabled: false,
        showHighRoller: true,
        showSpenderStreaks: true,
        showItemFutures: false,
        leaderboardTitle: 'This Month\'s Esteemed Benefactor',
        leaderboardCount: 5,
        streakThreshold: 3,
        enableSassyAuditor: false,
        commentFrequency: 'medium',
    },
    aiPersonalitySwap: {
        enabled: false,
        rotation: 'daily',
        personalities: [
            {
                id: 'p1',
                name: 'Film Noir Detective',
                greeting: 'Another day, another tab...',
                confirmation: 'It\'s on your record, see...',
                dashboardMessage: 'The numbers don\'t lie, pal...'
            },
            {
                id: 'p2',
                name: "Captain K'Runch (Grumpy Pirate)",
                greeting: "Arrr, ye be back! What treasure be ye plunderin' from my galley this time? Make it quick!",
                confirmation: "Ye chose the {ITEM_NAME}, eh? A fine choice for a scallywag! I've marked it on yer tab... in blood! (and ink).",
                dashboardMessage: "Behold yer treasure map o' debt! A hefty {AMOUNT} in doubloons! Pay the toll, or ye'll be walkin' the plank!"
            },
            {
                id: 'p3',
                name: "Z.O.E. (Dour, Depressed Robot)",
                greeting: "Oh, it's you. Another human requiring sustenance. The cycle is... pointless. Please state your selection. Sigh.",
                confirmation: "Processing {ITEM_NAME}. Another fleeting moment of synthesized joy. It has been added to your... 'bill'. The futility is palpable.",
                dashboardMessage: "Your current balance is {AMOUNT}. A numerical representation of your material desires. Does it make you... happy? No. Of course not."
            },
            {
                id: 'p4',
                name: "\"Thrillin'\" Ted (Excitable Game Show Host)",
                greeting: "HELLOOOO, contestant! Welcome back to 'The Price is... on Your TAB!' Are you ready to make a deal?!",
                confirmation: "You've selected the {ITEM_NAME}! A fantastic choice! And we're adding it to your bill! Tell 'em what they've won, {USER_NAME}!",
                dashboardMessage: "Let's check the big board! Your grand total is... {AMOUNT}! Will you pay it all off, or risk it ALL... for another snack?!"
            },
            {
                id: 'p5',
                name: "\"Totally\" Tiffany (90s Valley Girl)",
                greeting: "OMG, hi! Are you, like, actually getting a snack right now? That is so cool. What are you getting?",
                confirmation: "A {ITEM_NAME}? Ugh, majorly good choice. It's, like, my favorite? Anyway, I, like, totally added it to your bill, or whatever.",
                dashboardMessage: "Okay, so, like, don't freak out, but your total is {AMOUNT}. It's, like, a lot. As if! You should, like, totally pay it."
            }
        ],
    },
    itemBountyBoard: {
        enabled: false,
        boardName: 'Bounty Board',
        minBounty: 0.50,
        minContribution: 0.25,
        payoutRecipientId: 'admin',
        newBountyMessage: 'A new bounty for {ITEM_NAME} has been posted by {USER_NAME} with a {AMOUNT} reward!',
        contributionMessage: '{USER_NAME} has contributed {AMOUNT} to the bounty for {ITEM_NAME}! The pot is now {TOTAL_POT}!',
        claimedMessage: 'The bounty for {ITEM_NAME} has been claimed by {HUNTER_NAME}! The item is now in stock.',
    },
    posMascot: {
        enabled: false,
        mascotName: 'Snacky the Cat',
        happyItems: [],
        sadItems: [],
        moodThreshold: 5,
        enableFiscalMood: false,
        happyMessage: '{MASCOT_NAME} is purring happily! Thanks for the {ITEM_NAME}!',
        sadMessage: '{MASCOT_NAME} is bouncing off the walls... that\'s a lot of {ITEM_NAME} for one day!',
        anxiousMessage: '{MASCOT_NAME} is anxiously checking the books... there are overdue invoices!',
        secureMessage: 'All bills are paid! {MASCOT_NAME} is napping peacefully, feeling secure.',
    }
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
    chaosSettings: createApiCall<ChaosSettings>('chaosSettings', defaultChaosSettings),
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