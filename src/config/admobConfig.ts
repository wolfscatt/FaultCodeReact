/**
 * AdMob Configuration
 * Centralized configuration for Google Mobile Ads
 */

export interface AdMobConfig {
  // Test Ad Unit IDs (replace with real IDs in production)
  banner: string;
  interstitial: string;
  appOpen: string;
  
  // Ad settings
  requestNonPersonalizedAdsOnly: boolean;
  maxAdContentRating: 'G' | 'PG' | 'T' | 'MA';
  
  // App Open Ad settings
  appOpenAdTimeout: number; // milliseconds
}

export const adMobConfig: AdMobConfig = {
  // Test Ad Unit IDs - Replace with your real AdMob Ad Unit IDs
  banner: 'ca-app-pub-3940256099942544/6300978111', // Test banner ad unit
  interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test interstitial ad unit
  appOpen: 'ca-app-pub-3940256099942544/9257395921', // Test app open ad unit
  
  // Ad settings
  requestNonPersonalizedAdsOnly: true,
  maxAdContentRating: 'PG',
  
  // App Open Ad settings
  appOpenAdTimeout: 5000, // 5 seconds timeout
};

// Production Ad Unit IDs (uncomment and replace when ready for production)
/*
export const adMobConfig: AdMobConfig = {
  banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your real banner ad unit
  interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your real interstitial ad unit
  appOpen: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your real app open ad unit
  
  requestNonPersonalizedAdsOnly: false,
  maxAdContentRating: 'PG',
  appOpenAdTimeout: 5000,
};
*/
