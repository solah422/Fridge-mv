import React from 'react';
import { Theme } from '../App';
import { useAppSelector } from '../store/hooks';
import { selectMaterialYouSeedColor, selectAuraConfig } from '../store/slices/appSlice';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeIcon: React.FC<{ themeId: Theme }> = ({ themeId }) => {
    const materialSeedColor = useAppSelector(selectMaterialYouSeedColor);
    const auraSeedColor = useAppSelector(selectAuraConfig).seedColor;
    
    const icons: { [key in Theme]?: React.ReactNode } = {
        light: <span className="text-lg">☀️</span>,
        dark: <span className="text-lg">🌙</span>,
        glassmorphism: <span className="text-lg">🔮</span>,
        'material-you': <span className="text-lg">🎨</span>,
        'adaptive-aura': <span className="text-lg">✨</span>,
    };
    
    const bgClasses: { [key in Theme]?: string } = {
        light: 'bg-white border',
        dark: 'bg-gray-700',
        glassmorphism: 'bg-gradient-to-br from-blue-400 to-indigo-600',
        redbox: 'bg-red-800',
        amoled: 'bg-black',
        'material-you': '', // Handled by inline style
        'adaptive-aura': '', // Handled by inline style
    };

    let style = {};
    if (themeId === 'material-you') {
        style = { backgroundColor: materialSeedColor };
    } else if (themeId === 'adaptive-aura') {
        style = { backgroundColor: auraSeedColor };
    }


    return (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center text-white ${bgClasses[themeId]}`}
          style={style}
        >
          {icons[themeId]}
        </div>
    );
}

const themes: { id: Theme; label: string; }[] = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'material-you', label: 'Material You' },
    { id: 'adaptive-aura', label: 'Aura' },
    { id: 'glassmorphism', label: 'Glass' },
    { id: 'redbox', label: 'Redbox' },
    { id: 'amoled', label: 'Amoled' },
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  return (
    <div className="flex items-center gap-3">
      {themes.map((t) => (
        <button
          key={t.id}
          title={t.label}
          onClick={() => setTheme(t.id)}
          className={`
            w-8 h-8 rounded-full p-0.5
            transform transition-transform hover:scale-110 border-border
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-subtle))] focus:ring-[rgb(var(--color-primary))]
            ${theme === t.id ? 'ring-2 ring-offset-2 ring-offset-[rgb(var(--color-bg-subtle))] ring-[rgb(var(--color-primary))]' : 'ring-1 ring-inset ring-black/10 dark:ring-white/10'}
          `}
        >
          <ThemeIcon themeId={t.id} />
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;