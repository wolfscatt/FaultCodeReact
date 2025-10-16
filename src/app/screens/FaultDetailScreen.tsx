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
import {colors, spacing, typography, borderRadius, shadows} from '@theme/tokens';
import {formatDate} from '@utils/index';
import {analytics} from '@state/useAnalyticsStore';
import {usePrefsStore} from '@state/usePrefsStore';

type Props = SearchStackScreenProps<'FaultDetail'>;

export default function FaultDetailScreen({route, navigation}: Props) {
  const {faultId} = route.params;
  const {t} = useTranslation();
  const language = usePrefsStore(state => state.language);
  const [data, setData] = useState<FaultDetailResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const {canAccess, remaining, limit} = useCanAccessContent();
  const {incrementQuota, checkAndResetQuota, plan} = useUserStore();

  useEffect(() => {
    // Check if daily quota needs reset
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
    }

    // Load fault data
    const loadData = async () => {
      try {
        const result = await getFaultById(faultId);
        setData(result);
        
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
  }, [faultId, canAccess, plan, incrementQuota, checkAndResetQuota, navigation, language]);

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

  // Bookmark (mock)
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    Alert.alert(
      bookmarked ? 'Removed' : 'Saved!',
      bookmarked 
        ? 'Removed from bookmarks' 
        : 'Added to bookmarks (mock - not persisted)'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Quota indicator for free users */}
      {plan === 'free' && (
        <View style={styles.quotaBar}>
          <Text style={styles.quotaText}>
            {t('paywall.remainingToday', {remaining, limit})}
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
                onPress={handleBookmark}
                testID="bookmark-button">
                <Text style={styles.actionButtonText}>
                  {bookmarked ? '★' : '☆'} Save
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.error,
    textAlign: 'center',
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
    backgroundColor: '#ffffff',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
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
    color: colors.gray[900],
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
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  verifiedDate: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
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
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: spacing.lg,
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
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
    color: colors.gray[900],
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[700],
  },
  bodyText: {
    fontSize: typography.sizes.base,
    color: colors.gray[700],
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bullet: {
    fontSize: typography.sizes.lg,
    color: colors.primary[600],
    marginRight: spacing.sm,
    lineHeight: 24,
  },
  listItemText: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.gray[700],
    lineHeight: 24,
  },
  step: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
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
  },
  stepMetaText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
  },
  proRequired: {
    color: colors.primary[600],
    fontWeight: typography.weights.semibold,
  },
  stepText: {
    fontSize: typography.sizes.base,
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  toolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  toolsLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[600],
  },
  toolsText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
  imagePlaceholder: {
    fontSize: typography.sizes.sm,
    color: colors.gray[400],
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  upgradeCTA: {
    backgroundColor: colors.primary[600],
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.md,
  },
  upgradeText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#ffffff',
  },
});

