/**
 * Start.io (StartApp) Native Bridge
 * JavaScript bridge for Start.io native SDK
 */

import {NativeModules, requireNativeComponent, Platform} from 'react-native';

// Native module interface
interface StartIOAdModule {
  initialize(appId: string): Promise<void>;
  loadInterstitial(): Promise<void>;
  showInterstitial(): Promise<void>;
}

// Banner view props
export interface StartIOBannerViewProps {
  style?: any;
}

// Get native module (Android only)
const StartIOAdModule: StartIOAdModule | null =
  Platform.OS === 'android' ? NativeModules.StartIOAdModule : null;

/**
 * Initialize Start.io SDK
 * @param appId - Start.io Application ID
 */
export async function initStartIO(appId: string): Promise<void> {
  if (Platform.OS !== 'android') {
    console.log('[StartIO] iOS not supported, skipping initialization');
    return;
  }

  if (!StartIOAdModule) {
    throw new Error('StartIOAdModule not available');
  }

  try {
    await StartIOAdModule.initialize(appId);
    console.log('[StartIO] SDK initialized successfully');
  } catch (error) {
    console.error('[StartIO] Failed to initialize SDK:', error);
    throw error;
  }
}

/**
 * Load an interstitial ad
 */
export async function loadInterstitial(): Promise<void> {
  if (Platform.OS !== 'android') {
    console.log('[StartIO] iOS not supported, skipping loadInterstitial');
    return;
  }

  if (!StartIOAdModule) {
    throw new Error('StartIOAdModule not available');
  }

  try {
    await StartIOAdModule.loadInterstitial();
    console.log('[StartIO] Interstitial ad loaded successfully');
  } catch (error) {
    console.error('[StartIO] Failed to load interstitial ad:', error);
    throw error;
  }
}

/**
 * Show an interstitial ad
 */
export async function showInterstitial(): Promise<void> {
  if (Platform.OS !== 'android') {
    console.log('[StartIO] iOS not supported, skipping showInterstitial');
    return;
  }

  if (!StartIOAdModule) {
    throw new Error('StartIOAdModule not available');
  }

  try {
    await StartIOAdModule.showInterstitial();
    console.log('[StartIO] Interstitial ad shown successfully');
  } catch (error) {
    console.error('[StartIO] Failed to show interstitial ad:', error);
    throw error;
  }
}

/**
 * Native banner view component
 * Use this component to display banner ads
 */
export const StartIOBannerNative = Platform.OS === 'android'
  ? requireNativeComponent<StartIOBannerViewProps>('StartIOBannerView')
  : null;
