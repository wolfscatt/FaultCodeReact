/**
 * AdManager
 * Handles Google AdMob banner and interstitial ads
 * Shows ads only to free users, pro users see no ads
 * 
 * Note: Using mock implementation for development/testing
 * Replace with real AdMob SDK when ready for production
 */

import {useUserStore} from '@state/useUserStore';
import {adMobConfig} from '@config/admobConfig';

// Test Ad Unit IDs (replace with real IDs in production)
export const AD_UNIT_IDS = {
  BANNER: adMobConfig.banner,
  INTERSTITIAL: adMobConfig.interstitial,
} as const;

/**
 * Initialize Google Mobile Ads SDK
 * Call this once when the app starts
 */
export const initializeAds = async (): Promise<void> => {
  try {
    console.log('[AdManager] Mock AdMob SDK initialized');
    console.log('[AdManager] Banner Ad Unit ID:', AD_UNIT_IDS.BANNER);
    console.log('[AdManager] Interstitial Ad Unit ID:', AD_UNIT_IDS.INTERSTITIAL);
  } catch (error) {
    console.error('[AdManager] Failed to initialize ads:', error);
  }
};

/**
 * Check if user should see ads
 * Only free users see ads, pro users see no ads
 */
export const shouldShowAds = (): boolean => {
  const {plan} = useUserStore.getState();
  return plan === 'free';
};

/**
 * Get ad content rating for child safety
 */
export const getAdContentRating = (): string => {
  return adMobConfig.maxAdContentRating;
};

/**
 * Ad Manager class for managing ad state and interactions
 */
export class AdManager {
  private static instance: AdManager;
  private isInterstitialLoaded = false;
  private faultViewCount = 0;
  private readonly FAULT_VIEW_LIMIT = 5; // Show interstitial after 5 fault views

  private constructor() {
    this.setupInterstitialAd();
  }

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * Setup interstitial ad with event listeners
   */
  private async setupInterstitialAd(): Promise<void> {
    if (!shouldShowAds()) {
      return; // Don't load ads for pro users
    }

    try {
      console.log('[AdManager] Setting up mock interstitial ad');
      this.isInterstitialLoaded = true;
    } catch (error) {
      console.error('[AdManager] Failed to setup interstitial ad:', error);
    }
  }

  /**
   * Request a new interstitial ad
   */
  private async requestNewInterstitialAd(): Promise<void> {
    if (!shouldShowAds()) {
      return; // Don't load ads for pro users
    }

    try {
      console.log('[AdManager] Requesting mock interstitial ad');
      this.isInterstitialLoaded = true;
    } catch (error) {
      console.error('[AdManager] Failed to request interstitial ad:', error);
    }
  }

  /**
   * Show interstitial ad if conditions are met
   * @param force - Force show ad regardless of view count
   */
  public async showInterstitialAd(force: boolean = false): Promise<void> {
    if (!shouldShowAds()) {
      return; // Don't show ads for pro users
    }

    if (!this.isInterstitialLoaded && !force) {
      console.log('[AdManager] Interstitial ad not loaded yet');
      return;
    }

    try {
      console.log('[AdManager] Showing mock interstitial ad');
      this.faultViewCount = 0; // Reset counter after showing ad
      
      // Simulate ad display time
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('[AdManager] Mock interstitial ad closed');
      
      // Request new ad for next time
      await this.requestNewInterstitialAd();
    } catch (error) {
      console.error('[AdManager] Failed to show interstitial ad:', error);
    }
  }

  /**
   * Track fault view and show interstitial if limit reached
   */
  public trackFaultView(): void {
    if (!shouldShowAds()) {
      return; // Don't track for pro users
    }

    this.faultViewCount++;
    console.log(`[AdManager] Fault view count: ${this.faultViewCount}`);

    if (this.faultViewCount >= this.FAULT_VIEW_LIMIT) {
      this.showInterstitialAd();
    }
  }

  /**
   * Show interstitial when user exceeds free limit
   */
  public showQuotaExceededAd(): void {
    if (shouldShowAds()) {
      this.showInterstitialAd(true);
    }
  }

  /**
   * Reset ad state (useful when user upgrades to pro)
   */
  public resetAdState(): void {
    this.faultViewCount = 0;
    this.isInterstitialLoaded = false;
  }

  /**
   * Get current fault view count
   */
  public getFaultViewCount(): number {
    return this.faultViewCount;
  }

  /**
   * Check if interstitial is loaded
   */
  public isInterstitialReady(): boolean {
    return this.isInterstitialLoaded;
  }
}

// Export singleton instance
export const adManager = AdManager.getInstance();
