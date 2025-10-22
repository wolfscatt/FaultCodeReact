/**
 * FaultDetailScreen
 * Displays fault code details with resolution steps
 * Includes free tier gating logic
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';
import {SearchStackScreenProps} from '../navigation/types';
import {useTranslation} from 'react-i18next';
import {getFaultById} from '@data/repo/faultRepo';
import {FaultDetailResult} from '@data/types';
import {useUserStore, useCanAccessContent} from '@state/useUserStore';
import {addFavorite, removeFavorite, isFavorited} from '@data/repo/favoritesRepo';
import PaywallModal from '@components/PaywallModal';
import {colors, spacing, typography, borderRadius, shadows} from '@theme/tokens';
import {useTheme} from '@theme/useTheme';
import {formatDate} from '@utils/index';
import {analytics} from '@state/useAnalyticsStore';
import {usePrefsStore} from '@state/usePrefsStore';
import {adManager} from '../../services/AdManager';

type Props = SearchStackScreenProps<'FaultDetail'>;

export default function FaultDetailScreen({route, navigation}: Props) {
  const {faultId} = route.params;
  const {t} = useTranslation();
  const language = usePrefsStore(state => state.language);
  const {colors: themedColors} = useTheme();
  const [data, setData] = useState<FaultDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const {canAccess, remaining, limit, isPremium: isPremiumProp} = useCanAccessContent();
  const {incrementQuota, checkAndResetQuota, plan, userId, isPremium} = useUserStore();

  useEffect(() => {
    // Check if monthly quota needs reset
    checkAndResetQuota();

    // Check if user can access content
    if (!canAccess) {
      // Navigate to paywall instead
      navigation.replace('Paywall' as any);
      return;
    }

    // Increment quota for free users
    if (plan === 'free') {
      incrementQuota();
      // Track fault view for ad management
      adManager.trackFaultView();
    }

    // Load fault data
    const loadData = async () => {
      try {
        const result = await getFaultById(faultId);
        setData(result);
        
        // Check if fault is favorited (for logged-in users)
        if (userId) {
          const {isFavorited: favStatus} = await isFavorited(userId, faultId);
          setIsFavorite(favStatus);
        }
        
        // Log fault view analytics event
        if (result) {
          analytics.faultView(
            result.fault.id,
            result.fault.code,
            result.fault.brandId,
            result.fault.severity,
          );
        }
      } catch (error) {
        console.error('Failed to load fault:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [faultId, canAccess, plan, incrementQuota, checkAndResetQuota, navigation, language, userId]);

  // Create dynamic styles based on current theme
  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themedColors.background,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: themedColors.background,
    },
    errorText: {
      fontSize: typography.sizes.lg,
      color: colors.error,
      textAlign: 'center',
    },
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    content: {
      paddingBottom: spacing.xl,
    },
    quotaBar: {
      backgroundColor: colors.primary[100],
      padding: spacing.sm,
      alignItems: 'center',
    },
    quotaText: {
      fontSize: typography.sizes.sm,
      color: colors.primary[800],
      fontWeight: typography.weights.semibold,
    },
    header: {
      backgroundColor: themedColors.surface,
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    code: {
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.bold,
      color: themedColors.text,
    },
    severityBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    severityText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: '#ffffff',
      textTransform: 'uppercase',
    },
    title: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.semibold,
      color: themedColors.text,
      marginBottom: spacing.xs,
    },
    verifiedDate: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
    },
    safetyNotice: {
      flexDirection: 'row',
      backgroundColor: colors.warning,
      padding: spacing.md,
      margin: spacing.md,
      borderRadius: borderRadius.md,
      ...shadows.md,
    },
    safetyIcon: {
      fontSize: 24,
      marginRight: spacing.sm,
    },
    safetyTextContainer: {
      flex: 1,
    },
    safetyTitle: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
      color: '#ffffff',
      marginBottom: spacing.xs,
    },
    safetyText: {
      fontSize: typography.sizes.sm,
      color: '#ffffff',
    },
    section: {
      backgroundColor: themedColors.surface,
      padding: spacing.lg,
      marginTop: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      marginBottom: spacing.md,
    },
    bodyText: {
      fontSize: typography.sizes.base,
      color: themedColors.text,
      lineHeight: 24,
    },
    listItem: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    bullet: {
      fontSize: typography.sizes.base,
      color: themedColors.text,
      marginRight: spacing.sm,
    },
    listItemText: {
      flex: 1,
      fontSize: typography.sizes.base,
      color: themedColors.text,
      lineHeight: 22,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: themedColors.background,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: themedColors.border,
    },
    actionButtonText: {
      fontSize: typography.sizes.sm,
      color: themedColors.text,
      fontWeight: typography.weights.medium,
    },
    step: {
      backgroundColor: themedColors.background,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: themedColors.border,
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary[600],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    stepNumberText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.bold,
      color: '#ffffff',
    },
    stepMeta: {
      flex: 1,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    stepMetaText: {
      fontSize: typography.sizes.xs,
      color: themedColors.textSecondary,
    },
    proRequired: {
      color: colors.primary[600],
      fontWeight: typography.weights.semibold,
    },
    stepText: {
      fontSize: typography.sizes.base,
      color: themedColors.text,
      lineHeight: 22,
      marginBottom: spacing.sm,
    },
    toolsContainer: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    toolsLabel: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
      fontWeight: typography.weights.semibold,
    },
    toolsText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
    },
    imagePlaceholder: {
      fontSize: typography.sizes.xs,
      color: themedColors.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      padding: spacing.sm,
      backgroundColor: themedColors.background,
      borderRadius: borderRadius.sm,
    },
    upgradeCTA: {
      backgroundColor: colors.primary[600],
      margin: spacing.md,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      ...shadows.lg,
    },
    upgradeText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      color: '#ffffff',
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('errors.notFound')}</Text>
      </View>
    );
  }

  const {fault, steps} = data;

  const severityColor =
    fault.severity === 'critical'
      ? colors.severity.critical
      : fault.severity === 'warning'
      ? colors.severity.warning
      : colors.severity.info;

  // Copy steps to clipboard
  const handleCopySteps = () => {
    const stepsText = steps
      .map(step => `${step.order}. ${step.text}`)
      .join('\n\n');
    
    const fullText = `${fault.code} - ${fault.title}\n\nResolution Steps:\n\n${stepsText}`;
    
    Clipboard.setString(fullText);
    Alert.alert('Copied!', 'Resolution steps copied to clipboard');
  };

  // Handle favorites (Premium-only)
  const handleFavorite = async () => {
    // Check if user is logged in
    if (!userId) {
      Alert.alert(
        t('favorites.login_required', 'Login Required'),
        t('favorites.login_message', 'Please login to save favorites'),
        [
          {text: t('common.cancel', 'Cancel'), style: 'cancel'},
          {
            text: t('common.login', 'Login'),
            onPress: () => navigation.navigate('Login' as any),
          },
        ],
      );
      return;
    }

    // Check if user is premium
    if (!isPremium()) {
      setShowPaywall(true);
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const {removed, error} = await removeFavorite(userId, faultId);
        if (removed) {
          setIsFavorite(false);
          Alert.alert(
            t('favorites.remove_success', 'Removed from favorites'),
            '',
            [{text: t('common.ok', 'OK')}],
          );
        } else if (error) {
          console.error('Error removing favorite:', error);
          Alert.alert(
            t('common.error', 'Error'),
            t('favorites.error', 'Failed to remove favorite'),
          );
        }
      } else {
        // Add to favorites
        const {created, error} = await addFavorite(userId, faultId);
        if (created) {
          setIsFavorite(true);
          Alert.alert(
            t('favorites.add_success', 'Added to favorites'),
            '',
            [{text: t('common.ok', 'OK')}],
          );
        } else if (error) {
          console.error('Error adding favorite:', error);
          
          // Check if it's an invalid ID format error
          if (error.code === 'INVALID_ID_FORMAT') {
            Alert.alert(
              t('common.error', 'Error'),
              'This fault code cannot be saved as a favorite. Please try again later.',
            );
          } else {
            Alert.alert(
              t('common.error', 'Error'),
              t('favorites.error', 'Failed to add favorite'),
            );
          }
        } else {
          // Already favorited (idempotent)
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('favorites.error', 'Failed to update favorites'),
      );
    }
  };

  const handleUpgrade = () => {
    setShowPaywall(false);
    navigation.navigate('Paywall' as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
        reason="favorites_locked"
      />

      {/* Quota indicator for free users */}
      {plan === 'free' && (
        <View style={styles.quotaBar}>
          <Text style={styles.quotaText}>
            {t('paywall.remainingThisMonth', {remaining, limit})}
          </Text>
        </View>
      )}

      {/* Fault Code Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.code}>{fault.code}</Text>
          <View style={[styles.severityBadge, {backgroundColor: severityColor}]}>
            <Text style={styles.severityText}>
              {t(`fault.severity_${fault.severity}`)}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{fault.title}</Text>
        {fault.lastVerifiedAt && (
          <Text style={styles.verifiedDate}>
            {t('fault.lastVerified', {date: formatDate(fault.lastVerifiedAt)})}
          </Text>
        )}
      </View>

      {/* Safety Notice */}
      {fault.safetyNotice && (
        <View style={styles.safetyNotice}>
          <Text style={styles.safetyIcon}>⚠️</Text>
          <View style={styles.safetyTextContainer}>
            <Text style={styles.safetyTitle}>{t('fault.safetyNotice')}</Text>
            <Text style={styles.safetyText}>{fault.safetyNotice}</Text>
          </View>
        </View>
      )}

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('fault.summary')}</Text>
        <Text style={styles.bodyText}>{fault.summary}</Text>
      </View>

      {/* Causes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('fault.causes')}</Text>
        {fault.causes.map((cause, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listItemText}>{cause}</Text>
          </View>
        ))}
      </View>

      {/* Resolution Steps */}
      {steps.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('fault.resolutionSteps')}</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleFavorite}
                testID="favorite-button">
                <Text style={styles.actionButtonText}>
                  {isFavorite ? '★' : '☆'} {isFavorite ? t('favorites.saved', 'Saved') : t('common.save', 'Save')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleCopySteps}
                testID="copy-button">
                <Text style={styles.actionButtonText}>📋 Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
          {steps.map(step => (
            <View key={step.id} style={styles.step}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.order}</Text>
                </View>
                <View style={styles.stepMeta}>
                  {step.estimatedTimeMin && (
                    <Text style={styles.stepMetaText}>
                      {t('fault.estimatedTime', {minutes: step.estimatedTimeMin})}
                    </Text>
                  )}
                  {step.requiresPro && (
                    <Text style={[styles.stepMetaText, styles.proRequired]}>
                      {t('fault.requiresPro')}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
              {step.tools && step.tools.length > 0 && (
                <View style={styles.toolsContainer}>
                  <Text style={styles.toolsLabel}>{t('fault.tools')}: </Text>
                  <Text style={styles.toolsText}>{step.tools.join(', ')}</Text>
                </View>
              )}
              {!step.imageUrl && (
                <Text style={styles.imagePlaceholder}>{t('fault.imageComingSoon')}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Pro upgrade CTA */}
      {plan === 'free' && (
        <TouchableOpacity
          style={styles.upgradeCTA}
          onPress={() => navigation.navigate('Paywall' as any)}>
          <Text style={styles.upgradeText}>Upgrade to Pro for unlimited access</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

