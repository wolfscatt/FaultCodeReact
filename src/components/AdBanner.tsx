/**
 * AdBanner Component
 * Displays banner ads for free users on Android
 * Shows nothing for pro users or iOS
 */

import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {useUserStore} from '@state/useUserStore';
import {StartIOBannerNative} from '../services/startio/bridge';

interface AdBannerProps {
  style?: any;
}

export default function AdBanner({style}: AdBannerProps) {
  const {plan} = useUserStore();
  const isPro = plan === 'pro';

  // Don't show ads for pro users
  if (isPro) {
    return null;
  }

  // Only show banner on Android
  if (Platform.OS !== 'android') {
    return null;
  }

  // Show Start.io banner
  if (!StartIOBannerNative) {
    console.warn('[AdBanner] StartIOBannerNative not available');
    return null;
  }

  const BannerComponent = StartIOBannerNative;

  return (
    <View style={[styles.container, style]}>
      <BannerComponent style={styles.banner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    width: '100%',
    height: 60,
  },
});
