import React from 'react';
import { CartItem, GiftCard, Promotion } from '../types';

interface CartProps {
  cart: CartItem[];
  subtotal: number;
  total: number;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onSave: () => void;
  onClear: () => void;
  isSaveDisabled: boolean;
  discountAmount: number;
  promoCodeInput: string;
  setPromoCodeInput: (code: string) => void;
  onApplyPromoCode: () => void;
  appliedPromo: Promotion | null;
  onRemovePromo: () => void;
  promoError: string;
  giftCardCode: string;
  setGiftCardCode: (code: string) => void;
  onApplyGiftCard: () => void;
  appliedGiftCard: GiftCard | null;
  removeGiftCard: () => void;
  onToggleVisibility: () => void;
}

const CartItemRow: React.FC<{ item: CartItem; onUpdateQuantity: CartProps['onUpdateQuantity'] }> = ({ item, onUpdateQuantity }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <p className="font-semibold text-[rgb(var(--color-text-base))]">{item.name}</p>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">MVR {item.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))] hover:bg-[rgb(var(--color-border-subtle))] transition">-</button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))] hover:bg-[rgb(var(--color-border-subtle))] transition">+</button>
        </div>
    </div>
);

export const Cart: React.FC<CartProps> = ({ 
    cart, onUpdateQuantity, subtotal, total, onSave, onClear, isSaveDisabled, 
    discountAmount, promoCodeInput, setPromoCodeInput, onApplyPromoCode,
    appliedPromo, onRemovePromo, promoError,
    giftCardCode, setGiftCardCode, onApplyGiftCard, appliedGiftCard, removeGiftCard,
    onToggleVisibility
}) => {
  const totalAfterDiscount = subtotal - discountAmount;
  const giftCardDeduction = appliedGiftCard ? Math.min(totalAfterDiscount, appliedGiftCard.currentBalance) : 0;

  return (
    <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md sticky top-24">
      <div className="flex justify-between items-center border-b border-[rgb(var(--color-border-subtle))] pb-4 mb-4">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-base))]">Current Order</h2>
        <button onClick={onToggleVisibility} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] p-1 rounded-full hover:bg-[rgb(var(--color-bg-subtle))] transition-colors" aria-label="Collapse cart sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
            </svg>
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto divide-y divide-[rgb(var(--color-border-subtle))]">
        {cart.length === 0 ? (
          <p className="text-[rgb(var(--color-text-muted))] text-center py-8">Your cart is empty.</p>
        ) : (
          cart.map((item) => <CartItemRow key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} />)
        )}
      </div>
      {cart.length > 0 && (
        <div className="mt-6 border-t border-[rgb(var(--color-border-subtle))] pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[rgb(var(--color-text-muted))]">
              <span>Subtotal</span>
              <span>MVR {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-[rgb(var(--color-text-muted))] pt-2 border-t border-[rgb(var(--color-border))]">
              <span>Promo Code</span>
              {!appliedPromo ? (
                  <div className="flex items-center gap-2">
                      <input type="text" placeholder="Enter code" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value)} className="w-32 p-1 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] uppercase"/>
                      <button onClick={onApplyPromoCode} className="px-3 py-1 text-xs bg-[rgb(var(--color-bg-subtle))] hover:bg-[rgb(var(--color-border-subtle))] rounded">Apply</button>
                  </div>
              ) : (
                  <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-green-600">{appliedPromo.code}</span>
                      <button onClick={onRemovePromo} className="text-red-500 text-xs">(Remove)</button>
                  </div>
              )}
            </div>
            {promoError && <p className="text-right text-xs text-red-500">{promoError}</p>}
            {discountAmount > 0 && <div className="flex justify-between text-sm text-[rgb(var(--color-text-subtle))]"><span>Discount</span><span>- MVR {discountAmount.toFixed(2)}</span></div>}
            
            <div className="flex justify-between items-center text-[rgb(var(--color-text-muted))] pt-2 border-t border-[rgb(var(--color-border))]">
              <span>Gift Card</span>
              {!appliedGiftCard ? (
                  <div className="flex items-center gap-2">
                      <input type="text" placeholder="Enter code" value={giftCardCode} onChange={e => setGiftCardCode(e.target.value)} className="w-32 p-1 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"/>
                      <button onClick={onApplyGiftCard} className="px-3 py-1 text-xs bg-[rgb(var(--color-bg-subtle))] hover:bg-[rgb(var(--color-border-subtle))] rounded">Apply</button>
                  </div>
              ) : (
                  <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-green-600">{appliedGiftCard.id.slice(-4)}</span>
                      <button onClick={removeGiftCard} className="text-red-500 text-xs">(Remove)</button>
                  </div>
              )}
            </div>
            {giftCardDeduction > 0 && <div className="flex justify-between text-sm text-green-600"><span>Paid by Gift Card</span><span>- MVR {giftCardDeduction.toFixed(2)}</span></div>}

            <div className="flex justify-between font-bold text-xl text-[rgb(var(--color-text-base))] border-t-2 border-[rgb(var(--color-border))] pt-2 mt-2">
              <span>Total</span>
              <span>MVR {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-6 border-t border-[rgb(var(--color-border-subtle))] grid grid-cols-2 gap-3">
        <button onClick={onClear} className="w-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 py-3 rounded-md hover:bg-red-200 dark:hover:bg-red-900/80 transition font-semibold disabled:opacity-50" disabled={cart.length === 0}>Clear</button>
        <button onClick={onSave} className="w-full bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] py-3 rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaveDisabled}>Save (F4)</button>
      </div>
    </div>
  );
};