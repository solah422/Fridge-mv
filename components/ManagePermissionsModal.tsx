import React, { useState, useEffect } from 'react';
import { Customer, Credential } from '../types';
import { useAppDispatch } from '../store/hooks';
import { updateCredentialRole } from '../store/slices/credentialsSlice';

interface ManagePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  currentRole: Credential['role'];
}

export const ManagePermissionsModal: React.FC<ManagePermissionsModalProps> = ({ isOpen, onClose, customer, currentRole }) => {
  const dispatch = useAppDispatch();
  const [selectedRole, setSelectedRole] = useState<Credential['role']>(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(currentRole);
    }
  }, [isOpen, currentRole]);

  const handleSave = () => {
    if (!customer.redboxId) return;
    
    setIsLoading(true);
    dispatch(updateCredentialRole({ redboxId: customer.redboxId, role: selectedRole }))
      .unwrap()
      .then(() => {
        onClose();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!isOpen) return null;

  const roles: { id: Credential['role']; label: string; description: string }[] = [
    { id: 'customer', label: 'Customer', description: 'Standard access. Can view products, place orders, and view own history.' },
    { id: 'finance', label: 'Finance Manager', description: 'Access to financial dashboards, reports, and invoice management.' },
    { id: 'admin', label: 'Administrator', description: 'Full system access, including settings, user management, and inventory.' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Manage Permissions</h3>
          <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-[rgb(var(--color-text-base))]">
            Setting permissions for <span className="font-bold">{customer.name}</span> (ID: {customer.redboxId})
          </p>
          
          <div className="space-y-3">
            {roles.map((role) => (
              <label 
                key={role.id} 
                className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${selectedRole === role.id ? 'bg-[rgb(var(--color-primary-light))] border-[rgb(var(--color-primary))]' : 'bg-[rgb(var(--color-bg-subtle))] border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]'}`}
              >
                <input 
                  type="radio" 
                  name="role" 
                  value={role.id} 
                  checked={selectedRole === role.id} 
                  onChange={() => setSelectedRole(role.id)} 
                  className="mt-1 h-4 w-4 text-[rgb(var(--color-primary))] border-gray-300 focus:ring-[rgb(var(--color-primary))]"
                />
                <div className="ml-3">
                  <span className={`block text-sm font-medium ${selectedRole === role.id ? 'text-[rgb(var(--color-primary-text-on-light))]' : 'text-[rgb(var(--color-text-base))]'}`}>
                    {role.label}
                  </span>
                  <span className={`block text-xs ${selectedRole === role.id ? 'text-[rgb(var(--color-primary-text-on-light))] opacity-80' : 'text-[rgb(var(--color-text-muted))]'}`}>
                    {role.description}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {selectedRole !== 'customer' && (
             <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> Granting {selectedRole === 'admin' ? 'Administrator' : 'Finance'} access will allow this user to view sensitive business data.
             </div>
          )}
        </div>

        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
};