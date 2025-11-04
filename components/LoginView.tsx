import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, selectAuthError, clearAuthError } from '../store/slices/authSlice';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { RegisterModal } from './RegisterModal';

export const LoginView: React.FC = () => {
    const dispatch = useAppDispatch();
    const authError = useAppSelector(selectAuthError);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        dispatch(clearAuthError());
        dispatch(login({ username, password })).finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div 
          className="flex items-center justify-center min-h-screen"
        >
            <div className="relative w-full max-w-md p-8 space-y-6 bg-[rgb(var(--color-bg-card))] rounded-xl shadow-2xl">
                <div>
                    <h1 className="text-3xl font-bold text-center text-[rgb(var(--color-text-base))]">Fridge MV</h1>
                    <p className="mt-2 text-center text-sm text-[rgb(var(--color-text-muted))]">Admin & Customer Login</p>
                </div>
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[rgb(var(--color-border))] placeholder-[rgb(var(--color-text-subtle))] text-[rgb(var(--color-text-base))] rounded-t-md focus:outline-none focus:ring-[rgb(var(--color-primary-focus-ring))] focus:border-[rgb(var(--color-primary-focus-ring))] focus:z-10 sm:text-sm bg-transparent"
                                placeholder="Username / Redbox ID"
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[rgb(var(--color-border))] placeholder-[rgb(var(--color-text-subtle))] text-[rgb(var(--color-text-base))] rounded-b-md focus:outline-none focus:ring-[rgb(var(--color-primary-focus-ring))] focus:border-[rgb(var(--color-primary-focus-ring))] focus:z-10 sm:text-sm bg-transparent"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => setIsForgotModalOpen(true)}
                                className="font-medium text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]"
                            >
                                Forgot your password?
                            </button>
                        </div>
                    </div>

                    {authError && <p className="text-sm text-center text-red-500">{authError}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[rgb(var(--color-text-on-primary))] bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-hover))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(var(--color-primary-focus-ring))] disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                 <p className="text-center text-sm text-[rgb(var(--color-text-muted))]">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="font-medium text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]"
                    >
                        Register here
                    </button>
                </p>
                <div className="absolute bottom-3 right-5 text-xs text-[rgb(var(--color-text-subtle))]">
                    v14.3.0
                </div>
            </div>

            <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
            <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
        </div>
    );
};
