import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setDefaultThemeAndWallpaper, selectDefaultTheme, selectDefaultWallpaper } from '../store/slices/appSlice';
import { Theme } from '../App';
import ThemeSwitcher from './ThemeSwitcher';
import { WallpaperGallery } from './WallpaperGallery';
import { addNotification } from '../store/slices/notificationsSlice';

export const DefaultThemeSettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const currentDefaultTheme = useAppSelector(selectDefaultTheme);
    const currentDefaultWallpaper = useAppSelector(selectDefaultWallpaper);

    const [selectedTheme, setSelectedTheme] = useState<Theme>(currentDefaultTheme);
    const [selectedWallpaper, setSelectedWallpaper] = useState<string | null>(currentDefaultWallpaper);

    useEffect(() => {
        setSelectedTheme(currentDefaultTheme);
        setSelectedWallpaper(currentDefaultWallpaper);
    }, [currentDefaultTheme, currentDefaultWallpaper]);

    const handleSave = () => {
        dispatch(setDefaultThemeAndWallpaper({
            theme: selectedTheme,
            wallpaper: selectedTheme === 'glassmorphism' ? selectedWallpaper : null
        }));
        dispatch(addNotification({ type: 'success', message: 'Default theme settings saved.' }));
    };

    return (
        <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
            <p className="font-medium text-[rgb(var(--color-text-base))]">Default App Theme</p>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-3">Set the default appearance for new users or users who haven't set a preference.</p>
            
            <div className="p-4 bg-[rgb(var(--color-bg-card))] rounded-md border border-[rgb(var(--color-border-subtle))]">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Default Theme</p>
                    </div>
                    <ThemeSwitcher theme={selectedTheme} setTheme={setSelectedTheme} />
                </div>

                {selectedTheme === 'glassmorphism' && (
                    <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border))]">
                         <WallpaperGallery
                            activeWallpaper={selectedWallpaper}
                            onSelectWallpaper={setSelectedWallpaper}
                        />
                    </div>
                )}
            </div>

            <div className="text-right mt-4">
                <button onClick={handleSave} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md font-semibold text-sm">
                    Set as Default
                </button>
            </div>
        </div>
    );
};
