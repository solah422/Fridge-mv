import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { updateFinancePassword } from '../store/slices/authSlice';

export const FinanceSettingsView: React.FC = () => {
    const dispatch = useAppDispatch();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (!newPassword || !currentPassword) {
             setMessage({ type: 'error', text: 'All fields are required.' });
            return;
        }

        dispatch(updateFinancePassword({ currentPassword, newPassword }))
            .unwrap()
            .then(() => {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            })
            .catch((error) => {
                setMessage({ type: 'error', text: error.message });
            });
    };
    
    return (
        <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
            <div className="p-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
                <p className="font-medium text-[rgb(var(--color-text-base))]">Change Password</p>
                <p className="text-sm text-[rgb(var(--color-text-muted))] mb-3">Update your login password.</p>
                <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
                    <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded"/>
                    <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded"/>
                    <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded"/>
                    {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
                    <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))]">Update Password</button>
                </form>
            </div>
        </div>
    );
};
