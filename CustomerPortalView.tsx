import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { logout, selectUser, updateCustomerPassword } from './store/slices/authSlice';
import { Product, CartItem, Transaction, ProductRequest, ProductSuggestion, MonthlyStatement, Customer, GiftCard } from './types';
import { ProductGrid } from './components/ProductGrid';
import { saveTransaction } from './store/slices/transactionsSlice';
import { ProductRequestModal } from './components/ProductRequestModal';
import { ProductSuggestionModal } from './components/ProductSuggestionModal';
import { addNotification } from './store/slices/notificationsSlice';
import { CustomerLoyaltyView } from './components/CustomerLoyaltyView';
import { selectAllMonthlyStatements } from './store/slices/monthlyStatementsSlice';
import { MonthlyStatementModal } from './components/MonthlyStatementModal';
import { updateCustomers } from './store/slices/customersSlice';
import ThemeSwitcher from './components/ThemeSwitcher';
import { AboutPanel } from './components/AboutPanel';
import { Theme } from './App';
import { setUserTheme, selectActiveWallpaper, setUserWallpaper, selectActiveTheme } from './store/slices/appSlice';
import { MaterialYouSettings } from './components/MaterialYouSettings';
import { WallpaperGallery } from './components/WallpaperGallery';
import { CustomerGiftCardsPanel } from './components/CustomerGiftCardsPanel';
import { ApplyGiftCardModal } from './components/ApplyGiftCardModal';

type CustomerPortalTab = 'dashboard' | 'order' | 'history' | 'loyalty' | 'profile';

