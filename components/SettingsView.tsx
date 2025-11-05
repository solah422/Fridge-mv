import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUserTheme, setForecastingSettings, selectForecastingSettings, setCreditSettings, selectCreditSettings, setCompanyLogo, selectCompanyLogo, ForecastingSettings as TForecastingSettings, CreditSettings as TCreditSettings, selectActiveWallpaper, setUserWallpaper, selectActiveTheme } from '../store/slices/appSlice';
import ThemeSwitcher from './ThemeSwitcher';
import { Theme } from '../App';
import { GiftCardView } from './GiftCardView';
import { PromotionsView } from './PromotionsView';
import { updatePassword } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { AboutPanel } from './AboutPanel';
import { MaterialYouSettings } from './MaterialYouSettings';
import { WallpaperGallery } from './WallpaperGallery';
import { ChaosAndFunView } from './ChaosAndFunView';
import { DefaultThemeSettings } from './DefaultThemeSettings';
import { selectUser } from '../store/slices/authSlice';


const APP_VERSION = '16.0.0';

type SettingsTab = 'general' | 'gift_cards' | 'promotions' | 'chaos' | 'about';

const ForecastingSettings: React.FC<{
    settings: TForecastingSettings;
    onSettingChange: (key: 'lookbackDays' | 'reorderThresholdDays', value: string) => void;
}> = ({ settings, onSettingChange }) => {
    return (
        <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
            <p className="font-medium text-[rgb(var(--color-text-base))]">Inventory Forecasting</p>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-3">Configure how the app predicts re-order needs.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div>
                    <label htmlFor="lookback" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Sales Lookback Period (Days)</label>
                    <input 
                        type="number" 
                        id="lookback"
                        value={settings.lookbackDays} 
                        onChange={e => onSettingChange('lookbackDays', e.target.value)} 
                        className="w-full p-2 border rounded"
                        min="1"
                    />
                </div>
                 <div>
                    <label htmlFor="threshold" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Re-order Threshold (Days)</label>
                    <input 
                        type="number" 
                        id="threshold"
                        value={settings.reorderThresholdDays} 
                        onChange={e => onSettingChange('reorderThresholdDays', e.target.value)} 
                        className="w-full p-2 border rounded"
                        min="1"
                    />
                </div>
            </div>
        </div>
    );
};

const CreditManagementSettings: React.FC<{
    settings: TCreditSettings;
    onSettingChange: (key: 'defaultCreditLimit' | 'creditLimitIncreaseCap', value: string) => void;
}> = ({ settings, onSettingChange }) => {
    return (
        <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
            <p className="font-medium text-[rgb(var(--color-text-base))]">Credit Management</p>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-3">Configure customer credit limits and policies.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div>
                    <label htmlFor="defaultLimit" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Default Credit Limit (MVR)</label>
                    <input 
                        type="number" 
                        id="defaultLimit"
                        value={settings.defaultCreditLimit} 
                        onChange={e => onSettingChange('defaultCreditLimit', e.target.value)} 
                        className="w-full p-2 border rounded"
                        min="0"
                    />
                </div>
                 <div>
                    <label htmlFor="limitCap" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Auto-Increase Cap (MVR)</label>
                    <input 
                        type="number" 
                        id="limitCap"
                        value={settings.creditLimitIncreaseCap} 
                        onChange={e => onSettingChange('creditLimitIncreaseCap', e.target.value)} 
                        className="w-full p-2 border rounded"
                        min="0"
                    />
                </div>
            </div>
        </div>
    );
};


const AdminSecuritySettings: React.FC = () => {
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
        dispatch(updatePassword({ currentPassword, newPassword }))
            .unwrap()
            .then(() => {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            })
            .catch((error) => {
                setMessage({ type: 'error', text: error.message || error });
            });
    };
    
    return (
        <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
            <p className="font-medium text-[rgb(var(--color-text-base))]">Admin Security</p>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-3">Change your admin password.</p>
            <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
                <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border rounded"/>
                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded"/>
                <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded"/>
                {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
                <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))]">Update Password</button>
            </form>
        </div>
    );
};

const BrandingSettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const logo = useAppSelector(selectCompanyLogo);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                dispatch(setCompanyLogo(reader.result as string));
                dispatch(addNotification({ type: 'success', message: 'Logo updated successfully.' }));
            };
            reader.onerror = () => {
                dispatch(addNotification({ type: 'error', message: 'Error reading logo file.' }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        dispatch(setCompanyLogo(null));
        dispatch(addNotification({ type: 'info', message: 'Logo removed.' }));
    };

    return (
        <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
            <p className="font-medium text-[rgb(var(--color-text-base))]">Company Logo</p>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Upload a logo to display on invoices and other documents.</p>
            <div className="flex items-center gap-6 mt-4">
                {logo ? (
                    <img src={logo} alt="Company Logo" className="h-16 w-auto max-w-[200px] object-contain bg-[rgb(var(--color-bg-card))] p-2 rounded-md border border-[rgb(var(--color-border))]" />
                ) : (
                    <div className="h-16 w-32 bg-[rgb(var(--color-bg-card))] border border-dashed border-[rgb(var(--color-border))] rounded-md flex items-center justify-center">
                        <span className="text-xs text-[rgb(var(--color-text-subtle))]">No Logo</span>
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <input type="file" id="logo-upload" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                    <label htmlFor="logo-upload" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] text-sm font-semibold rounded-md hover:bg-[rgb(var(--color-primary-hover))] cursor-pointer text-center">
                        Upload Logo
                    </label>
                    {logo && (
                        <button onClick={handleRemoveLogo} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 text-sm font-semibold rounded-md hover:bg-red-200 dark:hover:bg-red-900/80">
                            Remove
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const SettingsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const theme = useAppSelector(selectActiveTheme);
  const reduxForecastingSettings = useAppSelector(selectForecastingSettings);
  const reduxCreditSettings = useAppSelector(selectCreditSettings);
  const activeWallpaper = useAppSelector(selectActiveWallpaper);
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  
  // Local state for settings forms
  const [localForecastingSettings, setLocalForecastingSettings] = useState(reduxForecastingSettings);
  const [localCreditSettings, setLocalCreditSettings] = useState(reduxCreditSettings);

  useEffect(() => {
    setLocalForecastingSettings(reduxForecastingSettings);
    setLocalCreditSettings(reduxCreditSettings);
  }, [reduxForecastingSettings, reduxCreditSettings]);

  const handleForecastingChange = (key: keyof TForecastingSettings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setLocalForecastingSettings(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleCreditChange = (key: keyof TCreditSettings, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalCreditSettings(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(localForecastingSettings) !== JSON.stringify(reduxForecastingSettings) ||
           JSON.stringify(localCreditSettings) !== JSON.stringify(reduxCreditSettings);
  }, [localForecastingSettings, reduxForecastingSettings, localCreditSettings, reduxCreditSettings]);

  const handleSaveChanges = () => {
    dispatch(setForecastingSettings(localForecastingSettings));
    dispatch(setCreditSettings(localCreditSettings));
    dispatch(addNotification({ type: 'success', message: 'Settings saved successfully!' }));
  };

  const handleResetChanges = () => {
    setLocalForecastingSettings(reduxForecastingSettings);
    setLocalCreditSettings(reduxCreditSettings);
  };

  const handleSetTheme = (newTheme: Theme) => {
    dispatch(setUserTheme(newTheme));
  };

  const TabButton: React.FC<{ tab: SettingsTab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-2 font-medium text-sm rounded-md transition-colors ${activeTab === tab ? 'bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-text-on-light))]' : 'hover:bg-[rgb(var(--color-bg-subtle))]'}`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-[rgb(var(--color-text-base))] mb-4">Settings</h2>
        
        <div className="flex space-x-2 border-b border-[rgb(var(--color-border-subtle))] mb-6">
          <TabButton tab="general" label="General" />
          <TabButton tab="gift_cards" label="Gift Cards & Credit" />
          <TabButton tab="promotions" label="Promotions" />
          <TabButton tab="chaos" label="Chaos & Fun" />
          <TabButton tab="about" label="About" />
        </div>

        <div>
            {activeTab === 'general' && (
                <section>
                    <h3 className="text-xl font-semibold text-[rgb(var(--color-text-base))] mb-3">General Settings</h3>
                    <div className="p-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-medium text-[rgb(var(--color-text-base))]">Your App Theme</p>
                            <p className="text-sm text-[rgb(var(--color-text-muted))]">Change your personal look and feel of the application.</p>
                        </div>
                        <ThemeSwitcher theme={theme} setTheme={handleSetTheme} />
                    </div>
                    {theme === 'material-you' && <MaterialYouSettings />}
                    {theme === 'glassmorphism' && (
                        <WallpaperGallery 
                            activeWallpaper={activeWallpaper} 
                            onSelectWallpaper={(url) => dispatch(setUserWallpaper(url))} 
                        />
                    )}

                    {user?.role === 'admin' && <DefaultThemeSettings />}

                    <BrandingSettings />
                    <ForecastingSettings settings={localForecastingSettings} onSettingChange={handleForecastingChange} />
                    <CreditManagementSettings settings={localCreditSettings} onSettingChange={handleCreditChange} />
                    <AdminSecuritySettings />

                    {hasUnsavedChanges && (
                        <div className="mt-6 p-4 bg-[rgb(var(--color-primary-light))] rounded-lg flex justify-end items-center gap-4">
                            <p className="mr-auto text-sm font-semibold text-[rgb(var(--color-primary-text-on-light))]">You have unsaved changes.</p>
                            <button onClick={handleResetChanges} className="px-4 py-2 bg-white/50 rounded-md font-semibold text-sm">Reset</button>
                            <button onClick={handleSaveChanges} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md font-semibold text-sm">Save Changes</button>
                        </div>
                    )}
                </section>
            )}

            {activeTab === 'gift_cards' && <GiftCardView />}

            {activeTab === 'promotions' && <PromotionsView />}

            {activeTab === 'chaos' && <ChaosAndFunView />}

            {activeTab === 'about' && (
                <AboutPanel version={APP_VERSION} />
            )}
        </div>
        
        <footer className="mt-8 pt-4 border-t border-[rgb(var(--color-border-subtle))] text-center text-xs text-[rgb(var(--color-text-subtle))]">
            <p>Copyright © 2025 Fridge MV. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};
