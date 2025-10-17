/**
 * Favorites Screen
 * Displays user's saved fault codes (Premium-only feature)
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius} from '@theme/tokens';
import {useTranslation} from 'react-i18next';
import {useUserStore} from '@state/useUserStore';
import {listFavorites, removeFavorite} from '@data/repo/favoritesRepo';
import {FaultCode} from '@data/types';
import {fromBilingualText} from '@data/repo/bilingual';
import {usePrefsStore} from '@state/usePrefsStore';
import PaywallModal from '@components/PaywallModal';
import type {RootStackParamList} from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {colors: themedColors} = useTheme();
  const {t} = useTranslation();
  const {userId, isPremium, plan} = useUserStore();
  const {language} = usePrefsStore();

  const [favorites, setFavorites] = useState<FaultCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Dynamic styles based on theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themedColors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: spacing.lg,
    },
    emptyTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    emptyText: {
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
      textAlign: 'center',
    },
    list: {
      padding: spacing.md,
    },
    card: {
      backgroundColor: themedColors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: themedColors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    codeContainer: {
      flex: 1,
    },
    code: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      marginBottom: spacing.xs,
    },
    severity: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      alignSelf: 'flex-start',
    },
    severityInfo: {
      backgroundColor: colors.severity.info,
      color: '#ffffff',
    },
    severityWarning: {
      backgroundColor: colors.severity.warning,
      color: '#ffffff',
    },
    severityCritical: {
      backgroundColor: colors.severity.critical,
      color: '#ffffff',
    },
    removeButton: {
      padding: spacing.sm,
    },
    removeIcon: {
      fontSize: 20,
      color: colors.severity.critical,
    },
    title: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      color: themedColors.text,
      marginBottom: spacing.xs,
    },
    summary: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
      marginBottom: spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    savedDate: {
      fontSize: typography.sizes.xs,
      color: themedColors.textSecondary,
    },
    viewButton: {
      backgroundColor: colors.primary[600],
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    viewButtonText: {
      color: '#ffffff',
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    headerTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
    },
    count: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
    },
  });

  // Check premium access on mount
  useEffect(() => {
    if (!isPremium()) {
      setShowPaywall(true);
      setIsLoading(false);
      return;
    }

    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const favoritesList = await listFavorites(userId);
      setFavorites(favoritesList);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadFavorites();
    setIsRefreshing(false);
  };

  const handleRemoveFavorite = async (faultCodeId: string) => {
    if (!userId) return;

    Alert.alert(
      t('favorites.remove_title', 'Remove Favorite'),
      t('favorites.remove_message', 'Are you sure you want to remove this from favorites?'),
      [
        {text: t('common.cancel', 'Cancel'), style: 'cancel'},
        {
          text: t('favorites.remove', 'Remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              const {removed, error} = await removeFavorite(userId, faultCodeId);

              if (removed) {
                setFavorites(prev => prev.filter(f => f.id !== faultCodeId));
                Alert.alert(
                  t('favorites.remove_success', 'Removed from favorites'),
                  '',
                  [{text: t('common.ok', 'OK')}],
                );
              } else if (error) {
                console.error('Error removing favorite:', error);
                Alert.alert('Error', 'Failed to remove favorite');
              }
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove favorite');
            }
          },
        },
      ],
    );
  };

  const handleViewFault = (faultId: string) => {
    navigation.navigate('FaultDetail', {faultId});
  };

  const handleUpgrade = () => {
    setShowPaywall(false);
    navigation.navigate('Paywall');
  };

  // Show paywall if not premium
  if (showPaywall && !isPremium()) {
    return (
      <View style={styles.container}>
        <PaywallModal
          visible={showPaywall}
          onClose={() => {
            setShowPaywall(false);
            navigation.goBack();
          }}
          onUpgrade={handleUpgrade}
          reason="favorites_locked"
        />
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={{color: themedColors.textSecondary, marginTop: spacing.md}}>
          {t('common.loading', 'Loading...')}
        </Text>
      </View>
    );
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>
            {t('favorites.empty_title', 'No Favorites Yet')}
          </Text>
          <Text style={styles.emptyText}>
            {t(
              'favorites.empty_message',
              'Save fault codes you find useful for quick access later.',
            )}
          </Text>
        </View>
      </View>
    );
  }

  // Favorites list
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('favorites.title', 'Favorites')}
        </Text>
        <Text style={styles.count}>
          {favorites.length} {t('favorites.saved', 'saved')}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderItem={({item}) => {
          const fault = item;
          const title = fault.title;
          const summary = fault.summary;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.codeContainer}>
                  <Text style={styles.code}>{fault.code}</Text>
                  <Text
                    style={[
                      styles.severity,
                      fault.severity === 'info' && styles.severityInfo,
                      fault.severity === 'warning' && styles.severityWarning,
                      fault.severity === 'critical' && styles.severityCritical,
                    ]}>
                    {t(`fault.severity_${fault.severity}`, fault.severity)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFavorite(fault.id)}>
                  <Text style={styles.removeIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              <Text style={styles.summary} numberOfLines={3}>
                {summary}
              </Text>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewFault(fault.id)}>
                  <Text style={styles.viewButtonText}>
                    {t('favorites.view', 'View Details')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

