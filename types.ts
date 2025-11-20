export interface Credential {
  id?: number;
  username?: string | null;
  redboxId?: number | null;
  hashedPassword?: string | null;
  oneTimeCode?: string | null;
  role: 'admin' | 'finance' | 'customer';
}

export interface CustomerGroup {
  id: number;
  name: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  telegramId: string;
  loyaltyPoints?: number;
  loyaltyTierId?: string;
  password?: string; // This is now deprecated and will be removed in a future update
  redboxId?: number;
  address?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string;
  maximumCreditLimit?: number;
  creditBlocked?: boolean;
  notifications?: string[];
  groupId?: number;
  dashboardAccess?: 'delivery' | 'in-house'; // New field for dashboard type
}

export interface Product {
  id: number;
  name: string;
  price: number;
  wholesalePrice: number;
  stock: number;
  category: string;
  defaultWholesalerId?: number;
  isBundle?: boolean;
  bundleItems?: { productId: number; quantity: number }[];
}

export interface Wholesaler {
  id: number;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
}

export interface ReturnEvent {
  date: string;
  items: { 
    itemId: number; 
    quantity: number; 
    reason: string 
  }[];
}

export interface GiftCardPayment {
  cardId: string;
  amount: number;
}

export interface Transaction {
  id: string;
  customer: Customer;
  customerId: number; // For indexing
  items: CartItem[];
  subtotal: number;
  promotionCode?: string;
  discountAmount: number;
  total: number;
  date: string;
  paymentStatus: 'paid' | 'unpaid' | 'review'; // Added 'review' for uploaded receipts
  orderStatus: 'Pending' | 'Out for Delivery' | 'Delivered';
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'gift_card' | 'multiple' | 'unpaid';
  giftCardPayments?: GiftCardPayment[];
  paymentDate?: string;
  paymentReceiptUrl?: string; // base64 data URL
  returns?: ReturnEvent[];
}

export interface PurchaseItem {
    productId: number;
    name: string;
    quantity: number;
    purchasePrice: number;
}
  
export interface PurchaseOrder {
    id: string;
    wholesalerId: number;
    wholesalerName: string;
    items: PurchaseItem[];
    date: string;
    total: number;
    status: 'pending' | 'processed';
}

export interface InventoryEvent {
  id: string;
  productId: number;
  type: 'sale' | 'return' | 'purchase' | 'adjustment';
  quantityChange: number;
  date: string;
  notes?: string;
  relatedId?: string; // e.g., transaction ID or purchase order ID
}

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  pointMultiplier: number;
  color: string;
}

export interface LoyaltySettings {
  enabled: boolean;
  pointsPerMvr: number;
  tiers: LoyaltyTier[];
}

export interface GiftCard {
    id: string; // Unique card code
    initialBalance: number;
    currentBalance: number;
    createdAt: string;
    isEnabled: boolean;
    customerId: number; // No longer optional
    expiryDate?: string; // Optional expiry date
}

export interface DailyReport {
    id: string; // e.g., YYYY-MM-DD
    date: string;
    totalSales: number;
    totalDiscounts: number;
    totalReturnsValue: number;
    netSales: number;
    totalProfit: number;
    transactionsCount: number;
    paymentBreakdown: {
        cash: number;
        card: number;
        transfer: number;
        gift_card: number;
    };
    transactions: Transaction[]; // Store the transactions for this day
}

export interface ProductRequest {
  id: string;
  customerId: number;
  customerName: string;
  productName: string;
  image?: string; // base64 data URL
  wholesaler?: string;
  status: 'pending' | 'approved' | 'denied' | 'contacted';
  createdAt: string;
}

export interface ProductSuggestion {
  id: string;
  customerId: number;
  customerName: string;
  productName: string;
  wholesalePrice: number;
  image: string; // base64 data URL
  status: 'pending' | 'approved' | 'denied' | 'contacted';
  createdAt: string;
}

export interface PasswordResetRequest {
  id: string;
  customerId: number;
  customerName: string;
  redboxId: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface MonthlyStatement {
  id: string; // e.g., MS-2024-10-CUST1
  customerId: number;
  customerName: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  generatedAt: string;
  dueDate: string;
  transactions: Transaction[];
  totalDue: number;
  status: 'due' | 'paid';
  pdfDataUrl?: string;
  paymentDate?: string;
  overdueStatus?: 'none' | '7_days_overdue';
}


// Chaos & Fun Module Types
export interface AIPersonality {
  id: string;
  name: string;
  greeting: string;
  confirmation: string;
  dashboardMessage: string;
}

export interface ImpulseBuySettings {
  enabled: boolean;
  discount: number;
  duration: number;
  frequency: 'daily' | 'twice-daily' | 'random';
  eligibleItems: number[];
  startMessage: string;
  endMessage: string;
}

export interface PantryLotterySettings {
  enabled: boolean;
  itemName: string;
  itemPrice: number;
  eligibleItems: number[];
  jackpotChance: number;
  jackpotReward: string;
  jackpotMessage: string;
}

export interface DebtDerbySettings {
  enabled: boolean;
  showHighRoller: boolean;
  showSpenderStreaks: boolean;
  showItemFutures: boolean;
  leaderboardTitle: string;
  leaderboardCount: number;
  streakThreshold: number;
  enableSassyAuditor: boolean;
  commentFrequency: 'low' | 'medium' | 'high';
}

export interface AIPersonalitySwapSettings {
  enabled: boolean;
  rotation: 'daily' | 'weekly' | 'login';
  personalities: AIPersonality[];
}

export interface ItemBountyBoardSettings {
  enabled: boolean;
  boardName: string;
  minBounty: number;
  minContribution: number;
  payoutRecipientId: string; // Can be 'admin', 'finance', or a customer ID
  newBountyMessage: string;
  contributionMessage: string;
  claimedMessage: string;
}

export interface POSMascotSettings {
  enabled: boolean;
  mascotName: string;
  happyItems: number[];
  sadItems: number[];
  moodThreshold: number;
  enableFiscalMood: boolean;
  happyMessage: string;
  sadMessage: string;
  anxiousMessage: string;
  secureMessage: string;
}

export interface ChaosSettings {
    impulseBuy: ImpulseBuySettings;
    pantryLottery: PantryLotterySettings;
    debtDerby: DebtDerbySettings;
    aiPersonalitySwap: AIPersonalitySwapSettings;
    itemBountyBoard: ItemBountyBoardSettings;
    posMascot: POSMascotSettings;
}