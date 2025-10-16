/**
 * SettingsScreen
 * User preferences and settings
 */

import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import {useTranslation} from 'react-i18next';
import {usePrefsStore} from '@state/usePrefsStore';
import {useUserStore} from '@state/useUserStore';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius} from '@theme/tokens';
import i18n from '@i18n/index';

export default function SettingsScreen() {
  const {t} = useTranslation();
  const {theme: currentTheme, colors: themedColors} = useTheme();
  const {language, theme, analyticsOptIn, setLanguage, toggleTheme, setAnalyticsOptIn} =
    usePrefsStore();
  const {plan, downgradeToFree} = useUserStore();

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'tr' : 'en';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handlePlanToggle = () => {
    // For demo purposes, allow toggling between plans
    if (plan === 'pro') {
      downgradeToFree();
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    section: {
      backgroundColor: themedColors.surface,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    sectionTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: themedColors.textSecondary,
      textTransform: 'uppercase',
      marginBottom: spacing.md,
      letterSpacing: 1,
    },
    settingLabel: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.medium,
      color: themedColors.text,
    },
    settingDescription: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
      marginTop: spacing.xs,
      lineHeight: 20,
    },
    planValue: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.primary[600],
      marginTop: spacing.xs,
    },
    appInfoText: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: themedColors.textSecondary,
    },
    appInfoSubtext: {
      fontSize: typography.sizes.xs,
      color: themedColors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Language */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t('settings.language')}</Text>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleLanguageToggle}
          testID="language-toggle">
          <Text style={dynamicStyles.settingLabel}>
            {language === 'en' ? 'English' : 'Türkçe'}
          </Text>
          <Text style={styles.settingValue}>🌐</Text>
        </TouchableOpacity>
      </View>

      {/* Theme */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t('settings.theme')}</Text>
        <View style={styles.settingRow}>
          <Text style={dynamicStyles.settingLabel}>
            {theme === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
          </Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{false: colors.gray[300], true: colors.primary[600]}}
            thumbColor="#ffffff"
            testID="theme-toggle"
          />
        </View>
      </View>

      {/* Analytics */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t('settings.analytics')}</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={dynamicStyles.settingLabel}>{t('settings.analytics')}</Text>
            <Text style={dynamicStyles.settingDescription}>{t('settings.analyticsDesc')}</Text>
          </View>
          <Switch
            value={analyticsOptIn}
            onValueChange={setAnalyticsOptIn}
            trackColor={{false: colors.gray[300], true: colors.primary[600]}}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Subscription */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t('settings.subscription')}</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={dynamicStyles.settingLabel}>{t('settings.currentPlan')}</Text>
            <Text style={dynamicStyles.planValue}>
              {plan === 'pro' ? '✨ Pro Plan' : 'Free Plan'}
            </Text>
          </View>
        </View>
        {plan === 'pro' && (
          <TouchableOpacity style={styles.planButton} onPress={handlePlanToggle}>
            <Text style={styles.planButtonText}>Downgrade to Free (Demo)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={dynamicStyles.appInfoText}>FaultCode v0.1.0</Text>
        <Text style={dynamicStyles.appInfoSubtext}>
          Boiler fault code assistant with mock data
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingValue: {
    fontSize: typography.sizes.xl,
  },
  planButton: {
    marginTop: spacing.md,
    backgroundColor: colors.gray[200],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  planButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
  },
  appInfo: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
});

