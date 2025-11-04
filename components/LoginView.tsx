import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, selectAuthError, clearAuthError, registerCustomer, requestPasswordReset } from '../store/slices/authSlice';

type View = 'login' | 'activate' | 'forgot' | 'forgotSuccess';

const ViewContainer: React.FC<{ isVisible: boolean; children: React.ReactNode }> = ({ isVisible, children }) => (
  <div
    className={`w-full transition-opacity duration-500 ease-in-out ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none absolute top-0 left-0'
    }`}
  >
    {children}
  </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <input
      {...props}
      className="appearance-none relative block w-full px-3 py-3 border rounded-md focus:outline-none focus:z-10 sm:text-sm bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.3)] text-gray-100 placeholder-gray-400 focus:bg-[rgba(255,255,255,0.2)] focus:border-[rgba(255,255,255,0.6)]"
    />
  </div>
);

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button
        {...props}
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-slate-800 bg-white/90 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white disabled:opacity-50 transition-colors"
    >
        {children}
    </button>
);

const SecondaryLink: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onClick();
    };
    return (
        <a href="#" onClick={handleClick} className={`font-medium text-white underline opacity-80 hover:opacity-100 transition-opacity ${className || ''}`}>
            {children}
        </a>
    );
};

const LoginForm: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const dispatch = useAppDispatch();
    const authError = useAppSelector(selectAuthError);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        dispatch(clearAuthError());
        dispatch(login({ username, password })).finally(() => {
            setIsLoading(false);
        });
    };
    
    return (
        <form className="space-y-6" onSubmit={handleLogin}>
            <h2 className="text-3xl font-bold text-center text-white">Welcome</h2>
            <div className="space-y-4">
                <InputField label="Redbox ID" id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Customer ID or Username" />
                <InputField label="Password" id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            {authError && <p className="text-sm text-center text-red-300">{authError}</p>}
            <PrimaryButton type="submit" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</PrimaryButton>
            <div className="text-center mt-5 text-sm">
                <SecondaryLink onClick={() => setView('activate')} className="mx-2.5">Activate Your Account</SecondaryLink>
                <SecondaryLink onClick={() => setView('forgot')} className="mx-2.5">Forgot Password?</SecondaryLink>
            </div>
        </form>
    );
};

const ActivateForm: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const dispatch = useAppDispatch();
    const [formState, setFormState] = useState({ redboxId: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleActivate = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formState.password !== formState.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setIsLoading(true);
        dispatch(registerCustomer({ redboxId: formState.redboxId, password: formState.password }))
            .unwrap()
            .catch((err) => { setError(err); })
            .finally(() => { setIsLoading(false); });
    };

    return (
        <form className="space-y-6" onSubmit={handleActivate}>
            <h2 className="text-3xl font-bold text-center text-white">Activate Account</h2>
            <p className="text-sm text-center text-gray-300">Enter your assigned Redbox ID to link and activate your account.</p>
            <div className="space-y-4">
                <InputField label="Redbox ID" name="redboxId" type="number" value={formState.redboxId} onChange={handleInputChange} required placeholder="Enter your ID" />
                <InputField label="Create Password" name="password" type="password" value={formState.password} onChange={handleInputChange} required placeholder="••••••••" />
                <InputField label="Confirm Password" name="confirmPassword" type="password" value={formState.confirmPassword} onChange={handleInputChange} required placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-center text-red-300">{error}</p>}
            <PrimaryButton type="submit" disabled={isLoading}>{isLoading ? 'Activating...' : 'Activate & Login'}</PrimaryButton>
            <div className="text-center text-sm"><SecondaryLink onClick={() => setView('login')}>Back to Login</SecondaryLink></div>
        </form>
    );
};

const ForgotForm: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const dispatch = useAppDispatch();
    const [identifier, setIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestReset = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        dispatch(requestPasswordReset(identifier)).unwrap().then(() => setView('forgotSuccess')).finally(() => setIsLoading(false));
    };

    return (
        <form className="space-y-6" onSubmit={handleRequestReset}>
            <h2 className="text-3xl font-bold text-center text-white">Password Reset</h2>
            <p className="text-sm text-center text-gray-300">Enter your Redbox ID. An alert will be sent to the administrator to approve your reset. Admins/Finance must contact an administrator directly.</p>
            <InputField label="Redbox ID" name="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required placeholder="Enter your ID" />
            <PrimaryButton type="submit" disabled={isLoading}>{isLoading ? 'Sending...' : 'Request Reset'}</PrimaryButton>
            <div className="text-center text-sm"><SecondaryLink onClick={() => setView('login')}>Back to Login</SecondaryLink></div>
        </form>
    );
};

const ForgotSuccess: React.FC<{ setView: (view: View) => void }> = ({ setView }) => (
    <div className="space-y-6 text-center">
        <h2 className="text-3xl font-bold text-white">Request Sent!</h2>
        <p className="text-sm text-gray-300">An alert has been sent to the administrator. They will contact you shortly to confirm your password has been reset, allowing you to activate your account again.</p>
        <SecondaryLink onClick={() => setView('login')}>Back to Login</SecondaryLink>
    </div>
);

export const LoginView: React.FC = () => {
    const [view, setView] = useState<View>('login');
    const panelRef = React.useRef<HTMLDivElement>(null);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen font-sans text-white p-4 overflow-hidden">
            <h1 className="text-5xl font-bold mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                Fridge MV
            </h1>

            <div
                className="w-full max-w-md rounded-2xl transition-all duration-500 ease-in-out"
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                }}
            >
                <div ref={panelRef} className="p-8 relative">
                    <ViewContainer isVisible={view === 'login'}><LoginForm setView={setView} /></ViewContainer>
                    <ViewContainer isVisible={view === 'activate'}><ActivateForm setView={setView} /></ViewContainer>
                    <ViewContainer isVisible={view === 'forgot'}><ForgotForm setView={setView} /></ViewContainer>
                    <ViewContainer isVisible={view === 'forgotSuccess'}><ForgotSuccess setView={setView} /></ViewContainer>
                </div>
            </div>
            
            <div className="absolute bottom-4 text-xs text-white/50">
                v15.0.0
            </div>
        </div>
    );
};