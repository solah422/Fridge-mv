import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { forceFinancePasswordUpdate } from '../store/slices/authSlice';

interface MandatoryPasswordChangeModalProps {
  onSuccess: () => void;
}

export const MandatoryPasswordChangeModal: React.FC<MandatoryPasswordChangeModalProps> = ({ onSuccess }) => {
    const dispatch = useAppDispatch();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 4) {
            setError('Password must be at least 4 characters long.');
            return;
        }

        setIsLoading(true);
        dispatch(forceFinancePasswordUpdate({ currentPassword: 'test', newPassword }))
            .unwrap()
            .then(() => {
                onSuccess();
            })
            .catch((err) => {
                setError(err.message || 'An unknown error occurred.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4">
            <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-[rgb(var(--color-border-subtle))]">
                        <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Security Update Required</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-[rgb(var(--color-text-muted))]">For security reasons, you must change your temporary password before proceeding.</p>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                    <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-end">
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md disabled:opacity-50">
                            {isLoading ? 'Updating...' : 'Set New Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
