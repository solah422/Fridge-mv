import { createSlice, PayloadAction, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '..';
import { Theme } from '../../App';
import { api } from '../../services/apiService';

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
  defaultTheme: Theme;
  defaultWallpaper: string | null;
  userTheme: Theme | null;
  userWallpaper: string | null;
  isOnline: boolean;
  forecastingSettings: ForecastingSettings;
  creditSettings: CreditSettings;
  companyLogo: string | null;
  showWelcomePanel: boolean;
  materialYouSeedColor: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AppState = {
  activeView: 'dashboard',
  defaultTheme: 'dark',
  defaultWallpaper: null,
  userTheme: null,
  userWallpaper: null,
  isOnline: navigator.onLine,
  forecastingSettings: { lookbackDays: 30, reorderThresholdDays: 7 },
  creditSettings: { defaultCreditLimit: 500, creditLimitIncreaseCap: 5000 },
  companyLogo: null,
  showWelcomePanel: false,
  materialYouSeedColor: '#6750A4',
  status: 'idle',
};

// --- Async Thunks for API interaction ---

export const fetchAppSettings = createAsyncThunk('app/fetchAppSettings', async () => {
    return await api.get<any>('/settings');
});

export const saveUserTheme = createAsyncThunk('app/saveUserTheme', async (theme: Theme) => {
    await api.post('/settings', { key: 'userTheme', value: theme });
    return theme;
});

export const saveUserWallpaper = createAsyncThunk('app/saveUserWallpaper', async (wallpaper: string | null) => {
    await api.post('/settings', { key: 'userWallpaper', value: wallpaper });
    return wallpaper;
});

export const saveDefaultThemeAndWallpaper = createAsyncThunk('app/saveDefaultThemeAndWallpaper', async (payload: { theme: Theme, wallpaper: string | null }) => {
    await api.post('/settings', { key: 'defaultThemeAndWallpaper', value: payload });
    return payload;
});

export const saveForecastingSettings = createAsyncThunk('app/saveForecastingSettings', async (settings: Partial<ForecastingSettings>, {getState}) => {
    const state = getState() as RootState;
    const newSettings = { ...state.app.forecastingSettings, ...settings };
    await api.post('/settings', { key: 'forecastingSettings', value: newSettings });
    return newSettings;
});

export const saveCreditSettings = createAsyncThunk('app/saveCreditSettings', async (settings: Partial<CreditSettings>, {getState}) => {
    const state = getState() as RootState;
    const newSettings = { ...state.app.creditSettings, ...settings };
    await api.post('/settings', { key: 'creditSettings', value: newSettings });
    return newSettings;
});

export const saveCompanyLogo = createAsyncThunk('app/saveCompanyLogo', async (logo: string | null) => {
    await api.post('/settings', { key: 'companyLogo', value: logo });
    return logo;
});

export const saveMaterialYouSeedColor = createAsyncThunk('app/saveMaterialYouSeedColor', async (color: string) => {
    await api.post('/settings', { key: 'materialYouSeedColor', value: color });
    return color;
});

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveView(state, action: PayloadAction<View>) {
      state.activeView = action.payload;
    },
    setOnlineStatus(state, action: PayloadAction<boolean>) {
        state.isOnline = action.payload;
    },
    setShowWelcomePanel(state, action: PayloadAction<boolean>) {
      state.showWelcomePanel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchAppSettings.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(fetchAppSettings.fulfilled, (state, action) => {
            const settings = action.payload;
            state.defaultTheme = settings.defaultTheme ?? initialState.defaultTheme;
            state.userTheme = settings.userTheme ?? initialState.userTheme;
            state.defaultWallpaper = settings.defaultWallpaper ?? initialState.defaultWallpaper;
            state.userWallpaper = settings.userWallpaper ?? initialState.userWallpaper;
            state.forecastingSettings = settings.forecastingSettings ?? initialState.forecastingSettings;
            state.creditSettings = settings.creditSettings ?? initialState.creditSettings;
            state.companyLogo = settings.companyLogo ?? initialState.companyLogo;
            state.materialYouSeedColor = settings.materialYouSeedColor ?? initialState.materialYouSeedColor;
            state.status = 'succeeded';
        })
        .addCase(fetchAppSettings.rejected, (state) => {
            state.status = 'failed';
        })
        .addCase(saveUserTheme.fulfilled, (state, action) => {
            state.userTheme = action.payload;
        })
        .addCase(saveUserWallpaper.fulfilled, (state, action) => {
            state.userWallpaper = action.payload;
        })
        .addCase(saveDefaultThemeAndWallpaper.fulfilled, (state, action) => {
            state.defaultTheme = action.payload.theme;
            state.defaultWallpaper = action.payload.wallpaper;
        })
        .addCase(saveForecastingSettings.fulfilled, (state, action) => {
            state.forecastingSettings = action.payload;
        })
        .addCase(saveCreditSettings.fulfilled, (state, action) => {
            state.creditSettings = action.payload;
        })
        .addCase(saveCompanyLogo.fulfilled, (state, action) => {
            state.companyLogo = action.payload;
        })
        .addCase(saveMaterialYouSeedColor.fulfilled, (state, action) => {
            state.materialYouSeedColor = action.payload;
        });
  }
});

export const { 
    setActiveView, 
    setOnlineStatus, 
    setShowWelcomePanel, 
} = appSlice.actions;

// Rename old setters to avoid confusion, they are now async thunks
export {
    saveUserTheme as setUserTheme,
    saveUserWallpaper as setUserWallpaper,
    saveDefaultThemeAndWallpaper as setDefaultThemeAndWallpaper,
    saveForecastingSettings as setForecastingSettings,
    saveCreditSettings as setCreditSettings,
    saveCompanyLogo as setCompanyLogo,
    saveMaterialYouSeedColor as setMaterialYouSeedColor
};

export const selectActiveView = (state: RootState) => state.app.activeView;
export const selectAppStatus = (state: RootState) => state.app.status;
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