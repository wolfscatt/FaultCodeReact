/**
 * Feature Flags Configuration
 * Controls app behavior for development and production
 */

// Environment-based feature flags
export const FEATURE_FLAGS = {
  // Mock data fallback (only for read-only public data like brands/faults)
  USE_MOCK_FALLBACK: process.env.NODE_ENV === 'development' && process.env.USE_MOCK_FALLBACK === 'true',
  
  // Debug logging (dev only)
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development',
  
  // Analytics (disabled in tests)
  ENABLE_ANALYTICS: process.env.NODE_ENV !== 'test',
} as const;

/**
 * Check if mock fallback is enabled
 * This should ONLY be used for read-only public data (brands, faults)
 * NEVER for user-specific data (favorites, user data, etc.)
 */
export const shouldUseMockFallback = (): boolean => {
  return FEATURE_FLAGS.USE_MOCK_FALLBACK;
};

/**
 * Check if debug logging is enabled
 */
export const shouldLogDebug = (): boolean => {
  return FEATURE_FLAGS.ENABLE_DEBUG_LOGS;
};

/**
 * Check if analytics is enabled
 */
export const shouldTrackAnalytics = (): boolean => {
  return FEATURE_FLAGS.ENABLE_ANALYTICS;
};
