import React, { useState } from 'react';
import { ImpulseBuySettings } from './ImpulseBuySettings';
import { PantryLotterySettings } from './PantryLotterySettings';
import { DebtDerbySettings } from './DebtDerbySettings';
import { AIPersonalitySwapSettings } from './AIPersonalitySwapSettings';
import { ItemBountyBoardSettings } from './ItemBountyBoardSettings';
import { POSMascotSettings } from './POSMascotSettings';

type ChaosTab = 'impulse' | 'lottery' | 'derby' | 'ai' | 'bounty' | 'mascot';

const SubTabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-text-on-light))]' : 'hover:bg-[rgb(var(--color-bg-subtle))]'}`}
    >
        {label}
    </button>
);

export const ChaosAndFunView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ChaosTab>('impulse');

    return (
        <section>
            <h3 className="text-xl font-semibold text-[rgb(var(--color-text-base))] mb-1">Chaos & Fun</h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-4">
                Enable and configure optional, non-essential user engagement features to match your office culture.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <nav className="space-y-1">
                        <SubTabButton label="Impulse Buy" isActive={activeTab === 'impulse'} onClick={() => setActiveTab('impulse')} />
                        <SubTabButton label="Pantry Lottery" isActive={activeTab === 'lottery'} onClick={() => setActiveTab('lottery')} />
                        <SubTabButton label="The Debt Derby" isActive={activeTab === 'derby'} onClick={() => setActiveTab('derby')} />
                        <SubTabButton label="AI Personality Swap" isActive={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
                        <SubTabButton label="Item Bounty Board" isActive={activeTab === 'bounty'} onClick={() => setActiveTab('bounty')} />
                        <SubTabButton label="POS Mascot" isActive={activeTab === 'mascot'} onClick={() => setActiveTab('mascot')} />
                    </nav>
                </div>

                <div className="md:col-span-3">
                    {activeTab === 'impulse' && <ImpulseBuySettings />}
                    {activeTab === 'lottery' && <PantryLotterySettings />}
                    {activeTab === 'derby' && <DebtDerbySettings />}
                    {activeTab === 'ai' && <AIPersonalitySwapSettings />}
                    {activeTab === 'bounty' && <ItemBountyBoardSettings />}
                    {activeTab === 'mascot' && <POSMascotSettings />}
                </div>
            </div>
        </section>
    );
};