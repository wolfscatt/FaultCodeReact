/**
 * SearchHomeScreen
 * Main search interface with brand filter and results
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {SearchStackScreenProps} from '../navigation/types';
import {useTranslation} from 'react-i18next';
import {searchFaults} from '@data/repo/faultRepo';
import {getAllBrands} from '@data/repo/brandRepo';
import {FaultCode, Brand} from '@data/types';
import {debounce} from '@utils/index';
import FaultCodeCard from '@components/FaultCodeCard';
import BannerAd from '@components/BannerAd';
import {colors, spacing, typography, borderRadius} from '@theme/tokens';
import {analytics} from '@state/useAnalyticsStore';
import {usePrefsStore} from '@state/usePrefsStore';
import {useTheme} from '@theme/useTheme';

type Props = SearchStackScreenProps<'SearchHome'>;

export default function SearchHomeScreen({navigation}: Props) {
  const {t} = useTranslation();
  const language = usePrefsStore(state => state.language); // Subscribe to language changes
  const {colors: themedColors} = useTheme();
  const [query, setQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [results, setResults] = useState<FaultCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);

  // Load brands on mount AND when language changes
  useEffect(() => {
    getAllBrands().then(setBrands);
  }, [language]); // Re-fetch when language changes

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string, brandId?: string) => {
      setLoading(true);
      try {
        const faults = await searchFaults({
          q: searchQuery,
          brandId,
        });
        setResults(faults);
        
        // Log search analytics event
        if (searchQuery) {
          analytics.search(searchQuery, brandId);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [],
  );

  // Trigger search when query, brand, OR language changes
  useEffect(() => {
    performSearch(query, selectedBrand);
  }, [query, selectedBrand, language, performSearch]); // Re-search when language changes

  const handleFaultPress = (faultId: string) => {
    navigation.navigate('FaultDetail', {faultId});
  };

  const selectedBrandName = brands.find(b => b.id === selectedBrand)?.name;

  // Create dynamic styles based on current theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    searchContainer: {
      padding: spacing.md,
      backgroundColor: themedColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    searchInput: {
      backgroundColor: themedColors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.sizes.base,
      color: themedColors.text,
      borderWidth: 1,
      borderColor: themedColors.border,
      marginBottom: spacing.sm,
    },
    filterButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: themedColors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: themedColors.border,
    },
    filterButtonText: {
      fontSize: typography.sizes.base,
      color: themedColors.text,
    },
    filterIcon: {
      fontSize: typography.sizes.xs,
      color: themedColors.textSecondary,
    },
    brandPicker: {
      backgroundColor: themedColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
      maxHeight: 300,
    },
    brandOption: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    brandOptionText: {
      fontSize: typography.sizes.base,
      color: themedColors.text,
    },
    resultsCount: {
      padding: spacing.md,
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
    },
    emptyTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
      color: themedColors.text,
      marginBottom: spacing.xs,
    },
    emptyText: {
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
      textAlign: 'center',
    },
  });

  const staticStyles = StyleSheet.create({
    listContent: {
      padding: spacing.md,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: spacing.md,
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

  // Render functions (defined after styles so they can use them)
  const renderBrandPicker = () => {
    if (!showBrandPicker) return null;

    return (
      <View style={dynamicStyles.brandPicker}>
        <TouchableOpacity
          style={dynamicStyles.brandOption}
          onPress={() => {
            setSelectedBrand(undefined);
            setShowBrandPicker(false);
          }}>
          <Text style={dynamicStyles.brandOptionText}>{t('search.allBrands')}</Text>
        </TouchableOpacity>
        {brands.map(brand => (
          <TouchableOpacity
            key={brand.id}
            style={dynamicStyles.brandOption}
            onPress={() => {
              setSelectedBrand(brand.id);
              setShowBrandPicker(false);
            }}>
            <Text style={dynamicStyles.brandOptionText}>{brand.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={staticStyles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={dynamicStyles.emptyText}>{t('search.searching')}</Text>
        </View>
      );
    }

    if (query.trim() === '' && !selectedBrand) {
      return (
        <View style={staticStyles.emptyState}>
          <Text style={staticStyles.emptyIcon}>🔍</Text>
          <Text style={dynamicStyles.emptyText}>Start searching for fault codes</Text>
        </View>
      );
    }

    return (
      <View style={staticStyles.emptyState}>
        <Text style={staticStyles.emptyIcon}>🤷</Text>
        <Text style={dynamicStyles.emptyTitle}>{t('search.noResults')}</Text>
        <Text style={dynamicStyles.emptyDescription}>{t('search.noResultsDesc')}</Text>
      </View>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.searchContainer}>
        <TextInput
          style={dynamicStyles.searchInput}
          placeholder={t('search.placeholder')}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={themedColors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={dynamicStyles.filterButton}
          onPress={() => setShowBrandPicker(!showBrandPicker)}>
          <Text style={dynamicStyles.filterButtonText}>
            {selectedBrandName || t('search.brandFilter')}
          </Text>
          <Text style={dynamicStyles.filterIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {renderBrandPicker()}

      {results.length > 0 && (
        <Text style={dynamicStyles.resultsCount}>
          {t('search.resultsCount', {count: results.length})}
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <FaultCodeCard fault={item} onPress={() => handleFaultPress(item.id)} />
        )}
        contentContainerStyle={staticStyles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
      
      {/* Banner Ad for Free Users */}
      <BannerAd style={staticStyles.bannerAd} />
    </View>
  );
}

