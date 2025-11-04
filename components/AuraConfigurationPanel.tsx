import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAuraConfig, selectAuraConfig } from '../store/slices/appSlice';
import { AuraConfig, auraPresets, SpacingDensity, AnimationSpeed } from '../utils/auraTheme';

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void; }> = 
({ label, value, min, max, step, unit, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1 flex justify-between">
            <span>{label}</span>
            <span className="font-mono">{value}{unit}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[rgb(var(--color-border-subtle))] rounded-lg appearance-none cursor-pointer accent-[rgb(var(--color-primary))]"
        />
    </div>
);

const RadioGroup: React.FC<{ label: string; options: string[]; value: string; onChange: (value: any) => void; }> = 
({ label, options, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-2">{label}</label>
        <div className="flex items-center gap-2 rounded-lg bg-[rgb(var(--color-bg-base))] p-1">
            {options.map(opt => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={`flex-1 capitalize text-sm font-semibold py-1.5 px-2 rounded-md transition-colors ${value === opt ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))]' : 'hover:bg-[rgb(var(--color-bg-subtle))]'}`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);


export const AuraConfigurationPanel: React.FC = () => {
    const dispatch = useAppDispatch();
    const config = useAppSelector(selectAuraConfig);

    const updateConfig = (update: Partial<AuraConfig>) => {
        dispatch(setAuraConfig(update));
    };
    
    const applyPreset = (presetName: string) => {
        const preset = auraPresets[presetName];
        if (preset) {
            dispatch(setAuraConfig(preset));
        }
    };

    return (
        <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg space-y-6">
            <div>
                <p className="font-medium text-[rgb(var(--color-text-base))]">Aura Configuration</p>
                <p className="text-sm text-[rgb(var(--color-text-muted))]">Deeply customize the application's look, feel, and behavior.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-2">Style Presets</label>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(auraPresets).map(presetName => (
                        <button key={presetName} onClick={() => applyPreset(presetName)} className="px-3 py-1.5 text-xs font-semibold bg-[rgb(var(--color-border-subtle))] rounded-full hover:bg-[rgb(var(--color-border))] transition-colors">
                            {presetName}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-[rgb(var(--color-border-subtle))]">
                <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10">
                             <input type="color" value={config.seedColor} onChange={(e) => updateConfig({ seedColor: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                             <div className="w-10 h-10 rounded-full border-2 border-[rgb(var(--color-border))]" style={{ backgroundColor: config.seedColor }} />
                        </div>
                        <span className="font-mono font-semibold">{config.seedColor.toUpperCase()}</span>
                    </div>
                </div>

                <Slider label="Corner Radius" value={config.radius} min={0} max={24} step={1} unit="px" onChange={val => updateConfig({ radius: val })} />

                <Slider label="Background Transparency" value={config.transparency} min={0.1} max={1} step={0.05} unit="" onChange={val => updateConfig({ transparency: val })} />
                
                <Slider label="Background Blur" value={config.blur} min={0} max={20} step={1} unit="px" onChange={val => updateConfig({ blur: val })} />

                <RadioGroup label="Spacing Density" options={['compact', 'standard', 'spacious']} value={config.density} onChange={val => updateConfig({ density: val as SpacingDensity })} />

                <RadioGroup label="Animation Speed" options={['instant', 'fast', 'default', 'relaxed']} value={config.animation} onChange={val => updateConfig({ animation: val as AnimationSpeed })} />
            </div>
        </div>
    );
};
