/**
 * Flatmate Design System — Typography
 * Font: Inter (matches web). Falls back to system-ui on device.
 * Install 'Inter' font files and register them via react-native.config.js
 * for full fidelity.
 */

export const fontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
  black: 'Inter-Black',
} as const;

/** Font size scale (matches TailwindCSS web scale) */
export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 22,
  '3xl': 26,
  '4xl': 30,
  '5xl': 36,
  '6xl': 44,
} as const;

/** Line height scale */
export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

/** Letter spacing */
export const letterSpacing = {
  tighter: -1,
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

/** Reusable text style presets */
export const textPresets = {
  // Headings
  h1: {
    fontFamily: fontFamily.black,
    fontSize: fontSize['5xl'],
    lineHeight: fontSize['5xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
  },
  h2: {
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize['4xl'],
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tighter,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    lineHeight: fontSize['3xl'] * lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h4: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    lineHeight: fontSize['2xl'] * lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h5: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.snug,
  },
  h6: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.normal,
  },

  // Body
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    lineHeight: fontSize.lg * lineHeight.relaxed,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
  bodySm: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.relaxed,
  },

  // Labels / UI text
  labelLg: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  labelSm: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },

  // Captions / overlines
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  overline: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },

  // Button text
  buttonLg: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    letterSpacing: letterSpacing.wide,
  },
  buttonSm: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    letterSpacing: letterSpacing.wide,
  },
} as const;
