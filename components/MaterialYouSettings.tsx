import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setMaterialYouSeedColor, selectMaterialYouSeedColor } from '../store/slices/appSlice';

const DEFAULT_SEED_COLOR = '#6750A4'; // Material Design default purple

export const MaterialYouSettings: React.FC = () => {
    const dispatch = useAppDispatch();
    const seedColor = useAppSelector(selectMaterialYouSeedColor);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setMaterialYouSeedColor(e.target.value));
    };
    
    const handleReset = () => {
        dispatch(setMaterialYouSeedColor(DEFAULT_SEED_COLOR));
    };

    return (
        <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
            <p className="font-medium text-[rgb(var(--color-text-base))]">Theme Customization</p>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-3">Choose a seed color to dynamically theme the entire application.</p>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <label 
                        htmlFor="seed-color-picker" 
                        className="block w-10 h-10 rounded-full border-2 border-[rgb(var(--color-border))] cursor-pointer"
                        style={{ backgroundColor: seedColor }}
                        title="Select seed color"
                    ></label>
                    <input 
                        id="seed-color-picker"
                        type="color" 
                        value={seedColor}
                        onChange={handleColorChange}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <div className="flex-grow">
                     <p className="text-sm font-medium text-[rgb(var(--color-text-muted))]">Current Seed Color</p>
                     <p className="font-mono font-semibold text-lg">{seedColor.toUpperCase()}</p>
                </div>
                <button 
                    onClick={handleReset} 
                    className="px-4 py-2 text-sm font-semibold bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition"
                >
                    Reset to Default
                </button>
            </div>
        </div>
    );
};
