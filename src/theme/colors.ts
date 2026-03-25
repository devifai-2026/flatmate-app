/**
 * Flatmate Design System — Color Palette
 * Mirrors the web brand identity (flatmate-web/src/index.css)
 */

export const colors = {
  // ── Brand ────────────────────────────────────────────────
  primary: '#FF1351',
  primaryDark: '#D9103F',
  primaryLight: '#FF4D7A',
  primarySubtle: 'rgba(255, 19, 81, 0.08)',

  // ── Surface / Background ─────────────────────────────────
  surface: '#FDF8F4',       // Warm cream — app background
  surfaceDark: '#F5EDE6',   // Slightly deeper warm tone
  surfaceCard: '#FFFFFF',   // Card backgrounds
  surfaceInput: '#F8F4F0',  // Input field backgrounds

  // ── Text ─────────────────────────────────────────────────
  dark: '#2D2D2D',          // Primary text
  muted: '#7A7A7A',         // Secondary / placeholder text
  subtle: '#A8A09A',        // Tertiary / disabled text
  inverse: '#FFFFFF',       // Text on dark backgrounds

  // ── Borders ──────────────────────────────────────────────
  border: '#EDE5DC',
  borderLight: '#F5EDE6',
  borderFocus: '#FF1351',

  // ── Semantic ─────────────────────────────────────────────
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.10)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.10)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.10)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.10)',

  // ── Neutrals ─────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAF9',
  gray100: '#F5F0EB',
  gray200: '#EDE5DC',
  gray300: '#D6CAC0',
  gray400: '#B8A99A',
  gray500: '#7A7A7A',
  gray600: '#5A5A5A',
  gray700: '#3D3D3D',
  gray800: '#2D2D2D',
  gray900: '#1A1A1A',

  // ── Overlays ─────────────────────────────────────────────
  overlayLight: 'rgba(255, 255, 255, 0.70)',
  overlayDark: 'rgba(45, 45, 45, 0.55)',
  overlayBlack: 'rgba(0, 0, 0, 0.40)',

  // ── Gradients (used as array tuples for LinearGradient) ──
  gradients: {
    primary: ['#FF1351', '#FF4D7A'] as [string, string],
    primaryDeep: ['#D9103F', '#FF1351'] as [string, string],
    surface: ['#FDF8F4', '#F5EDE6'] as [string, string],
    card: ['#FFFFFF', '#FDF8F4'] as [string, string],
    dark: ['#2D2D2D', '#1A1A1A'] as [string, string],
    hero: ['#FF1351', '#D9103F', '#FF4D7A'] as unknown as [string, string],
    shimmer: ['#F5EDE6', '#FDF8F4', '#F5EDE6'] as [string, string],
  },

  // ── Tab Bar ──────────────────────────────────────────────
  tabActive: '#FF1351',
  tabInactive: '#B8A99A',
  tabBackground: '#FFFFFF',
} as const;

export type ColorKey = keyof typeof colors;
