import React, { useState, useEffect } from 'react';
import { Promotion } from '../types';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';

interface ManagePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: Omit<Promotion, 'id'> & { id?: string }) => void;
  promotionToEdit: Promotion | null;
  existingCodes: string[];
}

export const ManagePromotionModal: React.FC<ManagePromotionModalProps> = ({ isOpen, onClose, onSave, promotionToEdit, existingCodes }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (promotionToEdit) {
        setName(promotionToEdit.name);
        setCode(promotionToEdit.code);
        setType(promotionToEdit.type);
        setValue(promotionToEdit.value.toString());
        setIsActive(promotionToEdit.isActive);
      } else {
        setName('');
        setCode('');
        setType('percentage');
        setValue('');
        setIsActive(true);
      }
      setError('');
    }
  }, [isOpen, promotionToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codeToCheck = code.trim().toUpperCase();
    const isCodeDuplicate = existingCodes.some(
        c => c.toUpperCase() === codeToCheck && c.toUpperCase() !== promotionToEdit?.code.toUpperCase()
    );

    if (isCodeDuplicate) {
        setError('This promotion code already exists. Please use a unique code.');
        return;
    }

    const numericValue = parseFloat(value);
    if (name.trim() && codeToCheck && !isNaN(numericValue) && numericValue > 0) {
      onSave({
        id: promotionToEdit?.id,
        name: name.trim(),
        code: codeToCheck,
        type,
        value: numericValue,
        isActive,
      });
      onClose();
    } else {
      dispatch(addNotification({ type: 'error', message: 'Please fill in all fields with valid values.' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">{promotionToEdit ? 'Edit Promotion' : 'Create New Promotion'}</h3>
            <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="promo-name" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Promotion Name</label>
              <input id="promo-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Summer Sale" className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" required />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="promo-code" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Promo Code</label>
                    <input id="promo-code" type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g., SUMMER20" className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] uppercase" required />
                </div>
                 <div>
                    <label htmlFor="promo-type" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Discount Type</label>
                    <select id="promo-type" value={type} onChange={e => setType(e.target.value as 'percentage' | 'fixed')} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] h-[42px]">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (MVR)</option>
                    </select>
                </div>
            </div>
             <div>
                <label htmlFor="promo-value" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Value</label>
                <input id="promo-value" type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" step="0.01" min="0" required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">Save Promotion</button>
          </div>
        </form>
      </div>
    </div>
  );
};