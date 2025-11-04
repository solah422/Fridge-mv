import React, { useState, useEffect } from 'react';
import { LoyaltyTier } from '../types';

interface ManageLoyaltyTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tier: Omit<LoyaltyTier, 'id'> & { id?: string }) => void;
  tierToEdit: LoyaltyTier | null;
}

export const ManageLoyaltyTierModal: React.FC<ManageLoyaltyTierModalProps> = ({ isOpen, onClose, onSave, tierToEdit }) => {
  const [name, setName] = useState('');
  const [minPoints, setMinPoints] = useState('');
  const [pointMultiplier, setPointMultiplier] = useState('');
  const [color, setColor] = useState('#4f46e5');

  useEffect(() => {
    if (isOpen) {
      if (tierToEdit) {
        setName(tierToEdit.name);
        setMinPoints(tierToEdit.minPoints.toString());
        setPointMultiplier(tierToEdit.pointMultiplier.toString());
        setColor(tierToEdit.color);
      } else {
        setName('');
        setMinPoints('0');
        setPointMultiplier('1');
        setColor('#4f46e5');
      }
    }
  }, [isOpen, tierToEdit]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const points = parseInt(minPoints);
    const multiplier = parseFloat(pointMultiplier);
    
    if (name.trim() && !isNaN(points) && points >= 0 && !isNaN(multiplier) && multiplier >= 0) {
      onSave({
        id: tierToEdit?.id,
        name: name.trim(),
        minPoints: points,
        pointMultiplier: multiplier,
        color: color,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b">
            <h3 className="text-xl font-bold">{tierToEdit ? 'Edit Tier' : 'Add New Tier'}</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="tier-name" className="block text-sm font-medium mb-1">Tier Name</label>
              <input id="tier-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="tier-min-points" className="block text-sm font-medium mb-1">Min. Points Required</label>
                    <input id="tier-min-points" type="number" value={minPoints} onChange={e => setMinPoints(e.target.value)} className="w-full p-2 border rounded" min="0" required />
                </div>
                <div>
                    <label htmlFor="tier-multiplier" className="block text-sm font-medium mb-1">Point Multiplier</label>
                    <input id="tier-multiplier" type="number" value={pointMultiplier} onChange={e => setPointMultiplier(e.target.value)} className="w-full p-2 border rounded" step="0.01" min="0" required />
                </div>
            </div>
            <div>
                <label htmlFor="tier-color" className="block text-sm font-medium mb-1">Tier Color</label>
                <div className="flex items-center gap-2">
                    <input id="tier-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 p-1 border rounded" />
                    <span style={{ color }} className="font-semibold">{name || 'Sample Text'}</span>
                </div>
            </div>
          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md">Save Tier</button>
          </div>
        </form>
      </div>
    </div>
  );
};