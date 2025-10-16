/**
 * Paywall Modal Component
 * Shows upgrade prompt for premium features and quota limits
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius} from '@theme/tokens';
import {useTranslation} from 'react-i18next';

export type PaywallReason = 'quota_exceeded' | 'favorites_locked' | 'premium_feature';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason?: PaywallReason;
};

export default function PaywallModal({
  visible,
  onClose,
  onUpgrade,
  reason = 'premium_feature',
}: PaywallModalProps) {
  const {colors: themedColors} = useTheme();
  const {t} = useTranslation();

  // Dynamic styles based on theme
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    container: {
      backgroundColor: themedColors.surface,
      borderRadius: borderRadius.lg,
      width: '100%',
      maxWidth: 400,
      padding: spacing.xl,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
    icon: {
      fontSize: 48,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.sizes['2xl'],
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
      textAlign: 'center',
    },
    content: {
      marginBottom: spacing.xl,
    },
    featureList: {
      marginTop: spacing.md,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    featureIcon: {
      fontSize: 20,
      marginRight: spacing.sm,
      color: colors.primary[600],
    },
    featureText: {
      flex: 1,
      fontSize: typography.sizes.base,
      color: themedColors.text,
    },
    comparison: {
      backgroundColor: themedColors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    comparisonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    comparisonLabel: {
      fontSize: typography.sizes.sm,
      color: themedColors.text,
      fontWeight: typography.weights.medium,
    },
    comparisonFree: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
    },
    comparisonPro: {
      fontSize: typography.sizes.sm,
      color: colors.primary[600],
      fontWeight: typography.weights.semibold,
    },
    buttons: {
      gap: spacing.sm,
    },
    upgradeButton: {
      backgroundColor: colors.primary[600],
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    upgradeButtonText: {
      color: '#ffffff',
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
    },
    cancelButton: {
      backgroundColor: 'transparent',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: themedColors.border,
    },
    cancelButtonText: {
      color: themedColors.text,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.medium,
    },
  });

  // Determine title and message based on reason
  const getTitle = () => {
    switch (reason) {
      case 'quota_exceeded':
        return t('paywall.quota_exceeded_title', 'Monthly Limit Reached');
      case 'favorites_locked':
        return t('paywall.favorites_locked_title', 'Favorites is Premium Only');
      default:
        return t('paywall.premium_title', 'Upgrade to Premium');
    }
  };

  const getMessage = () => {
    switch (reason) {
      case 'quota_exceeded':
        return t(
          'paywall.quota_exceeded_message',
          'You have reached your monthly limit of 10 fault details. Upgrade to Pro for unlimited access.',
        );
      case 'favorites_locked':
        return t(
          'paywall.favorites_locked_message',
          'Save your favorite fault codes for quick access. Available with Pro plan.',
        );
      default:
        return t(
          'paywall.premium_message',
          'Unlock all features and get unlimited access to fault codes.',
        );
    }
  };

  const proFeatures = [
    t('paywall.feature_unlimited', 'Unlimited fault details'),
    t('paywall.feature_favorites', 'Save favorites'),
    t('paywall.feature_advanced_search', 'Advanced search'),
    t('paywall.feature_priority_support', 'Priority support'),
    t('paywall.feature_offline', 'Offline access'),
    t('paywall.feature_images', 'Image guides'),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.icon}>💎</Text>
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.subtitle}>{getMessage()}</Text>
            </View>

            <ScrollView style={styles.content}>
              {/* Features List */}
              <View style={styles.featureList}>
                {proFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Comparison Table */}
              <View style={styles.comparison}>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>
                    {t('paywall.feature', 'Feature')}
                  </Text>
                  <Text style={styles.comparisonLabel}>
                    {t('paywall.free', 'Free')}
                  </Text>
                  <Text style={styles.comparisonLabel}>
                    {t('paywall.pro', 'Pro')}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>
                    {t('paywall.fault_details', 'Fault Details')}
                  </Text>
                  <Text style={styles.comparisonFree}>
                    {t('paywall.limit_10', '10/month')}
                  </Text>
                  <Text style={styles.comparisonPro}>
                    {t('paywall.unlimited', 'Unlimited')}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonLabel}>
                    {t('paywall.favorites', 'Favorites')}
                  </Text>
                  <Text style={styles.comparisonFree}>✗</Text>
                  <Text style={styles.comparisonPro}>✓</Text>
                </View>
                <View style={[styles.comparisonRow, {borderBottomWidth: 0}]}>
                  <Text style={styles.comparisonLabel}>
                    {t('paywall.support', 'Support')}
                  </Text>
                  <Text style={styles.comparisonFree}>
                    {t('paywall.basic', 'Basic')}
                  </Text>
                  <Text style={styles.comparisonPro}>
                    {t('paywall.priority', 'Priority')}
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
                <Text style={styles.upgradeButtonText}>
                  {t('paywall.upgrade_button', 'Upgrade to Pro')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>
                  {t('paywall.cancel', 'Maybe Later')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

