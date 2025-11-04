import React from 'react';
import { DailyReport, Product, Transaction } from '../types';

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (report: DailyReport) => void;
  transactions: Transaction[];
  productMap: Map<number, Product>;
}

export const ZReportModal: React.FC<ZReportModalProps> = ({ isOpen, onClose, onConfirm, transactions, productMap }) => {
    if (!isOpen) return null;
    
    const today = new Date();
    const todayId = today.toISOString().split('T')[0];
    
    const calculateReport = (): DailyReport => {
        let totalSales = 0;
        let totalDiscounts = 0;
        let totalReturnsValue = 0;
        let totalWholesaleCost = 0;
        const paymentBreakdown = { cash: 0, card: 0, transfer: 0, gift_card: 0 };

        for (const tx of transactions) {
            totalSales += tx.total;
            totalDiscounts += tx.discountAmount;

            if (tx.paymentMethod) {
                if (tx.paymentMethod === 'multiple' && tx.giftCardPayments) {
                     // Approximate breakdown for multiple payments
                    const nonGiftCardAmount = tx.total - tx.giftCardPayments.reduce((sum, p) => sum + p.amount, 0);
                    paymentBreakdown.gift_card += tx.total - nonGiftCardAmount;
                    // Assume rest is card/transfer for simplicity
                    paymentBreakdown.card += nonGiftCardAmount;
                } else if (paymentBreakdown.hasOwnProperty(tx.paymentMethod)) {
                    paymentBreakdown[tx.paymentMethod as keyof typeof paymentBreakdown] += tx.total;
                }
            }
            
            // Calculate costs and returns
            const returnedQuantities: { [itemId: number]: number } = {};
            if (tx.returns) {
                for (const returnEvent of tx.returns) {
                    for (const returnedItem of returnEvent.items) {
                        const originalItem = tx.items.find(i => i.id === returnedItem.itemId);
                        if (originalItem) {
                            totalReturnsValue += originalItem.price * returnedItem.quantity;
                        }
                        returnedQuantities[returnedItem.itemId] = (returnedQuantities[returnedItem.itemId] || 0) + returnedItem.quantity;
                    }
                }
            }

            for (const item of tx.items) {
                const netQuantity = item.quantity - (returnedQuantities[item.id] || 0);
                if (netQuantity > 0) {
                    const product = productMap.get(item.id);
                    if (product) {
                        totalWholesaleCost += product.wholesalePrice * netQuantity;
                    }
                }
            }
        }
        
        const netSales = totalSales; // total is already net of returns
        const totalProfit = netSales - totalWholesaleCost;
        
        return {
            id: todayId,
            date: today.toISOString(),
            totalSales,
            totalDiscounts,
            totalReturnsValue,
            netSales,
            totalProfit,
            transactionsCount: transactions.length,
            paymentBreakdown,
            transactions,
        };
    };

    const report = calculateReport();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-[rgb(var(--color-border-subtle))]">
                    <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">End of Day Report (Z-Report)</h3>
                    <p className="text-sm text-[rgb(var(--color-text-muted))]">For {today.toLocaleDateString()}</p>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <h4 className="font-semibold text-lg text-[rgb(var(--color-text-base))]">Sales Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[rgb(var(--color-text-muted))]">Total Sales:</span> <span className="font-mono">MVR {report.totalSales.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-[rgb(var(--color-text-muted))]">Discounts Given:</span> <span className="font-mono">- MVR {report.totalDiscounts.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-[rgb(var(--color-text-muted))]">Value of Returns:</span> <span className="font-mono">- MVR {report.totalReturnsValue.toFixed(2)}</span></div>
                         <div className="flex justify-between font-bold border-t border-[rgb(var(--color-border))] pt-2 mt-2"><span className="">Net Sales:</span> <span className="font-mono">MVR {report.netSales.toFixed(2)}</span></div>
                         <div className="flex justify-between font-bold"><span className="">Gross Profit:</span> <span className="font-mono">MVR {report.totalProfit.toFixed(2)}</span></div>
                    </div>
                    <h4 className="font-semibold text-lg text-[rgb(var(--color-text-base))] pt-4 border-t border-[rgb(var(--color-border))]">Payment Methods</h4>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[rgb(var(--color-text-muted))]">Cash:</span> <span className="font-mono">MVR {report.paymentBreakdown.cash.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-[rgb(var(--color-text-muted))]">Card:</span> <span className="font-mono">MVR {report.paymentBreakdown.card.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-[rgb(var(--color-text-muted))]">Transfer:</span> <span className="font-mono">MVR {report.paymentBreakdown.transfer.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-[rgb(var(--color-text-muted))]">Gift Card:</span> <span className="font-mono">MVR {report.paymentBreakdown.gift_card.toFixed(2)}</span></div>
                    </div>
                </div>
                <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Cancel</button>
                    <button onClick={() => onConfirm(report)} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">Confirm and Close Day</button>
                </div>
            </div>
        </div>
    );
};
