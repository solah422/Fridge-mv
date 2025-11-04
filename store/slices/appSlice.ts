import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import { Theme } from '../../App';
import { storageService } from '../../services/storageService'; // Simple sync storage for theme

// FIX: Added 'requests' to the View type to match its usage in App.tsx and fix type comparison errors.
type View = 'dashboard' | 'pos' | 'invoices' | 'inventory' | 'reports' | 'customers' | 'settings' | 'requests';

export interface ForecastingSettings {
  lookbackDays: number;
  reorderThresholdDays: number;
}

export interface CreditSettings {
  defaultCreditLimit: number;
  creditLimitIncreaseCap: number;
}

interface AppState {
  activeView: View;
  // NEW: Default settings controlled by admin
  defaultTheme: Theme;
  defaultWallpaper: string | null;
  // NEW: User-specific preferences
  userTheme: Theme | null;
  userWallpaper: string | null;
  isOnline: boolean;
  forecastingSettings: ForecastingSettings;
  creditSettings: CreditSettings;
  companyLogo: string | null;
  showWelcomePanel: boolean;
  materialYouSeedColor: string;
}

// Keep theme in localStorage for persistence across sessions, as it's a UI preference
const savedDefaultTheme = storageService.getItem<Theme>('defaultTheme', 'dark');
const savedDefaultWallpaper = storageService.getItem<string | null>('defaultWallpaper', null);
const savedUserTheme = storageService.getItem<Theme | null>('userTheme', null);
const savedUserWallpaper = storageService.getItem<string | null>('userWallpaper', null);

const savedForecastingSettings = storageService.getItem<ForecastingSettings>('forecastingSettings', {
  lookbackDays: 30,
  reorderThresholdDays: 7,
});
const savedCreditSettings = storageService.getItem<CreditSettings>('creditSettings', {
  defaultCreditLimit: 500,
  creditLimitIncreaseCap: 5000,
});
const savedLogo = storageService.getItem<string | null>('companyLogo', null);
const savedMaterialYouSeedColor = storageService.getItem<string>('materialYouSeedColor', '#6750A4');


const initialState: AppState = {
  activeView: 'dashboard',
  defaultTheme: savedDefaultTheme,
  defaultWallpaper: savedDefaultWallpaper,
  userTheme: savedUserTheme,
  userWallpaper: savedUserWallpaper,
  isOnline: navigator.onLine,
  forecastingSettings: savedForecastingSettings,
  creditSettings: savedCreditSettings,
  companyLogo: savedLogo,
  showWelcomePanel: false,
  materialYouSeedColor: savedMaterialYouSeedColor,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveView(state, action: PayloadAction<View>) {
      state.activeView = action.payload;
    },
    setUserTheme(state, action: PayloadAction<Theme>) {
      state.userTheme = action.payload;
      storageService.setItem('userTheme', action.payload);
    },
    setUserWallpaper(state, action: PayloadAction<string | null>) {
      state.userWallpaper = action.payload;
      storageService.setItem('userWallpaper', action.payload);
    },
    setDefaultThemeAndWallpaper(state, action: PayloadAction<{ theme: Theme, wallpaper: string | null }>) {
        state.defaultTheme = action.payload.theme;
        state.defaultWallpaper = action.payload.wallpaper;
        storageService.setItem('defaultTheme', action.payload.theme);
        storageService.setItem('defaultWallpaper', action.payload.wallpaper);
    },
    setOnlineStatus(state, action: PayloadAction<boolean>) {
        state.isOnline = action.payload;
    },
    setForecastingSettings(state, action: PayloadAction<Partial<ForecastingSettings>>) {
      state.forecastingSettings = { ...state.forecastingSettings, ...action.payload };
      storageService.setItem('forecastingSettings', state.forecastingSettings);
    },
    setCreditSettings(state, action: PayloadAction<Partial<CreditSettings>>) {
      state.creditSettings = { ...state.creditSettings, ...action.payload };
      storageService.setItem('creditSettings', state.creditSettings);
    },
    setCompanyLogo(state, action: PayloadAction<string | null>) {
      state.companyLogo = action.payload;
      storageService.setItem('companyLogo', action.payload);
    },
    setShowWelcomePanel(state, action: PayloadAction<boolean>) {
      state.showWelcomePanel = action.payload;
    },
    setMaterialYouSeedColor(state, action: PayloadAction<string>) {
        state.materialYouSeedColor = action.payload;
        storageService.setItem('materialYouSeedColor', action.payload);
    },
  },
});

export const { 
    setActiveView, 
    setUserTheme, 
    setUserWallpaper, 
    setDefaultThemeAndWallpaper,
    setOnlineStatus, 
    setForecastingSettings, 
    setCreditSettings, 
    setCompanyLogo, 
    setShowWelcomePanel, 
    setMaterialYouSeedColor
} = appSlice.actions;

export const selectActiveView = (state: RootState) => state.app.activeView;
export const selectForecastingSettings = (state: RootState) => state.app.forecastingSettings;
export const selectCreditSettings = (state: RootState) => state.app.creditSettings;
export const selectCompanyLogo = (state: RootState) => state.app.companyLogo;
export const selectMaterialYouSeedColor = (state: RootState) => state.app.materialYouSeedColor;

// New selectors for theme components
export const selectDefaultTheme = (state: RootState) => state.app.defaultTheme;
export const selectDefaultWallpaper = (state: RootState) => state.app.defaultWallpaper;
export const selectUserTheme = (state: RootState) => state.app.userTheme;
export const selectUserWallpaper = (state: RootState) => state.app.userWallpaper;

// Memoized selectors for deriving the active theme and wallpaper
export const selectActiveTheme = createSelector(
    [selectUserTheme, selectDefaultTheme],
    (userTheme, defaultTheme) => userTheme ?? defaultTheme
);

export const selectActiveWallpaper = createSelector(
    [selectUserWallpaper, selectDefaultWallpaper, selectActiveTheme],
    (userWallpaper, defaultWallpaper, activeTheme) => {
        if (activeTheme !== 'glassmorphism') {
            return null;
        }
        return userWallpaper ?? defaultWallpaper;
    }
);


export default appSlice.reducer;