import React, { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { saveTransaction } from '../store/slices/transactionsSlice';
import { CartItem, Customer, Product, Transaction, GiftCard, Promotion } from '../types';
import { CustomerSelector } from './CustomerSelector';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import { selectAllPromotions } from '../store/slices/promotionsSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { selectCreditSettings } from '../store/slices/appSlice';

export const POSView: React.FC = () => {
  const dispatch = useAppDispatch();
  const customers = useAppSelector(state => state.customers.items);
  const products = useAppSelector(state => state.products.items);
  const allTransactions = useAppSelector(state => state.transactions.items);
  const giftCards = useAppSelector(state => state.giftCards.items);
  const promotions = useAppSelector(selectAllPromotions);
  const creditSettings = useAppSelector(selectCreditSettings);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState('');

  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);
  const [isCartVisible, setIsCartVisible] = useState(true);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  const { discountAmount, total } = useMemo(() => {
    let calculatedDiscount = 0;
    if (appliedPromo) {
        calculatedDiscount = appliedPromo.type === 'percentage' 
            ? subtotal * (appliedPromo.value / 100)
            : appliedPromo.value;
    }
    
    calculatedDiscount = Math.min(subtotal, calculatedDiscount);
    const totalAfterDiscount = subtotal - calculatedDiscount;
    
    let giftCardDeduction = 0;
    if (appliedGiftCard) {
        giftCardDeduction = Math.min(totalAfterDiscount, appliedGiftCard.currentBalance);
    }

    const finalTotal = totalAfterDiscount - giftCardDeduction;
    return { discountAmount: calculatedDiscount, total: finalTotal };
  }, [subtotal, appliedPromo, cart.length, appliedGiftCard]);
  
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

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setPromoCodeInput('');
    setAppliedPromo(null);
    setPromoError('');
    setGiftCardCode('');
    setAppliedGiftCard(null);
  };
  
  const handleApplyGiftCard = () => {
      const card = giftCards.find(gc => gc.id === giftCardCode && gc.isEnabled && gc.currentBalance > 0);
      if (card) {
          setAppliedGiftCard(card);
          dispatch(addNotification({ type: 'success', message: `Gift Card applied successfully.`}));
      } else {
          dispatch(addNotification({ type: 'error', message: "Invalid or empty gift card."}));
      }
  };

  const handleApplyPromoCode = () => {
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    const promo = promotions.find(p => p.code.toUpperCase() === code);

    if (promo && promo.isActive) {
        setAppliedPromo(promo);
        setPromoCodeInput('');
        dispatch(addNotification({ type: 'success', message: `Promotion "${promo.name}" applied.`}));
    } else {
        setPromoError('Invalid or inactive promo code.');
        setAppliedPromo(null);
    }
  };

  const handleRemovePromo = () => {
      setAppliedPromo(null);
      setPromoError('');
  };


  const handleSaveTransaction = () => {
    if (!selectedCustomer || cart.length === 0) return;

    const isCreditTransaction = total > 0;
    const customerCreditLimit = selectedCustomer.maximumCreditLimit ?? creditSettings.defaultCreditLimit;

    if (isCreditTransaction) {
      // 1. Check for credit block
      if (selectedCustomer.creditBlocked) {
        dispatch(addNotification({ type: 'error', message: "Credit Block: Account is Overdue on Payments." }));
        return;
      }

      // 2. Check credit limit
      const customerOutstandingBalance = allTransactions
        .filter(tx => tx.customer.id === selectedCustomer.id && tx.paymentStatus === 'unpaid')
        .reduce((sum, tx) => sum + tx.total, 0);

      if (customerOutstandingBalance + total > customerCreditLimit) {
        const remainingLimit = customerCreditLimit - customerOutstandingBalance;
        dispatch(addNotification({ type: 'error', message: `Credit Limit Exceeded. Remaining Limit: MVR ${remainingLimit.toFixed(2)}` }));
        return;
      }
    }

    const newTransaction: Transaction = {
      id: `INV-${Date.now()}`,
      customer: selectedCustomer,
      items: cart,
      subtotal,
      promotionCode: appliedPromo?.code,
      discountAmount,
      total,
      date: new Date().toISOString(),
      paymentStatus: total === 0 ? 'paid' : 'unpaid',
      orderStatus: 'Delivered', // POS transactions are considered delivered immediately
      returns: [],
      paymentMethod: appliedGiftCard ? 'gift_card' : undefined,
      giftCardPayments: appliedGiftCard ? [{ cardId: appliedGiftCard.id, amount: Math.min(subtotal - discountAmount, appliedGiftCard.currentBalance) }] : [],
    };
    
    dispatch(saveTransaction({ transaction: newTransaction, source: 'pos' }));
    dispatch(addNotification({ type: 'success', message: 'Transaction Saved!'}));
    clearCart();
  };
  
   // Listen for global save shortcut
  useEffect(() => {
    const saveListener = () => handleSaveTransaction();
    document.addEventListener('save-transaction-shortcut', saveListener);
    return () => {
        document.removeEventListener('save-transaction-shortcut', saveListener);
    };
  }, [selectedCustomer, cart, appliedPromo, appliedGiftCard, allTransactions]); // Dependencies are crucial here

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={isCartVisible ? "lg:col-span-2" : "lg:col-span-3 transition-all duration-300"}>
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
          />
          <ProductGrid 
            onAddToCart={addToCart} 
            searchTerm={productSearch}
            onSearchChange={setProductSearch}
            selectedCategory={categoryFilter}
            onCategoryChange={setCategoryFilter}
            getBundleStock={getBundleStock}
          />
        </div>
        {isCartVisible && (
          <div className="lg:col-span-1">
            <Cart
              cart={cart}
              onUpdateQuantity={updateQuantity}
              subtotal={subtotal}
              total={total}
              onSave={handleSaveTransaction}
              onClear={clearCart}
              isSaveDisabled={!selectedCustomer || cart.length === 0}
              discountAmount={discountAmount}
              promoCodeInput={promoCodeInput}
              setPromoCodeInput={setPromoCodeInput}
              // FIX: Corrected prop name from 'onApplyPromoCode' to the defined handler 'handleApplyPromoCode'.
              onApplyPromoCode={handleApplyPromoCode}
              appliedPromo={appliedPromo}
              onRemovePromo={handleRemovePromo}
              promoError={promoError}
              giftCardCode={giftCardCode}
              setGiftCardCode={setGiftCardCode}
              onApplyGiftCard={handleApplyGiftCard}
              appliedGiftCard={appliedGiftCard}
              removeGiftCard={() => setAppliedGiftCard(null)}
              onToggleVisibility={() => setIsCartVisible(false)}
            />
          </div>
        )}
      </div>
      {!isCartVisible && (
        <button
          onClick={() => setIsCartVisible(true)}
          className="fixed bottom-8 right-8 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform z-40"
          aria-label="Show order cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[rgb(var(--color-bg-card))]">
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </button>
      )}
    </>
  );
};