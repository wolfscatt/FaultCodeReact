/**
 * BannerAd Component
 * Displays Google AdMob banner ads for free users only
 * 
 * Note: Using mock implementation for development/testing
 * Replace with real AdMob SDK when ready for production
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
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
      <View style={styles.mockAd}>
        <Text style={styles.mockAdText}>📱 Mock Banner Ad</Text>
        <Text style={styles.mockAdSubtext}>Ad Unit: {AD_UNIT_IDS.BANNER}</Text>
        <Text style={styles.mockAdSubtext}>Size: {bannerSize}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mockAd: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderStyle: 'dashed',
  },
  mockAdText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  mockAdSubtext: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
});
