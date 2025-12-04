/**
 * AdManager Service
 * Manages ad display logic for free vs pro users
 * Integrates with Start.io (StartApp) for Android
 */

import {Platform} from 'react-native';
import {useUserStore} from '@state/useUserStore';
import {initStartIO, loadInterstitial, showInterstitial} from './startio/bridge';
import {STARTIO_APP_ID} from './startio/config';

// Configuration
const INTERSTITIAL_AD_INTERVAL = 5; // Show interstitial after every N fault views

class AdManager {
  private faultViewCount = 0;
  private isInitialized = false;

  /**
   * Check if ads should be shown for the current user
   */
  private shouldShowAds(): boolean {
    const {plan} = useUserStore.getState();
    return plan === 'free';
  }

  /**
   * Initialize the ad system
   * Should be called once when the app starts
   */
  async initializeAds(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (Platform.OS === 'android') {
      try {
        await initStartIO(STARTIO_APP_ID);
        this.isInitialized = true;
        console.log('[AdManager] Ads initialized successfully');
      } catch (error) {
        console.error('[AdManager] Failed to initialize ads:', error);
        // Continue without ads if initialization fails
      }
    } else {
      // iOS: no-op implementation
      console.log('[AdManager] iOS not supported, ads disabled');
      this.isInitialized = true;
    }
  }

  /**
   * Show an interstitial ad
   * @param force - If true, show ad regardless of counter
   */
  async showInterstitialAd(force = false): Promise<void> {
    // Don't show ads for pro users
    if (!this.shouldShowAds()) {
      return;
    }

    if (Platform.OS === 'android' && this.isInitialized) {
      try {
        // Load the ad first
        await loadInterstitial();
        // Then show it
        await showInterstitial();
        console.log('[AdManager] Interstitial ad shown');
      } catch (error) {
        console.error('[AdManager] Failed to show interstitial ad:', error);
        // Silently fail - don't interrupt user experience
      }
    } else if (Platform.OS === 'ios') {
      // iOS: no-op
      console.log('[AdManager] iOS not supported, skipping interstitial');
    }
  }

  /**
   * Track a fault view and show interstitial ad if needed
   * This should be called whenever a user views a fault detail
   */
  async trackFaultView(): Promise<void> {
    // Don't track for pro users
    if (!this.shouldShowAds()) {
      return;
    }

    this.faultViewCount++;

    // Show interstitial ad after every N views
    if (this.faultViewCount >= INTERSTITIAL_AD_INTERVAL) {
      this.faultViewCount = 0; // Reset counter
      await this.showInterstitialAd();
    }
  }

  /**
   * Reset the fault view counter
   * Useful for testing or when user upgrades to pro
   */
  resetFaultViewCounter(): void {
    this.faultViewCount = 0;
  }

  /**
   * Get current fault view count (for debugging)
   */
  getFaultViewCount(): number {
    return this.faultViewCount;
  }
}

// Export singleton instance
export const adManager = new AdManager();
