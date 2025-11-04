import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { useAppSelector } from '../store/hooks';
import { selectCreditSettings } from '../store/slices/appSlice';

interface ManageCustomersModalProps {
  isOpen: boolean;
  customers: Customer[];
  onSave: (customer: Customer | Omit<Customer, 'id'>) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
  customerToEdit: Customer | null;
}

const InputField: React.FC<any> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">{label}</label>
        <input {...props} className="w-full p-2 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] focus:ring-1 focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))]" />
    </div>
);

export const ManageCustomersModal: React.FC<ManageCustomersModalProps> = ({ isOpen, customers, onSave, onRemove, onClose, customerToEdit }) => {
    const isEditing = customerToEdit !== null;
    const { defaultCreditLimit } = useAppSelector(selectCreditSettings);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', telegramId: '', redboxId: '',
        address: '', notes: '', tags: '', password: '', maximumCreditLimit: defaultCreditLimit.toString()
    });
    const [error, setError] = useState('');

    useEffect(() => {
      if (isOpen) {
        setForm({
            name: customerToEdit?.name || '',
            email: customerToEdit?.email || '',
            phone: customerToEdit?.phone || '',
            telegramId: customerToEdit?.telegramId || '',
            redboxId: customerToEdit?.redboxId?.toString() || '',
            address: customerToEdit?.address || '',
            notes: customerToEdit?.notes || '',
            tags: customerToEdit?.tags?.join(', ') || '',
            password: '',
            maximumCreditLimit: customerToEdit?.maximumCreditLimit?.toString() || defaultCreditLimit.toString(),
        });
        setError('');
      }
    }, [isOpen, customerToEdit, defaultCreditLimit]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setError('');
        const numericRedboxId = form.redboxId ? parseInt(form.redboxId, 10) : undefined;
        const currentCustomerId = isEditing ? customerToEdit.id : null;

        if (numericRedboxId && customers.some(c => c.id !== currentCustomerId && c.redboxId === numericRedboxId)) {
            setError('This Redbox ID is already in use.');
            return;
        }
        if (!form.name.trim()) {
            setError("Customer name is required.");
            return;
        }

        const originalRedboxId = isEditing ? customerToEdit.redboxId : undefined;
        if (isEditing && numericRedboxId !== originalRedboxId) {
          if (!window.confirm(`You are changing the login ID for ${customerToEdit.name} from "${originalRedboxId || 'N/A'}" to "${numericRedboxId || 'N/A'}". Are you sure?`)) {
            return;
          }
        }
        
        const saveData = {
            ...(isEditing && { id: customerToEdit.id }),
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            telegramId: form.telegramId.trim(),
            address: form.address.trim(),
            notes: form.notes.trim(),
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            redboxId: numericRedboxId,
            maximumCreditLimit: parseInt(form.maximumCreditLimit, 10) || defaultCreditLimit,
            ...(form.password.trim() && { password: form.password.trim() }),
            ...(!isEditing && { loyaltyPoints: 0, createdAt: new Date().toISOString(), creditBlocked: false }),
            ...(isEditing && { loyaltyPoints: customerToEdit.loyaltyPoints, createdAt: customerToEdit.createdAt, creditBlocked: customerToEdit.creditBlocked })
        };
        onSave(saveData);
    };

    const handleDelete = () => {
        if (isEditing && window.confirm(`Are you sure you want to delete ${customerToEdit.name}? This action cannot be undone.`)) {
            onRemove(customerToEdit.id);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 p-4">
            <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col">
                <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex-shrink-0 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">
                        {isEditing ? `Edit ${customerToEdit.name}` : 'Add New Customer'}
                    </h3>
                    <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                    <section>
                        <h4 className="font-semibold text-[rgb(var(--color-text-muted))] mb-3">Contact Information</h4>
                        <div className="space-y-4">
                            <InputField label="Name" name="name" value={form.name} onChange={handleChange} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                                <InputField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
                            </div>
                            <InputField label="Telegram ID" name="telegramId" value={form.telegramId} onChange={handleChange} />
                        </div>
                    </section>

                    <section className="border-t border-[rgb(var(--color-border-subtle))] pt-6">
                        <h4 className="font-semibold text-[rgb(var(--color-text-muted))] mb-3">Additional Details</h4>
                        <div className="space-y-4">
                            <InputField label="Address" name="address" value={form.address} onChange={handleChange} />
                             <div>
                                <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Notes</label>
                                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full p-2 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"></textarea>
                            </div>
                            <InputField label="Tags (comma-separated)" name="tags" value={form.tags} onChange={handleChange} />
                        </div>
                    </section>

                    <section className="border-t border-[rgb(var(--color-border-subtle))] pt-6">
                        <h4 className="font-semibold text-[rgb(var(--color-text-muted))] mb-3">Account & Credit</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Redbox ID (Login)" name="redboxId" type="number" value={form.redboxId} onChange={handleChange} />
                            <InputField label={isEditing ? "New Password (optional)" : "Password (optional)"} name="password" type="password" value={form.password} onChange={handleChange} />
                            <InputField label="Maximum Credit Limit (MVR)" name="maximumCreditLimit" type="number" value={form.maximumCreditLimit} onChange={handleChange} />
                            <div>
                                <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Credit Status</label>
                                <div className={`w-full p-2 border rounded ${customerToEdit?.creditBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {customerToEdit?.creditBlocked ? 'Blocked' : 'Active'}
                                </div>
                            </div>
                         </div>
                    </section>
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                </div>

                <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex-shrink-0 flex justify-between items-center">
                    <div>
                        {isEditing && (
                            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900/80 transition font-semibold">
                                Delete Customer
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md font-semibold">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md font-semibold">{isEditing ? 'Save Changes' : 'Add Customer'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};