const CustomerCart: React.FC<{
    cart: CartItem[], 
    subtotal: number,
    total: number,
    giftCardDeduction: number,
    appliedGiftCard: GiftCard | null,
    onUpdateQuantity: (id: number, qty: number) => void,
    onPlaceOrder: () => void,
    onApplyGiftCardClick: () => void,
    onRemoveGiftCard: () => void,
}> = ({ cart, subtotal, total, giftCardDeduction, appliedGiftCard, onUpdateQuantity, onPlaceOrder, onApplyGiftCardClick, onRemoveGiftCard }) => {

    return (
        <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Your Cart</h3>
            {cart.length === 0 ? (
                <p className="text-[rgb(var(--color-text-muted))]">Your cart is empty.</p>
            ) : (
                <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p>{item.name}</p>
                                    <p className="text-sm text-[rgb(var(--color-text-muted))]">MVR {item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-[rgb(var(--color-bg-subtle))]">-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-[rgb(var(--color-bg-subtle))]">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>MVR {subtotal.toFixed(2)}</span>
                            </div>
                            {appliedGiftCard && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Gift Card ({appliedGiftCard.id.slice(-4)})</span>
                                    <span>- MVR {giftCardDeduction.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-[rgb(var(--color-border))]">
                            <span>Total</span>
                            <span>MVR {total.toFixed(2)}</span>
                        </div>
                         <div className="mt-4 space-y-2">
                            {appliedGiftCard ? (
                                <button onClick={onRemoveGiftCard} className="w-full border border-[rgb(var(--color-border))] py-2 rounded-md text-sm font-semibold hover:bg-[rgb(var(--color-bg-subtle))]">
                                    Remove Gift Card
                                </button>
                            ) : (
                                <button onClick={onApplyGiftCardClick} className="w-full border border-[rgb(var(--color-border))] py-2 rounded-md text-sm font-semibold hover:bg-[rgb(var(--color-bg-subtle))]">
                                    Apply Gift Card
                                </button>
                            )}
                            <button 
                                onClick={onPlaceOrder} 
                                className="w-full bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] py-3 rounded-md font-semibold hover:bg-[rgb(var(--color-primary-hover))]"
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// ... (HistoryTab and ProfileTab remain the same)
const HistoryTab: React.FC = () => {
    const user = useAppSelector(selectUser);
    const transactions = useAppSelector(state => state.transactions.items);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const customerTransactions = useMemo(() => {
        return transactions
            .filter(tx => tx.customerId === user?.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, user]);

    const handleToggleExpand = (orderId: string) => {
        setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
    };

    return (
        <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-6 text-[rgb(var(--color-text-base))]">Your Order History</h3>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                {customerTransactions.length === 0 ? (
                    <p className="text-[rgb(var(--color-text-muted))] text-center py-8">You have not placed any orders yet.</p>
                ) : (
                    customerTransactions.map(tx => {
                        const isExpanded = expandedOrderId === tx.id;
                        return (
                            <div key={tx.id} className="bg-[rgb(var(--color-bg-subtle))] rounded-lg border border-[rgb(var(--color-border-subtle))] transition-shadow hover:shadow-md">
                                <div 
                                    className="p-4 flex justify-between items-center cursor-pointer" 
                                    onClick={() => handleToggleExpand(tx.id)}
                                >
                                    <div>
                                        <p className="font-semibold text-lg text-[rgb(var(--color-text-base))]">{tx.id}</p>
                                        <p className="text-sm text-[rgb(var(--color-text-muted))]">{new Date(tx.date).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-[rgb(var(--color-text-base))]">MVR {tx.total.toFixed(2)}</p>
                                            <p className={`text-sm font-semibold capitalize ${
                                                tx.orderStatus === 'Delivered' ? 'text-green-600' : tx.orderStatus === 'Out for Delivery' ? 'text-blue-600' : 'text-yellow-600'
                                            }`}>{tx.orderStatus}</p>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-[rgb(var(--color-text-muted))] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-4 border-t border-[rgb(var(--color-border-subtle))]">
                                        <h4 className="font-semibold mb-2 text-[rgb(var(--color-text-base))]">Order Details:</h4>
                                        <ul className="space-y-2 mb-4">
                                            {tx.items.map(item => (
                                                <li key={item.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-[rgb(var(--color-bg-card))]">
                                                    <div>
                                                        <span className="font-medium text-[rgb(var(--color-text-base))]">{item.name}</span>
                                                        <span className="text-[rgb(var(--color-text-muted))]"> x {item.quantity}</span>
                                                    </div>
                                                    <span className="font-mono text-[rgb(var(--color-text-base))]">MVR {(item.price * item.quantity).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-right space-y-1 text-sm">
                                            <p><span className="text-[rgb(var(--color-text-muted))]">Subtotal:</span> <span className="font-mono ml-2">MVR {tx.subtotal.toFixed(2)}</span></p>
                                            {tx.discountAmount > 0 && <p><span className="text-[rgb(var(--color-text-muted))]">Discount:</span> <span className="font-mono ml-2">- MVR {tx.discountAmount.toFixed(2)}</span></p>}
                                            <p className="font-bold text-base border-t border-[rgb(var(--color-border))] mt-1 pt-1"><span className="text-[rgb(var(--color-text-base))]">Total:</span> <span className="font-mono ml-2">MVR {tx.total.toFixed(2)}</span></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

const DashboardTab: React.FC<{
    onOpenRequestModal: () => void;
    onOpenSuggestionModal: () => void;
}> = ({ onOpenRequestModal, onOpenSuggestionModal }) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const allCustomers = useAppSelector(state => state.customers.items);
    const customer = allCustomers.find(c => c.id === user?.id);
    const transactions = useAppSelector(state => state.transactions.items);
    const products = useAppSelector(state => state.products.items);
    const requests = useAppSelector(state => state.productRequests.items);
    const suggestions = useAppSelector(state => state.productSuggestions.items);
    const monthlyStatements = useAppSelector(selectAllMonthlyStatements);
    const allGiftCards = useAppSelector(state => state.giftCards.items);
    
    const [viewingStatement, setViewingStatement] = useState<MonthlyStatement | null>(null);

    const userGiftCards = useMemo(() => {
        const now = new Date();
        return allGiftCards.filter(gc => 
            gc.customerId === user?.id && 
            gc.isEnabled && 
            gc.currentBalance > 0 && 
            (!gc.expiryDate || new Date(gc.expiryDate) > now)
        );
    }, [allGiftCards, user]);

    const outstandingStatement = useMemo(() => {
        return monthlyStatements
            .filter(s => s.customerId === user?.id && s.status === 'due' && s.overdueStatus !== '7_days_overdue')
            .sort((a,b) => new Date(b.billingPeriodEnd).getTime() - new Date(a.billingPeriodEnd).getTime())[0];
    }, [monthlyStatements, user]);
    
    const overdueStatement = useMemo(() => {
        return monthlyStatements
            .filter(s => s.customerId === user?.id && s.overdueStatus === '7_days_overdue' && s.status === 'due')
            .sort((a,b) => new Date(b.billingPeriodEnd).getTime() - new Date(a.billingPeriodEnd).getTime())[0];
    }, [monthlyStatements, user]);

    const pendingOrder = useMemo(() => {
        return transactions
            .filter(tx => tx.customerId === user?.id && tx.orderStatus === 'Pending')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }, [transactions, user]);
    
    const productSales = transactions.flatMap(tx => tx.items).reduce((acc, item) => {
        acc.set(item.id, (acc.get(item.id) || 0) + item.quantity);
        return acc;
    }, new Map<number, number>());

    const topSellingProducts = Array.from(productSales.entries())
        .sort(([, quantityA], [, quantityB]) => quantityB - quantityA)
        .slice(0, 5)
        .map(([productId]) => products.find(p => p.id === productId))
        .filter(Boolean);

    const myRequests = useMemo(() => 
        [...requests.filter(r => r.customerId === user?.id), ...suggestions.filter(s => s.customerId === user?.id)]
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
    [requests, suggestions, user]);
    
    const handleDismissNotification = (index: number) => {
        if (!customer) return;
        const newNotifications = [...(customer.notifications || [])];
        newNotifications.splice(index, 1);
        const updatedCustomer: Customer = { ...customer, notifications: newNotifications };
        const updatedCustomerList = allCustomers.map(c => c.id === customer.id ? updatedCustomer : c);
        dispatch(updateCustomers(updatedCustomerList));
    };

    const StatusBadge: React.FC<{ status: ProductRequest['status'] }> = ({ status }) => {
        const colorClasses = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', denied: 'bg-red-100 text-red-800', contacted: 'bg-blue-100 text-blue-800' };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClasses[status]}`}>{status}</span>;
    };

    return (
        <>
        <div className="space-y-6">
            {(customer?.notifications || []).map((notif, index) => (
                 <div key={index} className="bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 p-4 rounded-lg shadow-md" role="alert">
                    <div className="flex items-start">
                        <div className="py-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="flex-grow">
                            <p className="font-bold">Notification</p>
                            <p className="text-sm">{notif}</p>
                        </div>
                        <button onClick={() => handleDismissNotification(index)} className="p-1 rounded-full hover:bg-black/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            ))}
            {overdueStatement && (
                 <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-lg shadow-md" role="alert">
                    <div className="flex items-start">
                        <div className="py-1">
                          <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z"/></svg>
                        </div>
                        <div>
                            <p className="font-bold">Account Overdue</p>
                            <p className="text-sm">Your monthly statement is overdue. Please settle the outstanding balance of <span className="font-semibold">MVR {overdueStatement.totalDue.toFixed(2)}</span> to restore credit facilities.</p>
                            <button onClick={() => setViewingStatement(overdueStatement)} className="mt-2 px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded hover:bg-red-600 transition">View Statement & Pay</button>
                        </div>
                    </div>
                </div>
            )}
            {outstandingStatement && !overdueStatement && (
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg shadow-md" role="alert">
                    <div className="flex items-start">
                        <div className="py-1">
                          <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 8a1 1 0 100-2 1 1 0 000 2z"/></svg>
                        </div>
                        <div>
                            <p className="font-bold">Your Monthly Statement is Ready!</p>
                            <p className="text-sm">Total amount due: <span className="font-semibold">MVR {outstandingStatement.totalDue.toFixed(2)}</span></p>
                            <button onClick={() => setViewingStatement(outstandingStatement)} className="mt-2 px-3 py-1 text-xs font-semibold bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">View Statement</button>
                        </div>
                    </div>
                </div>
            )}
            
            {userGiftCards.length > 0 && <CustomerGiftCardsPanel giftCards={userGiftCards} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3">Pending Order Status</h3>
                        {pendingOrder ? (
                            <div>
                                <p className="text-sm">Order ID: <span className="font-mono">{pendingOrder.id}</span></p>
                                <p className="mt-2 text-2xl font-bold text-[rgb(var(--color-primary))]">{pendingOrder.orderStatus}</p>
                            </div>
                        ) : (
                            <p className="text-[rgb(var(--color-text-muted))]">You have no pending orders.</p>
                        )}
                    </div>
                    <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3">Your Requests & Suggestions</h3>
                        {myRequests.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto">
                               {myRequests.map(req => (
                                   <li key={req.id} className="flex justify-between items-center text-sm">
                                       <span>{req.productName}</span>
                                       <StatusBadge status={req.status} />
                                   </li>
                               ))}
                            </ul>
                        ) : (
                            <p className="text-[rgb(var(--color-text-muted))]">You haven't made any requests.</p>
                        )}
                    </div>
                </div>
                <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-3">Hot Sellers</h3>
                    {topSellingProducts.length > 0 ? (
                        <ul className="space-y-2">
                            {topSellingProducts.map(p => p && <li key={p.id} className="text-sm font-medium">{p.name}</li>)}
                        </ul>
                    ) : <p className="text-[rgb(var(--color-text-muted))]">No sales data yet.</p>}
                </div>
                <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md flex flex-col justify-center items-center gap-4">
                    <button onClick={onOpenRequestModal} className="w-full text-center px-4 py-3 bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-text-on-light))] font-semibold rounded-lg hover:opacity-90 transition">Request a New Product</button>
                    <button onClick={onOpenSuggestionModal} className="w-full text-center px-4 py-3 bg-[rgb(var(--color-bg-subtle))] font-semibold rounded-lg hover:opacity-90 transition">Suggest Your Product</button>
                </div>
            </div>
        </div>
        {viewingStatement && <MonthlyStatementModal statement={viewingStatement} onClose={() => setViewingStatement(null)} />}
        </>
    );
};

const ProfileTab: React.FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const customers = useAppSelector(state => state.customers.items);
    const customer = customers.find(c => c.id === user?.id);
    const theme = useAppSelector(selectActiveTheme);
    const activeWallpaper = useAppSelector(selectActiveWallpaper);
    const APP_VERSION = '15.5.0';

    const [formState, setFormState] = useState({
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
    });
    const [passwordState, setPasswordState] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    if (!customer) return null;

    const handleSetTheme = (newTheme: Theme) => {
        dispatch(setUserTheme(newTheme));
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordState({ ...passwordState, [e.target.name]: e.target.value });
    };

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedCustomer = { ...customer, ...formState };
        dispatch(updateCustomers(customers.map(c => c.id === customer.id ? updatedCustomer : c)));
        dispatch(addNotification({ type: 'success', message: 'Profile updated successfully!' }));
    };

    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordState.newPassword !== passwordState.confirmPassword) {
            dispatch(addNotification({ type: 'error', message: 'New passwords do not match.' }));
            return;
        }
        dispatch(updateCustomerPassword({
            customerId: customer.id,
            currentPassword: passwordState.currentPassword,
            newPassword: passwordState.newPassword
        })).unwrap().then(() => {
            setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }).catch(err => {
            dispatch(addNotification({ type: 'error', message: err.message || 'Failed to update password.' }));
        });
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Your Profile</h3>
                <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm mb-1">Name</label><input name="name" value={formState.name} onChange={handleProfileChange} className="w-full p-2 border rounded" /></div>
                        <div><label className="block text-sm mb-1">Email</label><input name="email" type="email" value={formState.email} onChange={handleProfileChange} className="w-full p-2 border rounded" /></div>
                        <div><label className="block text-sm mb-1">Phone</label><input name="phone" value={formState.phone} onChange={handleProfileChange} className="w-full p-2 border rounded" /></div>
                        <div><label className="block text-sm mb-1">Address</label><input name="address" value={formState.address} onChange={handleProfileChange} className="w-full p-2 border rounded" /></div>
                    </div>
                    <div className="text-right"><button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md">Save Changes</button></div>
                </form>
            </div>
            <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Change Password</h3>
                <form onSubmit={handlePasswordSave} className="space-y-4 max-w-sm">
                    <div><label className="block text-sm mb-1">Current Password</label><input name="currentPassword" type="password" value={passwordState.currentPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded" required /></div>
                    <div><label className="block text-sm mb-1">New Password</label><input name="newPassword" type="password" value={passwordState.newPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded" required /></div>
                    <div><label className="block text-sm mb-1">Confirm New Password</label><input name="confirmPassword" type="password" value={passwordState.confirmPassword} onChange={handlePasswordChange} className="w-full p-2 border rounded" required /></div>
                    <div className="text-right"><button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md">Update Password</button></div>
                </form>
            </div>
             <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Appearance</h3>
                 <div className="p-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg flex items-center justify-between">
                    <div>
                        <p className="font-medium text-[rgb(var(--color-text-base))]">App Theme</p>
                        <p className="text-sm text-[rgb(var(--color-text-muted))]">Change the look and feel of the application.</p>
                    </div>
                    <ThemeSwitcher theme={theme} setTheme={handleSetTheme} />
                </div>
                {theme === 'material-you' && <MaterialYouSettings />}
                {theme === 'glassmorphism' && (
                    <WallpaperGallery 
                        activeWallpaper={activeWallpaper} 
                        onSelectWallpaper={(url) => dispatch(setUserWallpaper(url))} 
                    />
                )}
            </div>
            <AboutPanel version={APP_VERSION} />
        </div>
    );
};

export const CustomerPortalView: React.FC = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const customers = useAppSelector(state => state.customers.items);
    const products = useAppSelector(state => state.products.items);
    const allGiftCards = useAppSelector(state => state.giftCards.items);
    
    const [activeTab, setActiveTab] = useState<CustomerPortalTab>('dashboard');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [isGiftCardModalOpen, setIsGiftCardModalOpen] = useState(false);
    const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);

    const userGiftCards = useMemo(() => {
        const now = new Date();
        return allGiftCards.filter(gc => 
            gc.customerId === user?.id && 
            gc.isEnabled && 
            gc.currentBalance > 0 && 
            (!gc.expiryDate || new Date(gc.expiryDate) > now)
        );
    }, [allGiftCards, user]);

    const { subtotal, total, giftCardDeduction } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        let deduction = 0;
        if (appliedGiftCard) {
            deduction = Math.min(sub, appliedGiftCard.currentBalance);
        }
        const finalTotal = sub - deduction;
        return { subtotal: sub, total: finalTotal, giftCardDeduction: deduction };
    }, [cart, appliedGiftCard]);

    const getBundleStock = (product: Product) => {
        if (!product.isBundle || !product.bundleItems || product.bundleItems.length === 0) return product.stock;
        const stockLevels = product.bundleItems.map(item => {
          const component = products.find(p => p.id === item.productId);
          return component ? Math.floor(component.stock / item.quantity) : 0;
        });
        return Math.min(...stockLevels);
    };

    const addToCart = (product: Product) => {
        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.id === product.id);
          const availableStock = getBundleStock(product);
          if (availableStock <= (existingItem?.quantity || 0)) {
            dispatch(addNotification({ type: 'error', message: `Not enough stock for ${product.name}.` }));
            return prevCart;
          }
          if (existingItem) {
            return prevCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
          }
          return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: number, newQuantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        if (newQuantity > getBundleStock(product)) {
          dispatch(addNotification({ type: 'error', message: `Not enough stock for ${product.name}.` }));
          return;
        }
        setCart((prevCart) => newQuantity <= 0 ? prevCart.filter(item => item.id !== productId) : prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    };
    
    const handleApplyGiftCardCode = (code: string) => {
        const card = allGiftCards.find(gc => gc.id.toLowerCase() === code.toLowerCase());
        const now = new Date();
        if (card && card.isEnabled && card.currentBalance > 0 && (!card.expiryDate || new Date(card.expiryDate) > now)) {
            setAppliedGiftCard(card);
            dispatch(addNotification({ type: 'success', message: `Gift Card applied. Balance: MVR ${card.currentBalance.toFixed(2)}`}));
            setIsGiftCardModalOpen(false);
        } else {
            dispatch(addNotification({ type: 'error', message: 'Invalid, expired, or empty gift card.'}));
        }
    };

    const handlePlaceOrder = () => {
        const customer = customers.find(c => c.id === user?.id);
        if (!customer || cart.length === 0) {
            dispatch(addNotification({ type: 'error', message: "Cart is empty or customer not found." }));
            return;
        }

        if(customer.creditBlocked) {
            dispatch(addNotification({ type: 'error', message: "Cannot place new order: Your account is currently blocked due to an overdue balance." }));
            return;
        }

        const newTransaction: Transaction = {
            id: `WEB-${Date.now()}`,
            customer: customer,
            customerId: customer.id,
            items: cart,
            subtotal: subtotal,
            discountAmount: 0,
            total: total,
            date: new Date().toISOString(),
            paymentStatus: total === 0 ? 'paid' : 'unpaid',
            orderStatus: 'Pending',
            paymentMethod: appliedGiftCard ? (total === 0 ? 'gift_card' : 'multiple') : 'unpaid',
            giftCardPayments: appliedGiftCard ? [{ cardId: appliedGiftCard.id, amount: giftCardDeduction }] : [],
        };

        dispatch(saveTransaction({ transaction: newTransaction, source: 'customer' }));
        dispatch(addNotification({ type: 'success', message: 'Order Placed Successfully!' }));
        setCart([]);
        setAppliedGiftCard(null);
    };

    const TabButton: React.FC<{ tab: CustomerPortalTab; label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-3 py-2 font-semibold transition-colors rounded-md ${activeTab === tab ? 'bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-text-on-light))]' : 'hover:bg-[rgb(var(--color-bg-subtle))]'}`}>{label}</button>
    );

    return (
        <>
        <header className="bg-[rgb(var(--color-bg-card))] shadow-md sticky top-0 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        <TabButton tab="dashboard" label="Dashboard" />
                        <TabButton tab="order" label="Place Order" />
                        <TabButton tab="history" label="Order History" />
                        <TabButton tab="loyalty" label="Loyalty" />
                        <TabButton tab="profile" label="Profile" />
                    </div>
                    <button onClick={() => dispatch(logout())} className="p-2 rounded-full hover:bg-[rgb(var(--color-bg-subtle))]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[rgb(var(--color-text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {activeTab === 'dashboard' && <DashboardTab onOpenRequestModal={() => setIsRequestModalOpen(true)} onOpenSuggestionModal={() => setIsSuggestionModalOpen(true)} />}
            {activeTab === 'order' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ProductGrid 
                            onAddToCart={addToCart} 
                            searchTerm={productSearch}
                            onSearchChange={setProductSearch}
                            selectedCategory={categoryFilter}
                            onCategoryChange={setCategoryFilter}
                            getBundleStock={getBundleStock}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <CustomerCart 
                            cart={cart}
                            subtotal={subtotal}
                            total={total}
                            giftCardDeduction={giftCardDeduction}
                            appliedGiftCard={appliedGiftCard}
                            onUpdateQuantity={updateQuantity} 
                            onPlaceOrder={handlePlaceOrder}
                            onApplyGiftCardClick={() => setIsGiftCardModalOpen(true)}
                            onRemoveGiftCard={() => setAppliedGiftCard(null)}
                        />
                    </div>
                </div>
            )}
            {activeTab === 'loyalty' && <CustomerLoyaltyView />}
            {activeTab === 'history' && <HistoryTab />}
            {activeTab === 'profile' && <ProfileTab />}
        </main>
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-[rgb(var(--color-bg-card))] shadow-lg z-30">
            <nav className="flex justify-around py-2">
                <TabButton tab="dashboard" label="Dashboard" />
                <TabButton tab="order" label="Order" />
                <TabButton tab="history" label="History" />
                <TabButton tab="profile" label="Profile" />
            </nav>
        </footer>

        <ProductRequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
        <ProductSuggestionModal isOpen={isSuggestionModalOpen} onClose={() => setIsSuggestionModalOpen(false)} />
        <ApplyGiftCardModal
            isOpen={isGiftCardModalOpen}
            onClose={() => setIsGiftCardModalOpen(false)}
            onApply={handleApplyGiftCardCode}
            customerGiftCards={userGiftCards}
        />
        </>
    );
};