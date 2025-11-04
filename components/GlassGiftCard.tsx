import React from 'react';
import { GiftCard } from '../types';

export const GlassGiftCard: React.FC<{ card: GiftCard }> = ({ card }) => {
  return (
    <div className="w-full aspect-[1.586] rounded-xl p-4 text-white font-sans shadow-lg relative overflow-hidden bg-[rgba(255,255,255,0.1)] backdrop-filter backdrop-blur-sm border border-solid border-[rgba(255,255,255,0.2)] flex flex-col justify-between">
      {/* Abstract background shapes */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -translate-x-1/3 -translate-y-1/3 blur-xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-cyan-500/20 rounded-full translate-x-1/4 translate-y-1/4 blur-xl"></div>
      
      <div className="flex justify-between items-start z-10">
        <span className="font-bold text-lg">Fridge MV</span>
        <span className="text-xs uppercase">Gift Card</span>
      </div>
      
      <div className="z-10">
        <p className="text-2xl font-mono tracking-widest break-all">{card.id.replace(/-/g, ' ')}</p>
      </div>
      
      <div className="flex justify-between items-end z-10">
        <div>
          <p className="text-xs uppercase">Balance</p>
          <p className="text-xl font-semibold">MVR {card.currentBalance.toFixed(2)}</p>
        </div>
        {card.expiryDate && (
          <div className="text-right">
            <p className="text-xs uppercase">Expires</p>
            <p className="text-sm font-semibold">{new Date(card.expiryDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};
