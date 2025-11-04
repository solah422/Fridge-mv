import React from 'react';
import { Theme } from '../App';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const themes: { id: Theme; label: string; bgClass: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', bgClass: 'bg-white border', icon: <span className="text-lg">☀️</span> },
    { id: 'dark', label: 'Dark', bgClass: 'bg-gray-700', icon: <span className="text-lg">🌙</span> },
    { id: 'glassmorphism', label: 'Glass', bgClass: 'bg-gradient-to-br from-blue-400 to-indigo-600', icon: <span className="text-lg">🔮</span> },
    { id: 'redbox', label: 'Redbox', bgClass: 'bg-red-800', icon: null },
    { id: 'amoled', label: 'Amoled', bgClass: 'bg-black', icon: null },
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
            w-8 h-8 rounded-full flex items-center justify-center text-white
            transform transition-transform hover:scale-110 border-border
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--color-bg-subtle))] focus:ring-[rgb(var(--color-primary))]
            ${t.bgClass}
            ${theme === t.id ? 'ring-2 ring-offset-2 ring-offset-[rgb(var(--color-bg-subtle))] ring-[rgb(var(--color-primary))]' : 'ring-1 ring-inset ring-black/10 dark:ring-white/10'}
          `}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
