// Shared canvas-game color/font tokens, read live from the site's real
// CSS custom properties (src/app/globals.css) rather than hardcoded hex.
export interface GameTokens {
  text: string;
  bg: string;
  faint: string;
  faintStrong: string;
  accent: string;
  fontFamily: string;
}

function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function readGameTokens(): GameTokens {
  const root = getComputedStyle(document.documentElement);
  const text = root.getPropertyValue('--text-color').trim() || '#1A1A1A';
  const bg = root.getPropertyValue('--bg-color').trim() || '#F5F5F3';
  const accent = root.getPropertyValue('--accent-color').trim() || '#FFA500';
  const fontFamily = root.getPropertyValue('--font-mono').trim() || "'JetBrains Mono', monospace";
  // Site convention: "grays" are the text color at low opacity, not distinct
  // hex values. Match the exact opacity values already used for every
  // border/divider site-wide (see DesignGrid/DevelopmentGrid/Footer: 0.1 | 0.2).
  const rgb = hexToRgb(text);
  return {
    text,
    bg,
    faint: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : 'rgba(26,26,26,0.1)',
    faintStrong: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` : 'rgba(26,26,26,0.2)',
    accent,
    fontFamily,
  };
}

// Whether a game's RAF loop should currently be running.
export interface RunGate {
  visible: boolean;
  active: boolean;
}
