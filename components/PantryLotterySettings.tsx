import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectChaosSettings, updatePantryLotterySettings, saveChaosSettings } from '../store/slices/chaosSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { selectAllProducts } from '../store/slices/productsSlice';

// --- Reusable UI Components (shared style with ImpulseBuySettings) ---

const SettingsSection: React.FC<{ title: string; explanation: string; children: React.ReactNode }> = ({ title, explanation, children }) => (
    <div className="bg-[rgb(var(--color-bg-subtle))] p-4 rounded-lg">
        <h4 className="font-semibold text-[rgb(var(--color-text-base))]">{title}</h4>
        <p className="text-xs text-[rgb(var(--color-text-muted))] mb-4">{explanation}</p>
        <div className="space-y-4">{children}</div>
    </div>
);

const SettingsToggle: React.FC<{ label: string; enabled: boolean; onToggle: (enabled: boolean) => void; }> = ({ label, enabled, onToggle }) => (
    <div className="flex items-center justify-between p-3 bg-[rgb(var(--color-bg-card))] rounded-md border border-[rgb(var(--color-border-subtle))]">
        <span className="font-medium text-sm">{label}</span>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-primary))]"></div>
        </label>
    </div>
);

const SettingsInput: React.FC<{ label: string; type: string; value: any; onChange: (value: any) => void; suffix?: string; }> = ({ label, type, value, onChange, suffix }) => (
    <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">{label}</label>
        <div className="flex items-center">
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" />
            {suffix && <span className="ml-2 text-[rgb(var(--color-text-muted))]">{suffix}</span>}
        </div>
    </div>
);

const SettingsTextarea: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">{label}</label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"></textarea>
    </div>
);

export const PantryLotterySettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectChaosSettings);
    const allProducts = useAppSelector(selectAllProducts);

    if (!settings) return <div>Loading...</div>;
    const { pantryLottery } = settings;

    const handleUpdate = (update: Partial<typeof pantryLottery>) => {
        dispatch(updatePantryLotterySettings(update));
    };

    const handleSave = () => {
        dispatch(saveChaosSettings(settings));
        dispatch(addNotification({ type: 'success', message: 'Pantry Lottery settings saved!' }));
    };

    const handleItemToggle = (productId: number) => {
        const newItems = pantryLottery.eligibleItems.includes(productId)
            ? pantryLottery.eligibleItems.filter(id => id !== productId)
            : [...pantryLottery.eligibleItems, productId];
        handleUpdate({ eligibleItems: newItems });
    };

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Pantry Lottery (Mystery Snack)"
                explanation="This feature adds a new, special item to the POS. Users can choose to buy this item for a single, fixed price. When they do, the system will randomly assign them an item from a pre-defined pool. Purpose: To add a fun, low-stakes element of chance and surprise."
            >
                <SettingsToggle label="Enable Pantry Lottery" enabled={pantryLottery.enabled} onToggle={(val) => handleUpdate({ enabled: val })} />

                {pantryLottery.enabled && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingsInput label="'Mystery' Item Name" type="text" value={pantryLottery.itemName} onChange={(val) => handleUpdate({ itemName: val })} />
                            <SettingsInput label="'Mystery' Item Price" type="number" value={pantryLottery.itemPrice} onChange={(val) => handleUpdate({ itemPrice: parseFloat(val) || 0 })} suffix="MVR" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Eligible Item Pool (Prizes)</label>
                            <div className="max-h-48 overflow-y-auto p-2 border rounded-md bg-[rgb(var(--color-bg-card))] space-y-1">
                                {allProducts.map(product => (
                                    <label key={product.id} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-[rgb(var(--color-bg-subtle))]">
                                        <input type="checkbox" checked={pantryLottery.eligibleItems.includes(product.id)} onChange={() => handleItemToggle(product.id)} />
                                        {product.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                             <h5 className="font-semibold text-sm mb-2">Jackpot Settings</h5>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SettingsInput label="Jackpot Chance" type="number" value={pantryLottery.jackpotChance} onChange={(val) => handleUpdate({ jackpotChance: parseFloat(val) || 0 })} suffix="%" />
                                <SettingsInput label="Jackpot Reward" type="text" value={pantryLottery.jackpotReward} onChange={(val) => handleUpdate({ jackpotReward: val })} />
                             </div>
                             <div className="mt-4">
                                 <SettingsTextarea label="Jackpot Announcement" value={pantryLottery.jackpotMessage} onChange={(val) => handleUpdate({ jackpotMessage: val })} />
                             </div>
                        </div>
                    </>
                )}
            </SettingsSection>

            <div className="text-right">
                <button onClick={handleSave} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))]">
                    Save Changes
                </button>
            </div>
        </div>
    );
};
