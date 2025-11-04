import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { registerCustomer } from '../store/slices/authSlice';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [formState, setFormState] = useState({
    redboxId: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (!formState.redboxId || !formState.password) {
      setError('Redbox ID and password are required.');
      return;
    }

    setIsLoading(true);

    dispatch(registerCustomer({
        redboxId: formState.redboxId,
        password: formState.password,
    }))
    .unwrap()
    .then(() => {
        onClose(); // On success, close the modal, user is now logged in.
    })
    .catch((err) => {
        setError(err);
    })
    .finally(() => {
        setIsLoading(false);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Register Your Account</h3>
            <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
          </div>
          <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Enter the Redbox ID provided by the admin and choose a password to create your online account.</p>
            <input name="redboxId" type="number" value={formState.redboxId} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="* Redbox ID" required />
            <input name="password" type="password" value={formState.password} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="* Choose a Password" required />
            <input name="confirmPassword" type="password" value={formState.confirmPassword} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="* Confirm Password" required />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md disabled:opacity-50">
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};