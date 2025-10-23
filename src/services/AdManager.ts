/**
 * AdManager
 * Handles Google AdMob banner and interstitial ads
 * Shows ads only to free users, pro users see no ads
 * TEMPORARILY DISABLED - Using mock implementation due to Kotlin compatibility issues
 */

// import mobileAds, {MaxAdContentRating} from 'react-native-google-mobile-ads';
import {useUserStore} from '@state/useUserStore';

// Test Ad Unit IDs (replace with real IDs in production)
export const AD_UNIT_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111', // Test banner ad unit
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712', // Test interstitial ad unit
} as const;

/**
 * Initialize Google Mobile Ads SDK
 * Call this once when the app starts
 * TEMPORARILY DISABLED - Mock implementation
 */
export const initializeAds = async (): Promise<void> => {
  try {
    // await mobileAds().initialize();
    console.log('[AdManager] Google Mobile Ads SDK initialization skipped (mock mode)');
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
 * TEMPORARILY DISABLED - Mock implementation
 */
export const getAdContentRating = (): any => {
  return 'PG'; // Mock return value
};

/**
 * Ad Manager class for managing ad state and interactions
 */
export class AdManager {
  private static instance: AdManager;
  private interstitialAd: any = null;
  private isInterstitialLoaded = false;
  private faultViewCount = 0;
  private readonly FAULT_VIEW_LIMIT = 5; // Show interstitial after 5 fault views

  private constructor() {
    this.loadInterstitialAd();
  }

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * Load interstitial ad
   * TEMPORARILY DISABLED - Mock implementation
   */
  private async loadInterstitialAd(): Promise<void> {
    if (!shouldShowAds()) {
      return; // Don't load ads for pro users
    }

    try {
      // Mock implementation - no real ad loading
      console.log('[AdManager] Interstitial ad loading skipped (mock mode)');
      this.isInterstitialLoaded = true; // Mock as loaded
    } catch (error) {
      console.error('[AdManager] Failed to create interstitial ad:', error);
    }
  }

  /**
   * Show interstitial ad if conditions are met
   * @param force - Force show ad regardless of view count
   * TEMPORARILY DISABLED - Mock implementation
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
      // Mock implementation - just log instead of showing real ad
      console.log('[AdManager] Interstitial ad show skipped (mock mode)');
      this.faultViewCount = 0; // Reset counter after showing ad
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
    if (this.interstitialAd) {
      this.interstitialAd = null;
    }
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
