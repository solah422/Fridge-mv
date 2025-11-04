import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { createGiftCard } from '../store/slices/giftCardSlice';
import { GiftCard } from '../types';
import { GiftCardDisplay } from './GiftCardDisplay';
import { addNotification } from '../store/slices/notificationsSlice';

export const GiftCardView: React.FC = () => {
    const dispatch = useAppDispatch();
    const giftCards = useAppSelector(state => state.giftCards.items);
    const [newCardBalance, setNewCardBalance] = useState('');
    const [generatedCard, setGeneratedCard] = useState<GiftCard | null>(null);

    const handleIssueCard = (e: React.FormEvent) => {
        e.preventDefault();
        const balance = parseFloat(newCardBalance);
        if (isNaN(balance) || balance <= 0) {
            dispatch(addNotification({ type: 'error', message: 'Please enter a valid balance.' }));
            return;
        }
        dispatch(createGiftCard({ initialBalance: balance, isEnabled: true }))
            .unwrap()
            .then(card => {
                setGeneratedCard(card);
            });
        setNewCardBalance('');
    };

    return (
        <div className="space-y-6">
            <section className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-[rgb(var(--color-text-base))] mb-4">Issue New Gift Card</h3>
                <form onSubmit={handleIssueCard} className="flex items-end gap-4">
                    <div>
                        <label htmlFor="gc-balance" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Card Balance (MVR)</label>
                        <input
                            type="number"
                            id="gc-balance"
                            value={newCardBalance}
                            onChange={(e) => setNewCardBalance(e.target.value)}
                            className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                            placeholder="e.g., 500"
                            required
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 h-[42px] bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">
                        Issue Card
                    </button>
                </form>

                {generatedCard && (
                    <div className="mt-6 border-t border-[rgb(var(--color-border))] pt-4">
                        <h4 className="font-semibold text-green-600 mb-2">Successfully Created!</h4>
                        <GiftCardDisplay card={generatedCard} />
                    </div>
                )}
            </section>

            <section className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-[rgb(var(--color-text-base))] mb-4">Existing Gift Cards</h3>
                <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                        <thead className="bg-[rgb(var(--color-bg-subtle))]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Card Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Current Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Initial Balance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Date Issued</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                            {[...giftCards].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(card => (
                                <tr key={card.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-[rgb(var(--color-text-base))]">{card.id}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-[rgb(var(--color-primary))]">MVR {card.currentBalance.toFixed(2)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">MVR {card.initialBalance.toFixed(2)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{new Date(card.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};