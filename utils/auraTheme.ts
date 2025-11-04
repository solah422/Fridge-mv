// Adaptive Aura: A dynamic, customizable theming engine

// --- TYPE DEFINITIONS ---
interface HSL { h: number; s: number; l: number; }

export type SpacingDensity = 'compact' | 'standard' | 'spacious';
export type AnimationSpeed = 'instant' | 'fast' | 'default' | 'relaxed';

export interface AuraConfig {
  seedColor: string;
  radius: number; // 0-24px
  transparency: number; // 0-1
  blur: number; // 0-20px
  density: SpacingDensity;
  animation: AnimationSpeed;
}

// --- PRE-DEFINED PRESETS ---
export const auraPresets: { [key: string]: AuraConfig } = {
  'Default Aura': {
    seedColor: '#7c5dfa',
    radius: 12,
    transparency: 0.85,
    blur: 10,
    density: 'standard',
    animation: 'default',
  },
  'Minimalist': {
    seedColor: '#5a5a5a',
    radius: 4,
    transparency: 1,
    blur: 0,
    density: 'standard',
    animation: 'fast',
  },
  'Glassy': {
    seedColor: '#2563eb',
    radius: 16,
    transparency: 0.6,
    blur: 16,
    density: 'spacious',
    animation: 'default',
  },
   'Light Pro': {
    seedColor: '#0061a8',
    radius: 8,
    transparency: 1,
    blur: 0,
    density: 'standard',
    animation: 'fast',
  },
  'Dark Pro': {
    seedColor: '#89b3f8',
    radius: 8,
    transparency: 1,
    blur: 0,
    density: 'standard',
    animation: 'fast',
  },
};

// --- COLOR CONVERSION HELPERS ---
const hexToHsl = (hex: string): HSL => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) { [r, g, b] = [parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16), parseInt(hex[3] + hex[3], 16)]; }
  else if (hex.length === 7) { [r, g, b] = [parseInt(hex[1] + hex[2], 16), parseInt(hex[3] + hex[4], 16), parseInt(hex[5] + hex[6], 16)]; }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgbString = ({ h, s, l }: HSL): string => {
  const sat = s / 100, light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = light - c / 2;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
  else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
  else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
  else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
  else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
  else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }
  return `${Math.round((r + m) * 255)} ${Math.round((g + m) * 255)} ${Math.round((b + m) * 255)}`;
};

// --- VARIABLE GENERATION ENGINE ---
export const generateAuraVariables = (config: AuraConfig): { [key: string]: string } => {
  const { seedColor, radius, transparency, blur, density, animation } = config;
  const seedHsl = hexToHsl(seedColor);
  const h = seedHsl.h;

  // Color Palette Generation
  const colors = {
    '--aura-primary-rgb': hslToRgbString({ h, s: 85, l: 65 }),
    '--aura-primary-hover-rgb': hslToRgbString({ h, s: 85, l: 70 }),
    '--aura-text-on-primary-rgb': hslToRgbString({ h, s: 80, l: 15 }),
    '--aura-primary-light-rgb': hslToRgbString({ h, s: 70, l: 25 }),
    '--aura-text-base-rgb': hslToRgbString({ h, s: 15, l: 92 }),
    '--aura-text-muted-rgb': hslToRgbString({ h, s: 10, l: 65 }),
    '--aura-bg-base-rgb': hslToRgbString({ h, s: 10, l: 8 }),
    '--aura-bg-card-rgb': hslToRgbString({ h, s: 10, l: 12 }),
    '--aura-bg-subtle-rgb': hslToRgbString({ h, s: 12, l: 18 }),
    '--aura-border-rgb': hslToRgbString({ h, s: 10, l: 35 }),
    '--aura-border-subtle-rgb': hslToRgbString({ h, s: 10, l: 25 }),
    '--aura-focus-ring-rgb': hslToRgbString({ h, s: 85, l: 75 }),
  };

  // Spacing Density Mapping
  const spacingMap: { [key in SpacingDensity]: { [key: string]: string } } = {
    compact: { '--aura-sp-1': '0.2rem', '--aura-sp-2': '0.4rem', '--aura-sp-3': '0.6rem', '--aura-sp-4': '0.8rem', '--aura-sp-6': '1.2rem' },
    standard: { '--aura-sp-1': '0.25rem', '--aura-sp-2': '0.5rem', '--aura-sp-3': '0.75rem', '--aura-sp-4': '1rem', '--aura-sp-6': '1.5rem' },
    spacious: { '--aura-sp-1': '0.35rem', '--aura-sp-2': '0.7rem', '--aura-sp-3': '1.05rem', '--aura-sp-4': '1.4rem', '--aura-sp-6': '2.1rem' },
  };

  // Animation Speed Mapping
  const animationMap: { [key in AnimationSpeed]: string } = {
    instant: '0ms',
    fast: '150ms',
    default: '300ms',
    relaxed: '500ms',
  };

  return {
    ...colors,
    ...spacingMap[density],
    '--aura-radius': `${radius}px`,
    '--aura-bg-transparency': `${transparency}`,
    '--aura-bg-blur': `${blur}px`,
    '--aura-transition-duration': animationMap[animation],
  };
};
