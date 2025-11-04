import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectChaosSettings, updateItemBountyBoardSettings, saveChaosSettings } from '../store/slices/chaosSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { selectAllCustomers } from '../store/slices/customersSlice';

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

export const ItemBountyBoardSettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const settings = useAppSelector(selectChaosSettings);
    const customers = useAppSelector(selectAllCustomers);

    if (!settings) return <div>Loading...</div>;
    const { itemBountyBoard } = settings;

    const handleUpdate = (update: Partial<typeof itemBountyBoard>) => {
        dispatch(updateItemBountyBoardSettings(update));
    };

    const handleSave = () => {
        dispatch(saveChaosSettings(settings));
        dispatch(addNotification({ type: 'success', message: 'Item Bounty Board settings saved!' }));
    };

    return (
        <div className="space-y-6">
            <SettingsSection
                title='The "Item Bounty Board" (Collaborative Stocking)'
                explanation="This feature allows any user to 'post a bounty' for an item they want by pledging a small 'finder's fee' from their credit. Other users can contribute to the bounty. When an Admin or approved 'Bounty Hunter' stocks the item, they can claim the entire pot as a reward. Purpose: To create a self-funding, democratic system for new item requests, while actively rewarding the person responsible for stocking."
            >
                <SettingsToggle label="Enable Item Bounty Board" enabled={itemBountyBoard.enabled} onToggle={(val) => handleUpdate({ enabled: val })} />
                
                {itemBountyBoard.enabled && (
                    <>
                        <SettingsInput label="Board Public-Facing Name" type="text" value={itemBountyBoard.boardName} onChange={(val) => handleUpdate({ boardName: val })} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SettingsInput label="Minimum Initial Bounty" type="number" value={itemBountyBoard.minBounty} onChange={(val) => handleUpdate({ minBounty: parseFloat(val) || 0 })} suffix="MVR" />
                            <SettingsInput label="Minimum Contribution" type="number" value={itemBountyBoard.minContribution} onChange={(val) => handleUpdate({ minContribution: parseFloat(val) || 0 })} suffix="MVR" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Bounty Payout Recipient</label>
                            <select value={itemBountyBoard.payoutRecipientId} onChange={(e) => handleUpdate({ payoutRecipientId: e.target.value })} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))]">
                                <option value="admin">Admin</option>
                                <option value="finance">Finance</option>
                                {customers.map(c => <option key={c.id} value={c.id.toString()}>Hunter: {c.name}</option>)}
                            </select>
                        </div>
                        <SettingsTextarea label="New Bounty Posted Message" value={itemBountyBoard.newBountyMessage} onChange={(val) => handleUpdate({ newBountyMessage: val })} />
                        <SettingsTextarea label="Bounty Contributed Message" value={itemBountyBoard.contributionMessage} onChange={(val) => handleUpdate({ contributionMessage: val })} />
                        <SettingsTextarea label="Bounty Claimed Message" value={itemBountyBoard.claimedMessage} onChange={(val) => handleUpdate({ claimedMessage: val })} />
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