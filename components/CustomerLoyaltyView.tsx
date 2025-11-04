import React from 'react';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

export const CustomerLoyaltyView: React.FC = () => {
  const user = useAppSelector(selectUser);
  const customers = useAppSelector(state => state.customers.items);
  const { enabled, tiers } = useAppSelector(state => state.loyalty.loyaltySettings);

  const customer = customers.find(c => c.id === user?.id);
  const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints);

  if (!enabled) {
    return (
      <div className="bg-[rgb(var(--color-bg-card))] p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Loyalty Program</h2>
        <p className="text-[rgb(var(--color-text-muted))]">Our loyalty program is currently not active. Check back soon!</p>
      </div>
    );
  }
  
  if (!customer) return null;

  const currentPoints = customer.loyaltyPoints || 0;
  const currentTier = [...sortedTiers].reverse().find(t => currentPoints >= t.minPoints);
  const nextTierIndex = sortedTiers.findIndex(t => t.id === currentTier?.id) + 1;
  const nextTier = nextTierIndex < sortedTiers.length ? sortedTiers[nextTierIndex] : null;

  const progressPercentage = nextTier
    ? Math.max(0, Math.min(100, (currentPoints / nextTier.minPoints) * 100))
    : 100;

  return (
    <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Your Loyalty Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8">
        <div className="text-center p-6 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
            <p className="text-sm uppercase font-semibold text-[rgb(var(--color-text-muted))]">Your Points</p>
            <p className="text-6xl font-bold text-[rgb(var(--color-primary))]">{currentPoints}</p>
        </div>
        <div className="text-center p-6 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
            <p className="text-sm uppercase font-semibold text-[rgb(var(--color-text-muted))]">Current Tier</p>
            {currentTier ? (
                <div style={{ backgroundColor: currentTier.color, color: 'white' }} className="mt-2 inline-block px-4 py-2 text-2xl font-bold rounded-full shadow-md">
                    {currentTier.name}
                </div>
            ) : (
                <p className="text-2xl font-bold text-[rgb(var(--color-text-base))] mt-2">No Tier</p>
            )}
        </div>
      </div>

      {nextTier && (
        <div className="mb-8">
            <div className="flex justify-between items-end mb-1">
                <p className="text-sm text-[rgb(var(--color-text-muted))]">Progress to <span className="font-bold">{nextTier.name}</span> Tier</p>
                <p className="text-sm font-semibold">{currentPoints} / {nextTier.minPoints} points</p>
            </div>
            <div className="w-full bg-[rgb(var(--color-bg-subtle))] rounded-full h-4">
                <div className="bg-[rgb(var(--color-primary))] h-4 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
        </div>
      )}
      
      <div>
        <h3 className="text-xl font-bold mb-4 text-center">Tier Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedTiers.map(tier => (
                <div key={tier.id} className="border-2 rounded-lg p-4 text-center" style={{ borderColor: tier.color }}>
                    <h4 className="text-lg font-bold" style={{ color: tier.color }}>{tier.name}</h4>
                    <p className="text-sm text-[rgb(var(--color-text-muted))]">Requires {tier.minPoints} points</p>
                    <p className="mt-2 text-xl font-semibold">{tier.pointMultiplier}x</p>
                    <p className="text-sm text-[rgb(var(--color-text-muted))]">Point Earnings</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};