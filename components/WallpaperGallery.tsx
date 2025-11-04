import React from 'react';
import { addNotification } from '../store/slices/notificationsSlice';
import { useAppDispatch } from '../store/hooks';

interface WallpaperGalleryProps {
  activeWallpaper: string | null;
  onSelectWallpaper: (url: string | null) => void;
}

const wallpapers = [
  { name: 'Default', url: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?q=80&w=2550&auto=format&fit=crop' },
  { name: 'Beach', url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=2670&auto=format&fit=crop' },
  { name: 'Forest', url: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=2670&auto=format&fit=crop' },
  { name: 'Abstract', url: 'https://images.unsplash.com/photo-1487147264018-f937fba0c817?q=80&w=2552&auto=format&fit=crop' },
  { name: 'Purple Blue', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2670&auto=format&fit=crop' },
];

export const WallpaperGallery: React.FC<WallpaperGalleryProps> = ({ activeWallpaper, onSelectWallpaper }) => {
  const dispatch = useAppDispatch();
    
  const handleSelect = (url: string | null) => {
    // Treat the default URL as a null selection to reset
    const valueToSet = url === wallpapers[0].url ? null : url;
    onSelectWallpaper(valueToSet);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        dispatch(addNotification({ type: 'error', message: 'Image size should be less than 5MB.' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        onSelectWallpaper(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
    
  return (
    <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
      <p className="font-medium text-[rgb(var(--color-text-base))]">Theme Wallpaper</p>
      <p className="text-sm text-[rgb(var(--color-text-muted))] mb-3">Choose a background for the Glassmorphism theme.</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 items-center">
        {wallpapers.map(({ name, url }) => {
          const isActive = (activeWallpaper === url) || (!activeWallpaper && name === 'Default');
          return (
            <div
              key={name}
              onClick={() => handleSelect(url)}
              className={`relative rounded-md overflow-hidden cursor-pointer aspect-video transition-all duration-200 ${isActive ? 'ring-2 ring-offset-2 ring-offset-[rgb(var(--color-bg-subtle))] ring-[rgb(var(--color-primary))]' : 'hover:scale-105'}`}
              title={name}
            >
              <img src={url} alt={name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors"></div>
            </div>
          );
        })}
        <label htmlFor="wallpaper-upload" className="relative rounded-md overflow-hidden cursor-pointer aspect-video transition-all duration-200 bg-[rgb(var(--color-bg-card))] border-2 border-dashed border-[rgb(var(--color-border))] flex flex-col items-center justify-center text-center p-2 hover:border-[rgb(var(--color-primary))]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[rgb(var(--color-text-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span className="text-xs mt-1 text-[rgb(var(--color-text-muted))]">Upload Own</span>
            <input id="wallpaper-upload" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0" onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
};