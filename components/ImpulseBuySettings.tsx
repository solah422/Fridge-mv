import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectChaosSettings, updateImpulseBuySettings, saveChaosSettings } from '../store/slices/chaosSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { selectAllProducts } from '../store/slices/productsSlice';

// --- Reusable UI Components ---

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
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"></textarea>
    </div>
);


export const ImpulseBuySettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectChaosSettings);
    const allProducts = useAppSelector(selectAllProducts);

    if (!settings) return <div>Loading...</div>;
    const { impulseBuy } = settings;

    const handleUpdate = (update: Partial<typeof impulseBuy>) => {
        dispatch(updateImpulseBuySettings(update));
    };
    
    const handleSave = () => {
        dispatch(saveChaosSettings(settings));
        dispatch(addNotification({ type: 'success', message: 'Impulse Buy settings saved!' }));
    };

    const handleItemToggle = (productId: number) => {
        const newItems = impulseBuy.eligibleItems.includes(productId)
            ? impulseBuy.eligibleItems.filter(id => id !== productId)
            : [...impulseBuy.eligibleItems, productId];
        handleUpdate({ eligibleItems: newItems });
    };

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Impulse Buy (Flash Sale)"
                explanation="This feature creates a random, time-sensitive Flash Sale event. When triggered, it notifies all active users of a large, temporary discount on a single, randomly chosen item. Users only have a very short, pre-defined time to purchase the item at the sale price. Purpose: To create a fun, sudden burst of excitement and urgency."
            >
                <SettingsToggle label="Enable Impulse Buy" enabled={impulseBuy.enabled} onToggle={(val) => handleUpdate({ enabled: val })} />
                
                {impulseBuy.enabled && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingsInput label="Discount Percentage" type="number" value={impulseBuy.discount} onChange={(val) => handleUpdate({ discount: parseInt(val, 10) || 0 })} suffix="%" />
                            <SettingsInput label="Sale Duration" type="number" value={impulseBuy.duration} onChange={(val) => handleUpdate({ duration: parseInt(val, 10) || 0 })} suffix="seconds" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Trigger Frequency</label>
                            <select value={impulseBuy.frequency} onChange={(e) => handleUpdate({ frequency: e.target.value as any })} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))]">
                                <option value="daily">Once per day</option>
                                <option value="twice-daily">Twice per day</option>
                                <option value="random">Random (1-3 times per day)</option>
                            </select>
                        </div>
                         <SettingsTextarea label="Sale Start Message" value={impulseBuy.startMessage} onChange={(val) => handleUpdate({ startMessage: val })} />
                         <SettingsTextarea label="Sale End Message" value={impulseBuy.endMessage} onChange={(val) => handleUpdate({ endMessage: val })} />
                         <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Eligible Items Pool</label>
                            <div className="max-h-48 overflow-y-auto p-2 border rounded-md bg-[rgb(var(--color-bg-card))] space-y-1">
                                {allProducts.map(product => (
                                    <label key={product.id} className="flex items-center gap-2 text-sm p-1 rounded hover:bg-[rgb(var(--color-bg-subtle))]">
                                        <input type="checkbox" checked={impulseBuy.eligibleItems.includes(product.id)} onChange={() => handleItemToggle(product.id)} />
                                        {product.name}
                                    </label>
                                ))}
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
