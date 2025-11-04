import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { addOrUpdateAIPersonality } from '../store/slices/chaosSlice';
import { AIPersonality } from '../types';

interface ManageAIPersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalityToEdit: AIPersonality | null;
}

const SettingsTextarea: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder: string }> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">{label}</label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"></textarea>
    </div>
);

export const ManageAIPersonalityModal: React.FC<ManageAIPersonalityModalProps> = ({ isOpen, onClose, personalityToEdit }) => {
    const dispatch = useAppDispatch();
    const [form, setForm] = useState({
        id: '',
        name: '',
        greeting: '',
        confirmation: '',
        dashboardMessage: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (personalityToEdit) {
                setForm(personalityToEdit);
            } else {
                setForm({
                    id: `p-${Date.now()}`,
                    name: '',
                    greeting: '',
                    confirmation: '',
                    dashboardMessage: '',
                });
            }
        }
    }, [isOpen, personalityToEdit]);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(form.name.trim()) {
            dispatch(addOrUpdateAIPersonality(form));
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
                        <h3 className="text-xl font-bold">{personalityToEdit ? 'Edit Personality' : 'Add New Personality'}</h3>
                        <button type="button" onClick={onClose} className="text-3xl">&times;</button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium mb-1">Personality Name</label>
                            <input type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., 80s Fitness Instructor" className="w-full p-2 border rounded" required />
                        </div>
                        <SettingsTextarea label="Greeting Message" value={form.greeting} onChange={(val) => handleChange('greeting', val)} placeholder="e.g., Let's get pumped for some sales!" />
                        <SettingsTextarea label="Purchase Confirmation" value={form.confirmation} onChange={(val) => handleChange('confirmation', val)} placeholder="e.g., Feel the burn! That's another rep for your wallet." />
                        <SettingsTextarea label="Dashboard Message" value={form.dashboardMessage} onChange={(val) => handleChange('dashboardMessage', val)} placeholder="e.g., No pain, no gain! Check out those numbers!" />
                    </div>
                    <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md">Save Personality</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
