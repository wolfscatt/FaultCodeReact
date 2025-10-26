/**
 * BannerAd Component
 * Displays Google AdMob banner ads for free users only
 */

import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {AdMobBanner} from 'react-native-admob';
import {useUserStore} from '@state/useUserStore';
import {AD_UNIT_IDS} from '../services/AdManager';

interface BannerAdProps {
  style?: any;
  bannerSize?: string;
}

export default function BannerAdComponent({style, bannerSize = 'banner'}: BannerAdProps) {
  const {plan} = useUserStore();
  const [shouldShowAd, setShouldShowAd] = useState(false);

  useEffect(() => {
    // Only show ads for free users
    setShouldShowAd(plan === 'free');
  }, [plan]);

  // Don't render anything for pro users
  if (!shouldShowAd) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <AdMobBanner
        adUnitID={AD_UNIT_IDS.BANNER}
        bannerSize={bannerSize}
        testDeviceID="EMULATOR"
        onAdLoaded={() => {
          console.log('[BannerAd] Ad loaded successfully');
        }}
        onAdFailedToLoad={(error) => {
          console.error('[BannerAd] Ad failed to load:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
