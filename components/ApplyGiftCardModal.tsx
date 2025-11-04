import React, { useState } from 'react';
import { GiftCard } from '../types';
import { CustomerGiftCardsPanel } from './CustomerGiftCardsPanel';

interface ApplyGiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  customerGiftCards: GiftCard[];
}

export const ApplyGiftCardModal: React.FC<ApplyGiftCardModalProps> = ({ isOpen, onClose, onApply, customerGiftCards }) => {
  const [manualCode, setManualCode] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    if (manualCode.trim()) {
      onApply(manualCode.trim());
    }
  };

  const handleCardSelect = (card: GiftCard) => {
    onApply(card.id);
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex justify-center items-center z-50 p-4">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Apply Gift Card</h3>
            <button type="button" onClick={onClose} className="text-3xl">&times;</button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto">
          {customerGiftCards.length > 0 && (
            <CustomerGiftCardsPanel 
              giftCards={customerGiftCards} 
              onSelectCard={handleCardSelect} 
              title="Select one of your cards" 
            />
          )}
          
          <div className="text-center text-sm text-[rgb(var(--color-text-muted))]">
            {customerGiftCards.length > 0 ? 'Or enter a code manually' : 'Enter a gift card code'}
          </div>

          <div className="flex items-center gap-2 max-w-sm mx-auto">
            <input 
              type="text" 
              value={manualCode} 
              onChange={e => setManualCode(e.target.value)} 
              placeholder="GIFT-CARD-CODE" 
              className="w-full p-3 pr-10 text-[rgb(var(--color-text-base))] border border-[rgb(var(--color-border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--color-primary-focus-ring))] focus:border-[rgb(var(--color-primary-focus-ring))] transition"
            />
            <button 
                onClick={handleApply}
                disabled={!manualCode.trim()}
                className="px-4 py-2 h-[48px] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md font-semibold disabled:opacity-50"
            >
                Apply
            </button>
          </div>
        </div>
         <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
        </div>
      </div>
    </div>
  );
};
