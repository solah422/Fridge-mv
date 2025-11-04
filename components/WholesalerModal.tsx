import React, { useState, useEffect } from 'react';
import { Wholesaler } from '../types';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';

interface WholesalerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wholesaler: Omit<Wholesaler, 'id'> & { id?: number }) => void;
  wholesalerToEdit: Wholesaler | null;
}

export const WholesalerModal: React.FC<WholesalerModalProps> = ({ isOpen, onClose, onSave, wholesalerToEdit }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (wholesalerToEdit) {
        setName(wholesalerToEdit.name);
        setContactPerson(wholesalerToEdit.contactPerson || '');
        setContactNumber(wholesalerToEdit.contactNumber || '');
        setEmail(wholesalerToEdit.email || '');
      } else {
        setName('');
        setContactPerson('');
        setContactNumber('');
        setEmail('');
      }
    }
  }, [isOpen, wholesalerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        id: wholesalerToEdit?.id,
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
      });
      onClose();
    } else {
      dispatch(addNotification({ type: 'error', message: 'Company name is required.'}));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">{wholesalerToEdit ? 'Edit Wholesaler' : 'Add New Wholesaler'}</h3>
            <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="ws-name" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Company Name</label>
              <input id="ws-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" required />
            </div>
            <div>
              <label htmlFor="ws-person" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Contact Person (Optional)</label>
              <input id="ws-person" type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" />
            </div>
             <div>
              <label htmlFor="ws-number" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Contact Number (Optional)</label>
              <input id="ws-number" type="text" value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" />
            </div>
             <div>
              <label htmlFor="ws-email" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Email (Optional)</label>
              <input id="ws-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" />
            </div>
          </div>

          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">Save Wholesaler</button>
          </div>
        </form>
      </div>
    </div>
  );
};