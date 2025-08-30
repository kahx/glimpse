/**
 * Video Diary App - Brand Colors for NativeWind
 * Custom brand colors to extend NativeWind's default palette
 * Also includes backward compatibility for existing themed components
 */

// Brand Colors for NativeWind theme extension
export const brandColors = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main brand color
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Secondary brand color
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
    950: '#3B0764',
  },
};

// Video-specific colors (not available in standard Tailwind)
export const videoColors = {
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  scrubberThumb: brandColors.primary[500],
  scrubberThumbDark: brandColors.primary[400],
};

// Backward compatibility for existing themed components
// This maintains the old Colors structure for useThemeColor hook
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: brandColors.primary[500],
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: brandColors.primary[500],
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: brandColors.primary[400],
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: brandColors.primary[400],
  },
};

