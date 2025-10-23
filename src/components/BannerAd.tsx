/**
 * BannerAd Component
 * Displays Google AdMob banner ads for free users only
 * TEMPORARILY DISABLED - Using mock component due to Kotlin compatibility issues
 */

import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
// import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {useUserStore} from '@state/useUserStore';
// import {AD_UNIT_IDS} from '../services/AdManager';

interface BannerAdProps {
  style?: any;
  size?: any; // Temporarily changed from BannerAdSize
}

export default function BannerAdComponent({style, size}: BannerAdProps) {
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

  // TEMPORARY MOCK COMPONENT - Replace with real AdMob when Kotlin issues are resolved
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mockAd}>
        <Text style={styles.mockAdText}>Ad Space (Mock)</Text>
        <Text style={styles.mockAdSubtext}>AdMob temporarily disabled</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockAd: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    width: '100%',
  },
  mockAdText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  mockAdSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
