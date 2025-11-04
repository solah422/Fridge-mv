import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectChaosSettings, updateDebtDerbySettings, saveChaosSettings } from '../store/slices/chaosSlice';
import { addNotification } from '../store/slices/notificationsSlice';

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

export const DebtDerbySettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectChaosSettings);

    if (!settings) return <div>Loading...</div>;
    const { debtDerby } = settings;

    const handleUpdate = (update: Partial<typeof debtDerby>) => {
        dispatch(updateDebtDerbySettings(update));
    };
    
    const handleSave = () => {
        dispatch(saveChaosSettings(settings));
        dispatch(addNotification({ type: 'success', message: 'Debt Derby settings saved!' }));
    };

    return (
        <div className="space-y-6">
            <SettingsSection
                title="The Debt Derby (Leaderboard)"
                explanation="This feature gamifies the POS by turning the credit ledger into a friendly competition. It can display public-facing leaderboards, track 'Spender Streaks,' and enable a 'Sassy AI Auditor' for humorous commentary. Purpose: To foster social engagement and make the POS a shared public event."
            >
                <SettingsToggle label="Enable Debt Derby" enabled={debtDerby.enabled} onToggle={(val) => handleUpdate({ enabled: val })} />

                {debtDerby.enabled && (
                    <>
                         <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                            <h5 className="font-semibold text-sm mb-2">Component Toggles</h5>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm p-1"><input type="checkbox" checked={debtDerby.showHighRoller} onChange={(e) => handleUpdate({ showHighRoller: e.target.checked })} /> Show "High Roller" Leaderboard</label>
                                <label className="flex items-center gap-2 text-sm p-1"><input type="checkbox" checked={debtDerby.showSpenderStreaks} onChange={(e) => handleUpdate({ showSpenderStreaks: e.target.checked })} /> Show "Spender Streaks"</label>
                                <label className="flex items-center gap-2 text-sm p-1"><input type="checkbox" checked={debtDerby.showItemFutures} onChange={(e) => handleUpdate({ showItemFutures: e.target.checked })} /> Show "Item Futures" Betting Pool</label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                             <h5 className="font-semibold text-sm mb-2">Leaderboard Customization</h5>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SettingsInput label="Leaderboard Title" type="text" value={debtDerby.leaderboardTitle} onChange={(val) => handleUpdate({ leaderboardTitle: val })} />
                                <SettingsInput label="Number of Users to Show" type="number" value={debtDerby.leaderboardCount} onChange={(val) => handleUpdate({ leaderboardCount: parseInt(val) || 1 })} />
                                <SettingsInput label="'On Fire' Streak Threshold" type="number" value={debtDerby.streakThreshold} onChange={(val) => handleUpdate({ streakThreshold: parseInt(val) || 1 })} />
                             </div>
                        </div>

                        <div className="pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                             <h5 className="font-semibold text-sm mb-2">Commentary Engine</h5>
                            <SettingsToggle label="Enable Sassy AI Auditor" enabled={debtDerby.enableSassyAuditor} onToggle={(val) => handleUpdate({ enableSassyAuditor: val })} />
                            {debtDerby.enableSassyAuditor && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Comment Frequency</label>
                                    <select value={debtDerby.commentFrequency} onChange={(e) => handleUpdate({ commentFrequency: e.target.value as any })} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))]">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High - Total Chaos</option>
                                    </select>
                                </div>
                            )}
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
