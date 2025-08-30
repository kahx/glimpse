/**
 * Constants for NativeWind
 * Only brand colors and video-specific constants
 * NativeWind handles spacing, typography, and component styling
 */

// Export brand colors for NativeWind theme extension
export { brandColors, Colors, videoColors } from './Colors';

// App constants that aren't covered by NativeWind
export const appConstants = {
  name: 'glimpse',
  version: '1.0.0',
  
  // Video-specific constants
  video: {
    maxDurationSeconds: 5,
    thumbnailSize: 120,
    aspectRatio: 16 / 9,
  },
  
  // Touch targets (44pt minimum for accessibility)
  touchTarget: {
    minimum: 44,
    small: 44,
    medium: 48,
    large: 56,
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
} as const;
