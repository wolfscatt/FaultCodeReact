/**
 * AdMob Configuration
 * Centralized configuration for Google Mobile Ads
 */

export interface AdMobConfig {
  // Test Ad Unit IDs (replace with real IDs in production)
  banner: string;
  interstitial: string;
  
  // Ad settings
  requestNonPersonalizedAdsOnly: boolean;
  maxAdContentRating: 'G' | 'PG' | 'T' | 'MA';
}

export const adMobConfig: AdMobConfig = {
  // Test Ad Unit IDs - Replace with your real AdMob Ad Unit IDs
  banner: 'ca-app-pub-3940256099942544/6300978111', // Test banner ad unit
  interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test interstitial ad unit
  
  // Ad settings
  requestNonPersonalizedAdsOnly: true,
  maxAdContentRating: 'PG',
};

// Production Ad Unit IDs (uncomment and replace when ready for production)
/*
export const adMobConfig: AdMobConfig = {
  banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your real banner ad unit
  interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your real interstitial ad unit
  
  requestNonPersonalizedAdsOnly: false,
  maxAdContentRating: 'PG',
};
*/
