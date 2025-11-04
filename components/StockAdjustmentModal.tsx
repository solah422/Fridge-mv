import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: number, adjustment: number, reason: string) => void;
  product: Product | null;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAdjustmentType('add');
      setQuantity('');
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const qtyValue = parseInt(quantity, 10);
    
    if (isNaN(qtyValue) || qtyValue <= 0) {
      setError('Please enter a valid, positive quantity.');
      return;
    }
    if (adjustmentType === 'remove' && qtyValue > product.stock) {
      setError(`Cannot remove more than the current stock (${product.stock}).`);
      return;
    }
    if (!reason.trim()) {
      setError('A reason for the adjustment is required.');
      return;
    }

    const adjustmentValue = adjustmentType === 'add' ? qtyValue : -qtyValue;
    onSave(product.id, adjustmentValue, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))]">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Adjust Stock</h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">{product.name}</p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm">Current Stock: <span className="font-bold">{product.stock}</span></p>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-2">Adjustment Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('add')}
                  className={`flex-1 py-2 px-4 rounded-md transition text-sm font-semibold ${adjustmentType === 'add' ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))]' : 'bg-[rgb(var(--color-bg-subtle))] hover:bg-[rgb(var(--color-border-subtle))]'}`}
                >
                  Add to Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('remove')}
                  className={`flex-1 py-2 px-4 rounded-md transition text-sm font-semibold ${adjustmentType === 'remove' ? 'bg-red-600 text-white' : 'bg-[rgb(var(--color-bg-subtle))] hover:bg-[rgb(var(--color-border-subtle))]'}`}
                >
                  Remove from Stock
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="adj-quantity" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Quantity</label>
              <input
                id="adj-quantity"
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                min="1"
                required
              />
            </div>
            <div>
              <label htmlFor="adj-reason" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Reason</label>
              <input
                id="adj-reason"
                type="text"
                placeholder="e.g., Stock count correction, Damaged goods"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">Save Adjustment</button>
          </div>
        </form>
      </div>
    </div>
  );
};