import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectChaosSettings, updateAIPersonalitySwapSettings, saveChaosSettings, removeAIPersonality } from '../store/slices/chaosSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { AIPersonality } from '../types';
import { ManageAIPersonalityModal } from './ManageAIPersonalityModal';

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

export const AIPersonalitySwapSettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectChaosSettings);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [personalityToEdit, setPersonalityToEdit] = useState<AIPersonality | null>(null);

    if (!settings) return <div>Loading...</div>;
    const { aiPersonalitySwap } = settings;

    const handleUpdate = (update: Partial<typeof aiPersonalitySwap>) => {
        dispatch(updateAIPersonalitySwapSettings(update));
    };

    const handleSave = () => {
        dispatch(saveChaosSettings(settings));
        dispatch(addNotification({ type: 'success', message: 'AI Personality settings saved!' }));
    };

    const handleEdit = (personality: AIPersonality) => {
        setPersonalityToEdit(personality);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setPersonalityToEdit(null);
        setIsModalOpen(true);
    };

    const handleRemove = (id: string) => {
        if (window.confirm("Are you sure you want to delete this personality?")) {
            dispatch(removeAIPersonality(id));
        }
    };

    return (
        <>
            <div className="space-y-6">
                <SettingsSection
                    title="AI Personality Swap"
                    explanation="This feature gives your POS app a life of its own by allowing its core 'personality' to change. All greetings, confirmations, and notifications will be delivered in one of several personas. Purpose: To make interacting with the app unpredictable, surprising, and entertaining."
                >
                    <SettingsToggle label="Enable AI Personality Swap" enabled={aiPersonalitySwap.enabled} onToggle={(val) => handleUpdate({ enabled: val })} />

                    {aiPersonalitySwap.enabled && (
                        <>
                            <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                                <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Rotation Schedule</label>
                                <select value={aiPersonalitySwap.rotation} onChange={(e) => handleUpdate({ rotation: e.target.value as any })} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))]">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="login">Randomly on each login</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-semibold text-sm">Personality Manager</h5>
                                    <button onClick={handleAdd} className="px-3 py-1 bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-text-on-light))] text-xs font-semibold rounded-md">
                                        Add New
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-[rgb(var(--color-bg-card))]">
                                    {aiPersonalitySwap.personalities.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-2 rounded hover:bg-[rgb(var(--color-bg-subtle))]">
                                            <span className="font-medium text-sm">{p.name}</span>
                                            <div className="space-x-2">
                                                <button onClick={() => handleEdit(p)} className="text-xs text-[rgb(var(--color-primary))]">Edit</button>
                                                <button onClick={() => handleRemove(p.id)} className="text-xs text-red-500">Remove</button>
                                            </div>
                                        </div>
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
            
            <ManageAIPersonalityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                personalityToEdit={personalityToEdit}
            />
        </>
    );
};
