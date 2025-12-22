/**
 * AboutScreen
 * Displays app information, developer details, and partner company info
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius, shadows} from '@theme/tokens';
import {getSimpleVersion} from '@utils/appVersion';
import type {RootStackParamList} from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function AboutScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const {colors: themedColors} = useTheme();
  const [appVersion, setAppVersion] = useState('0.1.0');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    // Get app version from native configuration
    try {
      const version = getSimpleVersion();
      setAppVersion(version);
    } catch (error) {
      console.log('Could not get app version:', error);
      setAppVersion('0.1.0'); // Fallback
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    header: {
      backgroundColor: themedColors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    headerTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    card: {
      backgroundColor: themedColors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      ...shadows.sm,
    },
    appIconContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    appIcon: {
      width: 120,
      height: 120,
      borderRadius: borderRadius.xl,
      ...shadows.md,
    },
    appIconShadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    title: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    description: {
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: spacing.xl,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    infoRowLast: {
      borderBottomWidth: 0,
    },
    infoLabel: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.medium,
      color: themedColors.text,
    },
    infoValue: {
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
      flex: 1,
      textAlign: 'right',
    },
    versionCard: {
      backgroundColor: themedColors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
      ...shadows.sm,
    },
    versionText: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
      marginBottom: spacing.xs,
    },
    versionNumber: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: colors.primary[600],
    },
    backButton: {
      position: 'absolute',
      top: spacing.lg,
      left: spacing.lg,
      zIndex: 1,
    },
    backButtonText: {
      fontSize: typography.sizes.lg,
      color: themedColors.text,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={dynamicStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{t('about.title')}</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* App Icon */}
        <Animated.View 
          style={[
            dynamicStyles.appIconContainer,
            {opacity: fadeAnim}
          ]}>
          {!iconError ? (
            <Image
              source={require('../../../assets/app_icons/app_icon.png')}
              style={[dynamicStyles.appIcon, dynamicStyles.appIconShadow]}
              resizeMode="contain"
              onError={() => {
                console.log('App icon load error, showing fallback');
                setIconError(true);
              }}
            />
          ) : (
            <View style={[dynamicStyles.appIcon, dynamicStyles.appIconShadow, {backgroundColor: colors.primary[100], alignItems: 'center', justifyContent: 'center'}]}>
              <Text style={{fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.primary[600]}}>FC</Text>
            </View>
          )}
        </Animated.View>

        {/* App Info Card */}
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.title}>{t('about.title')}</Text>
          <Text style={dynamicStyles.description}>
            {t('about.description')}
          </Text>

          {/* Developer Info */}
          <View style={dynamicStyles.infoRow}>
            <Text style={dynamicStyles.infoLabel}>{t('about.developer')}</Text>
            <Text style={dynamicStyles.infoValue}>{t('about.developerName')}</Text>
          </View>

          {/* Partner Company Info */}
          <View style={dynamicStyles.infoRow}>
            <Text style={dynamicStyles.infoLabel}>{t('about.partnerCompany')}</Text>
            <Text style={dynamicStyles.infoValue}>{t('about.companyName')}</Text>
          </View>

          {/* Version Info */}
          <View style={[dynamicStyles.infoRow, dynamicStyles.infoRowLast]}>
            <Text style={dynamicStyles.infoLabel}>{t('about.version')}</Text>
            <Text style={dynamicStyles.infoValue}>{appVersion}</Text>
          </View>
        </View>

        {/* Version Card */}
        <View style={dynamicStyles.versionCard}>
          <Text style={dynamicStyles.versionText}>{t('about.version')}</Text>
          <Text style={dynamicStyles.versionNumber}>{appVersion}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
