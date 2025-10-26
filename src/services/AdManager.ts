/**
 * AdManager
 * Handles Google AdMob banner and interstitial ads
 * Shows ads only to free users, pro users see no ads
 */

import mobileAds, {MaxAdContentRating, InterstitialAd, AdEventType, AppOpenAd} from 'react-native-google-mobile-ads';
import {useUserStore} from '@state/useUserStore';
import {adMobConfig} from '@config/admobConfig';

// Test Ad Unit IDs (replace with real IDs in production)
export const AD_UNIT_IDS = {
  BANNER: adMobConfig.banner,
  INTERSTITIAL: adMobConfig.interstitial,
  APP_OPEN: adMobConfig.appOpen,
} as const;

/**
 * Initialize Google Mobile Ads SDK
 * Call this once when the app starts
 */
export const initializeAds = async (): Promise<void> => {
  try {
    await mobileAds().initialize();
    console.log('[AdManager] Google Mobile Ads SDK initialized');
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
export const getAdContentRating = (): MaxAdContentRating => {
  switch (adMobConfig.maxAdContentRating) {
    case 'G':
      return MaxAdContentRating.G;
    case 'PG':
      return MaxAdContentRating.PG;
    case 'T':
      return MaxAdContentRating.T;
    case 'MA':
      return MaxAdContentRating.MA;
    default:
      return MaxAdContentRating.PG;
  }
};

/**
 * Ad Manager class for managing ad state and interactions
 */
export class AdManager {
  private static instance: AdManager;
  private interstitialAd: InterstitialAd | null = null;
  private appOpenAd: AppOpenAd | null = null;
  private isInterstitialLoaded = false;
  private isAppOpenLoaded = false;
  private faultViewCount = 0;
  private readonly FAULT_VIEW_LIMIT = 5; // Show interstitial after 5 fault views

  private constructor() {
    this.loadInterstitialAd();
    this.loadAppOpenAd();
  }

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * Load interstitial ad
   */
  private async loadInterstitialAd(): Promise<void> {
    if (!shouldShowAds()) {
      return; // Don't load ads for pro users
    }

    try {
      this.interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
        requestNonPersonalizedAdsOnly: adMobConfig.requestNonPersonalizedAdsOnly,
      });

      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('[AdManager] Interstitial ad loaded');
        this.isInterstitialLoaded = true;
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('[AdManager] Interstitial ad error:', error);
        this.isInterstitialLoaded = false;
      });

      this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
        console.log('[AdManager] Interstitial ad opened');
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdManager] Interstitial ad closed');
        this.isInterstitialLoaded = false;
        // Reload ad for next time
        this.loadInterstitialAd();
      });

      this.interstitialAd.load();
    } catch (error) {
      console.error('[AdManager] Failed to create interstitial ad:', error);
    }
  }

  /**
   * Load app open ad
   */
  private async loadAppOpenAd(): Promise<void> {
    if (!shouldShowAds()) {
      return; // Don't load ads for pro users
    }

    try {
      this.appOpenAd = AppOpenAd.createForAdRequest(AD_UNIT_IDS.APP_OPEN, {
        requestNonPersonalizedAdsOnly: adMobConfig.requestNonPersonalizedAdsOnly,
      });

      this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('[AdManager] App open ad loaded');
        this.isAppOpenLoaded = true;
      });

      this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('[AdManager] App open ad error:', error);
        this.isAppOpenLoaded = false;
      });

      this.appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
        console.log('[AdManager] App open ad opened');
      });

      this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('[AdManager] App open ad closed');
        this.isAppOpenLoaded = false;
        // Reload ad for next time
        this.loadAppOpenAd();
      });

      this.appOpenAd.load();
    } catch (error) {
      console.error('[AdManager] Failed to create app open ad:', error);
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
      if (this.interstitialAd) {
        await this.interstitialAd.show();
        this.faultViewCount = 0; // Reset counter after showing ad
      }
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
   * Show app open ad
   */
  public async showAppOpenAd(): Promise<void> {
    if (!shouldShowAds()) {
      return; // Don't show ads for pro users
    }

    if (!this.isAppOpenLoaded) {
      console.log('[AdManager] App open ad not loaded yet');
      return;
    }

    try {
      if (this.appOpenAd) {
        await this.appOpenAd.show();
      }
    } catch (error) {
      console.error('[AdManager] Failed to show app open ad:', error);
    }
  }

  /**
   * Reset ad state (useful when user upgrades to pro)
   */
  public resetAdState(): void {
    this.faultViewCount = 0;
    this.isInterstitialLoaded = false;
    this.isAppOpenLoaded = false;
    if (this.interstitialAd) {
      this.interstitialAd = null;
    }
    if (this.appOpenAd) {
      this.appOpenAd = null;
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

  /**
   * Check if app open ad is loaded
   */
  public isAppOpenReady(): boolean {
    return this.isAppOpenLoaded;
  }
}

// Export singleton instance
export const adManager = AdManager.getInstance();
