/**
 * SettingsScreen
 * User preferences and settings
 */

import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {usePrefsStore} from '@state/usePrefsStore';
import {useUserStore} from '@state/useUserStore';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius} from '@theme/tokens';
import {getFormattedVersion} from '@utils/appVersion';
import BannerAd from '@components/BannerAd';
import i18n from '@i18n/index';
import type {RootStackParamList} from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Modern outline icons
const InfoIcon = ({color, size = 24}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MailIcon = ({color, size = 24}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 6L12 13L2 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SettingsScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const {colors: themedColors} = useTheme();
  const {language, theme, analyticsOptIn, setLanguage, toggleTheme, setAnalyticsOptIn} =
    usePrefsStore();
  const {plan, downgradeToFree, isLoggedIn, email} = useUserStore();

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

  const goToProfile = () => {
    navigation.navigate('Profile');
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Account */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>
          {isLoggedIn ? 'Account' : 'Sign In'}
        </Text>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={isLoggedIn ? goToProfile : goToLogin}>
          <View style={styles.settingTextContainer}>
            <Text style={dynamicStyles.settingLabel}>
              {isLoggedIn ? 'Profile' : 'Sign In / Register'}
            </Text>
            {isLoggedIn && email && (
              <Text style={dynamicStyles.settingDescription}>{email}</Text>
            )}
          </View>
          <Text style={styles.settingValue}>→</Text>
        </TouchableOpacity>
      </View>

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
        {plan === 'free' && (
          <TouchableOpacity 
            style={[styles.planButton, styles.upgradeButton]} 
            onPress={() => navigation.navigate('Paywall')}>
            <Text style={[styles.planButtonText, styles.upgradeButtonText]}>
              ✨ Upgrade to Pro
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Information */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>{t('settings.appInformation')}</Text>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('About')}>
          <View style={styles.settingTextContainer}>
            <Text style={dynamicStyles.settingLabel}>{t('settings.about')}</Text>
            <Text style={dynamicStyles.settingDescription}>
              {t('about.description')}
            </Text>
          </View>
          <InfoIcon color={themedColors.textSecondary} size={22} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('ContactUs')}>
          <View style={styles.settingTextContainer}>
            <Text style={dynamicStyles.settingLabel}>{t('settings.contactUs')}</Text>
            <Text style={dynamicStyles.settingDescription}>
              {t('contactUs.subtitle')}
            </Text>
          </View>
          <MailIcon color={themedColors.textSecondary} size={22} />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={dynamicStyles.appInfoText}>FaultCode {getFormattedVersion()}</Text>
        <Text style={dynamicStyles.appInfoSubtext}>
          Boiler fault code assistant with AI
        </Text>
      </View>
      
      {/* Banner Ad for Free Users */}
      <BannerAd style={styles.bannerAd} />
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
  upgradeButton: {
    backgroundColor: colors.primary[600],
  },
  upgradeButtonText: {
    color: '#ffffff',
  },
  appInfo: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  bannerAd: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0f0f0',
    paddingVertical: spacing.sm,
  },
});

