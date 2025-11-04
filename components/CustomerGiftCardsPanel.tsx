import React from 'react';
import { GiftCard } from '../types';
import { GlassGiftCard } from './GlassGiftCard';

interface CustomerGiftCardsPanelProps {
  giftCards: GiftCard[];
  onSelectCard?: (card: GiftCard) => void;
  title?: string;
}

export const CustomerGiftCardsPanel: React.FC<CustomerGiftCardsPanelProps> = ({ giftCards, onSelectCard, title = "My Gift Cards" }) => {
  if (giftCards.length === 0) {
    return null;
  }
  return (
    <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-[rgb(var(--color-text-base))]">{title}</h3>
      <div className="flex overflow-x-auto space-x-4 p-2 -m-2">
        {giftCards.map(card => (
          <div key={card.id} className={`flex-shrink-0 w-80 transform transition-transform hover:scale-105 ${onSelectCard ? 'cursor-pointer' : ''}`} onClick={() => onSelectCard?.(card)}>
             <GlassGiftCard card={card} />
          </div>
        ))}
      </div>
    </div>
  );
};
