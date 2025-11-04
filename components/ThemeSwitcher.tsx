import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../App';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeIcon: React.FC<{ theme: Theme; className?: string }> = ({ theme, className = "h-6 w-6" }) => {
    switch (theme) {
        case 'light':
            return <span className={className}>☀️</span>;
        case 'dark':
            return <span className={className}>🌙</span>;
        case 'glassmorphism':
            return <span className={className}>🔮</span>;
        case 'redbox':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={`${className} text-red-500`} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4z" />
                </svg>
            );
        case 'amoled':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
                </svg>
            );
        default:
            return null;
    }
};

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };
  
  // Fix: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const themes: { id: Theme; label: string; icon: React.ReactElement }[] = [
    { id: 'light', label: 'Light', icon: <ThemeIcon theme="light" className="h-5 w-5" /> },
    { id: 'dark', label: 'Dark', icon: <ThemeIcon theme="dark" className="h-5 w-5" /> },
    { id: 'glassmorphism', label: 'Glass', icon: <ThemeIcon theme="glassmorphism" className="h-5 w-5" /> },
    { id: 'redbox', label: 'Redbox', icon: <ThemeIcon theme="redbox" className="h-5 w-5" /> },
    { id: 'amoled', label: 'Amoled', icon: <ThemeIcon theme="amoled" className="h-5 w-5" /> },
  ];

  return (
    <div className="relative" ref={wrapperRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-[rgb(var(--color-bg-subtle))] transition-colors">
        <ThemeIcon theme={theme} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-bg-card))] rounded-md shadow-lg py-1 z-50 border border-[rgb(var(--color-border))]">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTheme(t.id)}
              className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${
                theme === t.id
                  ? 'bg-[rgb(var(--color-primary-light)_/_0.5)] text-[rgb(var(--color-primary-text-on-light))]'
                  : 'text-[rgb(var(--color-text-base))] hover:bg-[rgb(var(--color-bg-subtle))]'
              }`}
            >
              <span className="mr-3">{t.icon}</span>
              {t.label}
              {theme === t.id && (
                <span className="ml-auto text-[rgb(var(--color-primary))]">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;