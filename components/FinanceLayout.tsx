import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { api } from '../services/apiService';
import { MandatoryPasswordChangeModal } from './MandatoryPasswordChangeModal';
import { FinanceDashboardView } from './FinanceDashboardView';
import { FinanceReportsView } from './FinanceReportsView';
import { FinanceSettingsView } from './FinanceSettingsView';

type FinanceView = 'dashboard' | 'reports' | 'settings';

export const FinanceLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const [activeView, setActiveView] = useState<FinanceView>('dashboard');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const checkPasswordStatus = async () => {
            const authData = await api.auth.fetch();
            if (!authData.financePasswordChanged) {
                setShowPasswordModal(true);
            }
        };
        checkPasswordStatus();
    }, []);

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <FinanceDashboardView />;
            case 'reports':
                return <FinanceReportsView />;
            case 'settings':
                return <FinanceSettingsView />;
            default:
                return <FinanceDashboardView />;
        }
    };

    const NavButton: React.FC<{ view: FinanceView; label: string }> = ({ view, label }) => (
        <button
            onClick={() => setActiveView(view)}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === view ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))]' : 'text-[rgb(var(--color-text-muted))] hover:bg-[rgb(var(--color-bg-subtle))]'}`}
        >
            {label}
        </button>
    );

    if (showPasswordModal) {
        return <MandatoryPasswordChangeModal onSuccess={() => setShowPasswordModal(false)} />;
    }

    return (
        <>
            <header className="bg-[rgb(var(--color-bg-card))] shadow-md sticky top-0 z-30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-base))]">Fridge MV (Finance)</h1>
                        <nav className="hidden md:flex items-center space-x-2">
                            <NavButton view="dashboard" label="Invoice Management" />
                            <NavButton view="reports" label="Financial Reports" />
                        </nav>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setActiveView('settings')} className="p-2 rounded-full hover:bg-[rgb(var(--color-bg-subtle))] transition-colors" aria-label="Open settings">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[rgb(var(--color-text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                            <button onClick={() => dispatch(logout())} className="p-2 rounded-full hover:bg-[rgb(var(--color-bg-subtle))] transition-colors" aria-label="Logout">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[rgb(var(--color-text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderView()}
            </main>
        </>
    );
};
