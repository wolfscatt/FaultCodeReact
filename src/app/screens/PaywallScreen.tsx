/**
 * PaywallScreen
 * Displays upgrade options from free to pro plan
 */

import React, {useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {RootStackScreenProps} from '../navigation/types';
import {useTranslation} from 'react-i18next';
import {useUserStore, useCanAccessContent} from '@state/useUserStore';
import {colors, spacing, typography, borderRadius, shadows} from '@theme/tokens';
import {analytics} from '@state/useAnalyticsStore';
import {adManager} from '../services/AdManager';

type Props = RootStackScreenProps<'Paywall'>;

export default function PaywallScreen({navigation}: Props) {
  const {t} = useTranslation();
  const {plan, upgradeToPro, isLoggedIn} = useUserStore();
  const {remaining, limit} = useCanAccessContent();

  // Log paywall shown event on mount
  useEffect(() => {
    analytics.paywallShown('quota_exceeded', remaining);
    // Show interstitial ad when user exceeds quota
    adManager.showQuotaExceededAd();
  }, [remaining]);

  const handleSubscribe = () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      Alert.alert(
        t('paywall.login_required', 'Login Required'),
        t('paywall.login_message', 'Please login to upgrade to Pro plan'),
        [
          {text: t('common.cancel', 'Cancel'), style: 'cancel'},
          {
            text: t('paywall.login_button', 'Login'),
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
      return;
    }

    // Log upgrade click
    analytics.upgradeClick('paywall', plan);
    
    // Mock subscription
    upgradeToPro();
    Alert.alert(
      'Upgraded to Pro!',
      'You now have unlimited access to all fault codes. (This is a mock upgrade)',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  const freeFeatures = [
    t('paywall.freeFeatures.0', {limit}),
    t('paywall.freeFeatures.1'),
    t('paywall.freeFeatures.2'),
  ];

  const proFeatures = [
    t('paywall.proFeatures.0'),
    t('paywall.proFeatures.1'),
    t('paywall.proFeatures.2'),
    t('paywall.proFeatures.3'),
    t('paywall.proFeatures.4'),
    t('paywall.proFeatures.5'),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>🚀</Text>
        <Text style={styles.title}>{t('paywall.limitReached')}</Text>
        <Text style={styles.subtitle}>
          {t('paywall.limitReachedDesc', {limit})}
        </Text>
      </View>

      {/* Plan Comparison */}
      <View style={styles.plansContainer}>
        {/* Free Plan */}
        <View style={[styles.planCard, styles.freePlan]}>
          <Text style={styles.planName}>{t('paywall.freePlan')}</Text>
          <Text style={styles.planPrice}>$0</Text>
          <View style={styles.featuresContainer}>
            {freeFeatures.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Text style={styles.featureIcon}>✓</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pro Plan */}
        <View style={[styles.planCard, styles.proPlan]}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
          <Text style={[styles.planName, styles.proText]}>{t('paywall.proPlan')}</Text>
          <Text style={[styles.planPrice, styles.proText]}>$4.99</Text>
          <Text style={styles.planPeriod}>per month</Text>
          <View style={styles.featuresContainer}>
            {proFeatures.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Text style={[styles.featureIcon, styles.proText]}>✓</Text>
                <Text style={[styles.featureText, styles.proText]}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Subscribe Button */}
      {plan === 'free' && (
        <>
          <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
            <Text style={styles.subscribeButtonText}>{t('paywall.subscribe')}</Text>
          </TouchableOpacity>
          <Text style={styles.mockNotice}>{t('paywall.mockNotice')}</Text>
        </>
      )}

      {plan === 'pro' && (
        <View style={styles.alreadyProContainer}>
          <Text style={styles.alreadyProIcon}>✨</Text>
          <Text style={styles.alreadyProText}>
            You're already a Pro member with unlimited access!
          </Text>
        </View>
      )}

      {/* Quota Info */}
      {plan === 'free' && (
        <View style={styles.quotaInfo}>
          <Text style={styles.quotaInfoText}>
            {t('paywall.remainingThisMonth', {remaining, limit})}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#ffffff',
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    padding: spacing.md,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  freePlan: {
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  proPlan: {
    borderWidth: 2,
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: spacing.lg,
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  planName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  planPrice: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  planPeriod: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  proText: {
    color: colors.primary[900],
  },
  featuresContainer: {
    marginTop: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: typography.sizes.lg,
    color: colors.success,
    marginRight: spacing.sm,
    width: 24,
  },
  featureText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.gray[700],
    lineHeight: 24,
  },
  subscribeButton: {
    backgroundColor: colors.primary[600],
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  subscribeButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#ffffff',
  },
  mockNotice: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  alreadyProContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.success,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  alreadyProIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  alreadyProText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: '#ffffff',
    textAlign: 'center',
  },
  quotaInfo: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.md,
  },
  quotaInfoText: {
    fontSize: typography.sizes.base,
    color: colors.primary[900],
    textAlign: 'center',
    fontWeight: typography.weights.semibold,
  },
});

