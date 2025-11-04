// Simplified Material You / Monet color theming engine
// Converts a single "seed" color into a full palette of key colors and surfaces.

// --- TYPE DEFINITIONS ---
interface HSL { h: number; s: number; l: number; }
interface RGB { r: number; g: number; b: number; }
type Palette = { [key: string]: string };

// --- COLOR CONVERSION HELPERS ---

/** Converts a hex color string to an HSL object. */
const hexToHsl = (hex: string): HSL => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  
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


/** Converts an HSL color object to an RGB string for CSS variables. */
const hslToRgbString = (hsl: HSL): string => {
  const { h, s, l } = hsl;
  const sat = s / 100;
  const light = l / 100;
  
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
  else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
  else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
  else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
  else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
  else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return `${r} ${g} ${b}`;
};


// --- PALETTE GENERATION ---

/**
 * Generates a Material You-style dark theme palette from a single seed color.
 * @param seedHex The user-provided color in hex format (e.g., "#6750A4").
 * @returns An object mapping CSS variable names to their RGB string values.
 */
export const generateMaterialYouPalette = (seedHex: string): Palette => {
  const seedHsl = hexToHsl(seedHex);
  const h = seedHsl.h;

  const palette: { [key: string]: HSL } = {
    // Primary (accent) colors
    '--color-primary': { h, s: 85, l: 65 },
    '--color-primary-hover': { h, s: 85, l: 70 },
    '--color-text-on-primary': { h, s: 80, l: 15 },
    '--color-primary-light': { h, s: 70, l: 25 },
    '--color-primary-text-on-light': { h, s: 80, l: 85 },
    
    // Text colors
    '--color-text-base': { h, s: 15, l: 92 },
    '--color-text-muted': { h, s: 10, l: 65 },
    '--color-text-subtle': { h, s: 10, l: 45 },

    // Background/Surface colors
    '--color-bg-base': { h, s: 10, l: 8 },
    '--color-bg-card': { h, s: 10, l: 12 },
    '--color-bg-subtle': { h, s: 12, l: 18 },

    // Border colors
    '--color-border': { h, s: 10, l: 35 },
    '--color-border-subtle': { h, s: 10, l: 25 },
    
    // Focus ring
    '--color-primary-focus-ring': { h, s: 85, l: 75 },
  };

  const rgbPalette: Palette = {};
  for (const [key, value] of Object.entries(palette)) {
    rgbPalette[key] = hslToRgbString(value);
  }

  return rgbPalette;
};
