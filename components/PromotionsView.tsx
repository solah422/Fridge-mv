import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Promotion } from '../types';
import { selectAllPromotions, updatePromotions } from '../store/slices/promotionsSlice';
import { ManagePromotionModal } from './ManagePromotionModal';

export const PromotionsView: React.FC = () => {
    const dispatch = useAppDispatch();
    const promotions = useAppSelector(selectAllPromotions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promotionToEdit, setPromotionToEdit] = useState<Promotion | null>(null);

    const handleOpenModal = (promo: Promotion | null = null) => {
        setPromotionToEdit(promo);
        setIsModalOpen(true);
    };

    const handleSavePromotion = (promoData: Omit<Promotion, 'id'> & { id?: string }) => {
        if (promoData.id) {
            const updated = promotions.map(p => p.id === promoData.id ? { ...p, ...promoData } as Promotion : p);
            dispatch(updatePromotions(updated));
        } else {
            const newPromo: Promotion = { ...promoData, id: `PROMO-${Date.now()}` };
            dispatch(updatePromotions([...promotions, newPromo]));
        }
    };

    const handleToggleActive = (promo: Promotion) => {
        const updated = promotions.map(p => p.id === promo.id ? { ...p, isActive: !p.isActive } : p);
        dispatch(updatePromotions(updated));
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[rgb(var(--color-text-base))]">Manage Promotions</h3>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">
                    Create Promotion
                </button>
            </div>
            <div className="bg-[rgb(var(--color-bg-subtle))] p-4 rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                        <thead className="bg-[rgb(var(--color-bg-subtle))]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Discount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                            {promotions.map(promo => (
                                <tr key={promo.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-text-base))]">{promo.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-[rgb(var(--color-text-muted))]">{promo.code}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">
                                        {promo.type === 'percentage' ? `${promo.value}%` : `MVR ${promo.value.toFixed(2)}`}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => handleToggleActive(promo)} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {promo.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(promo)} className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <ManagePromotionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePromotion}
                promotionToEdit={promotionToEdit}
                existingCodes={promotions.map(p => p.code)}
            />
        </section>
    );
};
