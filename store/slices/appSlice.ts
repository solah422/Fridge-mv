import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  theme: Theme;
  isOnline: boolean;
  forecastingSettings: ForecastingSettings;
  creditSettings: CreditSettings;
  companyLogo: string | null;
  showWelcomePanel: boolean;
  activeWallpaper: string | null;
  materialYouSeedColor: string;
}

// Keep theme in localStorage for persistence across sessions, as it's a UI preference
const savedTheme = storageService.getItem<Theme>('theme', 'dark');
const savedForecastingSettings = storageService.getItem<ForecastingSettings>('forecastingSettings', {
  lookbackDays: 30,
  reorderThresholdDays: 7,
});
const savedCreditSettings = storageService.getItem<CreditSettings>('creditSettings', {
  defaultCreditLimit: 500,
  creditLimitIncreaseCap: 5000,
});
const savedLogo = storageService.getItem<string | null>('companyLogo', null);
const savedWallpaper = storageService.getItem<string | null>('activeWallpaper', null);
const savedMaterialYouSeedColor = storageService.getItem<string>('materialYouSeedColor', '#6750A4');


const initialState: AppState = {
  activeView: 'dashboard',
  theme: savedTheme,
  isOnline: navigator.onLine,
  forecastingSettings: savedForecastingSettings,
  creditSettings: savedCreditSettings,
  companyLogo: savedLogo,
  showWelcomePanel: false,
  activeWallpaper: savedWallpaper,
  materialYouSeedColor: savedMaterialYouSeedColor,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveView(state, action: PayloadAction<View>) {
      state.activeView = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      storageService.setItem('theme', action.payload);
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
    setActiveWallpaper(state, action: PayloadAction<string | null>) {
      state.activeWallpaper = action.payload;
      storageService.setItem('activeWallpaper', action.payload);
    },
    setMaterialYouSeedColor(state, action: PayloadAction<string>) {
        state.materialYouSeedColor = action.payload;
        storageService.setItem('materialYouSeedColor', action.payload);
    }
  },
});

export const { setActiveView, setTheme, setOnlineStatus, setForecastingSettings, setCreditSettings, setCompanyLogo, setShowWelcomePanel, setActiveWallpaper, setMaterialYouSeedColor } = appSlice.actions;

export const selectActiveView = (state: RootState) => state.app.activeView;
export const selectForecastingSettings = (state: RootState) => state.app.forecastingSettings;
export const selectCreditSettings = (state: RootState) => state.app.creditSettings;
export const selectCompanyLogo = (state: RootState) => state.app.companyLogo;
export const selectActiveWallpaper = (state: RootState) => state.app.activeWallpaper;
export const selectMaterialYouSeedColor = (state: RootState) => state.app.materialYouSeedColor;


export default appSlice.reducer;