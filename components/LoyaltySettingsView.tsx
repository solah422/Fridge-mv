import React, { useState } from 'react';
import { LoyaltySettings, LoyaltyTier } from '../types';
import { ManageLoyaltyTierModal } from './ManageLoyaltyTierModal';

interface LoyaltySettingsViewProps {
  loyaltySettings: LoyaltySettings;
  onLoyaltySettingsUpdate: (settings: LoyaltySettings) => void;
}

export const LoyaltySettingsView: React.FC<LoyaltySettingsViewProps> = ({ loyaltySettings, onLoyaltySettingsUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tierToEdit, setTierToEdit] = useState<LoyaltyTier | null>(null);

  const handleToggleEnabled = () => {
    onLoyaltySettingsUpdate({ ...loyaltySettings, enabled: !loyaltySettings.enabled });
  };
  
  const handlePointsPerMvrChange = (value: string) => {
    const points = parseFloat(value);
    if (!isNaN(points) && points >= 0) {
      onLoyaltySettingsUpdate({ ...loyaltySettings, pointsPerMvr: points });
    }
  };

  const handleSaveTier = (tierData: Omit<LoyaltyTier, 'id'> & { id?: string }) => {
    let updatedTiers: LoyaltyTier[];
    if (tierData.id) {
      updatedTiers = loyaltySettings.tiers.map(t => t.id === tierData.id ? { ...t, ...tierData } as LoyaltyTier : t);
    } else {
      const newTier: LoyaltyTier = { ...tierData, id: `tier-${Date.now()}` };
      updatedTiers = [...loyaltySettings.tiers, newTier];
    }
    onLoyaltySettingsUpdate({ ...loyaltySettings, tiers: updatedTiers });
    setIsModalOpen(false);
  };
  
  const handleRemoveTier = (tierId: string) => {
      if (window.confirm("Are you sure you want to delete this tier? This cannot be undone.")) {
          const updatedTiers = loyaltySettings.tiers.filter(t => t.id !== tierId);
          onLoyaltySettingsUpdate({ ...loyaltySettings, tiers: updatedTiers });
      }
  };
  
  const handleEditTier = (tier: LoyaltyTier) => {
      setTierToEdit(tier);
      setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md space-y-6">
        <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
          <div>
            <h3 className="font-semibold text-[rgb(var(--color-text-base))]">Enable Loyalty Program</h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Toggle to enable or disable loyalty point earnings.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={loyaltySettings.enabled} onChange={handleToggleEnabled} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
          <label htmlFor="points-per-mvr" className="block font-semibold text-[rgb(var(--color-text-base))]">Points per MVR</label>
          <p className="text-sm text-[rgb(var(--color-text-muted))] mb-2">Number of loyalty points awarded for every MVR 1.00 spent.</p>
          <input
            id="points-per-mvr"
            type="number"
            value={loyaltySettings.pointsPerMvr}
            onChange={e => handlePointsPerMvrChange(e.target.value)}
            className="p-2 border rounded-md w-full max-w-xs bg-[rgb(var(--color-bg-card))]"
            step="0.1"
            min="0"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Loyalty Tiers</h3>
            <button onClick={() => { setTierToEdit(null); setIsModalOpen(true); }} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md font-semibold">
              Add Tier
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
              <thead className="bg-[rgb(var(--color-bg-subtle))]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium uppercase">Tier Name</th>
                  <th className="px-4 py-3 text-left font-medium uppercase">Min. Points</th>
                  <th className="px-4 py-3 text-left font-medium uppercase">Point Multiplier</th>
                  <th className="px-4 py-3 text-right font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border-subtle))]">
                {[...loyaltySettings.tiers].sort((a,b) => a.minPoints - b.minPoints).map(tier => (
                  <tr key={tier.id}>
                    <td className="px-4 py-4 font-semibold flex items-center gap-2">
                        <span style={{ backgroundColor: tier.color }} className="w-4 h-4 rounded-full"/>
                        {tier.name}
                    </td>
                    <td className="px-4 py-4">{tier.minPoints}</td>
                    <td className="px-4 py-4">{tier.pointMultiplier}x</td>
                    <td className="px-4 py-4 text-right space-x-4">
                        <button onClick={() => handleEditTier(tier)} className="text-[rgb(var(--color-primary))] hover:underline">Edit</button>
                        <button onClick={() => handleRemoveTier(tier.id)} className="text-red-500 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ManageLoyaltyTierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTier}
        tierToEdit={tierToEdit}
      />
    </>
  );
};