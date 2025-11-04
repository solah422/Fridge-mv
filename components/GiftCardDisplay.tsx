import React from 'react';
import { GiftCard } from '../types';
import { useAppSelector } from '../store/hooks';
import { selectCompanyLogo } from '../store/slices/appSlice';

declare global {
  interface Window {
    html2canvas: any;
  }
}

interface GiftCardDisplayProps {
  card: GiftCard;
}

export const GiftCardDisplay: React.FC<GiftCardDisplayProps> = ({ card }) => {
  const companyLogo = useAppSelector(selectCompanyLogo);

  const handleDownload = async () => {
    const element = document.getElementById(`giftcard-${card.id}`);
    if (!element || !window.html2canvas) return;

    const canvas = await window.html2canvas(element, { scale: 3, useCORS: true });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `FridgeMV-GiftCard-${card.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div id={`giftcard-${card.id}`} className="w-full max-w-sm rounded-xl bg-white p-6 text-gray-800 shadow-lg font-sans border border-gray-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
            <div>
                {companyLogo ? (
                    <img src={companyLogo} alt="Company Logo" className="max-h-12" />
                ) : (
                    <h2 className="text-xl font-bold text-gray-800">Fridge MV</h2>
                )}
            </div>
            <div className="text-right">
                <h3 className="text-2xl font-bold text-cyan-600 uppercase tracking-wider">Gift Card</h3>
                <p className="text-xs text-gray-500 mt-1">Issued: {new Date(card.createdAt).toLocaleDateString()}</p>
            </div>
        </div>

        {/* Balance */}
        <div className="text-center my-8">
            <p className="text-sm uppercase font-semibold text-gray-500">Current Balance</p>
            <p className="text-5xl font-bold tracking-tighter text-blue-500">MVR {card.currentBalance.toFixed(2)}</p>
        </div>
        
        {/* Card Code */}
        <div className="mt-8 text-center bg-gray-100 rounded-lg p-3 border border-gray-200">
            <p className="text-xs uppercase tracking-wider text-gray-500">Card Code</p>
            <p className="text-2xl font-mono font-semibold tracking-widest text-slate-800">{card.id}</p>
        </div>

        {/* Decorative footer */}
        <div className="absolute bottom-0 left-0 right-0 h-4 flex">
            <div className="w-8/12 bg-slate-800"></div>
            <div className="w-4/12 bg-blue-500"></div>
        </div>
      </div>
       <button onClick={handleDownload} className="mt-4 text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline">
        Download as Image
      </button>
    </div>
  );
};
