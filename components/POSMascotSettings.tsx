import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectChaosSettings, updatePOSMascotSettings, saveChaosSettings } from '../store/slices/chaosSlice';
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

const SettingsInput: React.FC<{ label: string; type: string; value: any; onChange: (value: any) => void; }> = ({ label, type, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">{label}</label>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" />
    </div>
);

const SettingsTextarea: React.FC<{ label: string; value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">{label}</label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"></textarea>
    </div>
);

export const POSMascotSettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectChaosSettings);
    const allProducts = useAppSelector(selectAllProducts);

    if (!settings) return <div>Loading...</div>;
    const { posMascot } = settings;

    const handleUpdate = (update: Partial<typeof posMascot>) => {
        dispatch(updatePOSMascotSettings(update));
    };

    const handleSave = () => {
        dispatch(saveChaosSettings(settings));
        dispatch(addNotification({ type: 'success', message: 'POS Mascot settings saved!' }));
    };
    
    const handleItemToggle = (productId: number, list: 'happyItems' | 'sadItems') => {
        const currentItems = posMascot[list];
        const newItems = currentItems.includes(productId)
            ? currentItems.filter(id => id !== productId)
            : [...currentItems, productId];
        handleUpdate({ [list]: newItems });
    };

    return (
        <div className="space-y-6">
            <SettingsSection
                title='The "POS Mascot" (Shared Office Mascot Cat)'
                explanation="This feature adds a shared digital pet (a cat) that lives on the dashboard. Its mood and animations are collectively influenced by the office's actions, such as purchase habits and fiscal health. Purpose: To create a cute, shared responsibility that reframes mundane actions as 'taking care of the office cat.'"
            >
                <SettingsToggle label="Enable POS Mascot" enabled={posMascot.enabled} onToggle={(val) => handleUpdate({ enabled: val })} />

                {posMascot.enabled && (
                    <>
                        <SettingsInput label="Mascot's Name" type="text" value={posMascot.mascotName} onChange={(val) => handleUpdate({ mascotName: val })} />
                        
                        <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                            <h5 className="font-semibold text-sm mb-2">Mascot Mood Triggers (Item-Based)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">"Happy" Items</label>
                                    <div className="max-h-32 overflow-y-auto p-2 border rounded-md bg-[rgb(var(--color-bg-card))] space-y-1">
                                        {allProducts.map(p => <label key={p.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={posMascot.happyItems.includes(p.id)} onChange={() => handleItemToggle(p.id, 'happyItems')} />{p.name}</label>)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">"Jittery/Sad" Items</label>
                                     <div className="max-h-32 overflow-y-auto p-2 border rounded-md bg-[rgb(var(--color-bg-card))] space-y-1">
                                        {allProducts.map(p => <label key={p.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={posMascot.sadItems.includes(p.id)} onChange={() => handleItemToggle(p.id, 'sadItems')} />{p.name}</label>)}
                                    </div>
                                </div>
                            </div>
                             <div className="mt-4">
                                <SettingsInput label="Mood Threshold" type="number" value={posMascot.moodThreshold} onChange={(val) => handleUpdate({ moodThreshold: parseInt(val) || 1 })} />
                            </div>
                        </div>

                         <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                            <h5 className="font-semibold text-sm mb-2">Mascot Mood Triggers (Financial)</h5>
                             <SettingsToggle label="Enable Fiscal Mood" enabled={posMascot.enableFiscalMood} onToggle={(val) => handleUpdate({ enableFiscalMood: val })} />
                        </div>
                        
                        <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                             <h5 className="font-semibold text-sm mb-2">Mascot Notification Texts</h5>
                             <SettingsTextarea label="Happy Message" value={posMascot.happyMessage} onChange={(val) => handleUpdate({ happyMessage: val })} />
                             <SettingsTextarea label="Sad/Jittery Message" value={posMascot.sadMessage} onChange={(val) => handleUpdate({ sadMessage: val })} />
                             <SettingsTextarea label="Anxious (Fiscal) Message" value={posMascot.anxiousMessage} onChange={(val) => handleUpdate({ anxiousMessage: val })} />
                             <SettingsTextarea label="Secure (Fiscal) Message" value={posMascot.secureMessage} onChange={(val) => handleUpdate({ secureMessage: val })} />
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