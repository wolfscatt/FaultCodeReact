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
import {colors, spacing, typography, borderRadius} from '@theme/tokens';
import {analytics} from '@state/useAnalyticsStore';
import {usePrefsStore} from '@state/usePrefsStore';

type Props = SearchStackScreenProps<'SearchHome'>;

export default function SearchHomeScreen({navigation}: Props) {
  const {t} = useTranslation();
  const language = usePrefsStore(state => state.language); // Subscribe to language changes
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

  const renderBrandPicker = () => {
    if (!showBrandPicker) return null;

    return (
      <View style={styles.brandPicker}>
        <TouchableOpacity
          style={styles.brandOption}
          onPress={() => {
            setSelectedBrand(undefined);
            setShowBrandPicker(false);
          }}>
          <Text style={styles.brandOptionText}>{t('search.allBrands')}</Text>
        </TouchableOpacity>
        {brands.map(brand => (
          <TouchableOpacity
            key={brand.id}
            style={styles.brandOption}
            onPress={() => {
              setSelectedBrand(brand.id);
              setShowBrandPicker(false);
            }}>
            <Text style={styles.brandOptionText}>{brand.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.emptyText}>{t('search.searching')}</Text>
        </View>
      );
    }

    if (query.trim() === '' && !selectedBrand) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Start searching for fault codes</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🤷</Text>
        <Text style={styles.emptyTitle}>{t('search.noResults')}</Text>
        <Text style={styles.emptyDescription}>{t('search.noResultsDesc')}</Text>
      </View>
    );
  };

  const selectedBrandName = brands.find(b => b.id === selectedBrand)?.name;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('search.placeholder')}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={colors.gray[400]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowBrandPicker(!showBrandPicker)}>
          <Text style={styles.filterButtonText}>
            {selectedBrandName || t('search.brandFilter')}
          </Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {renderBrandPicker()}

      {results.length > 0 && (
        <Text style={styles.resultsCount}>
          {t('search.resultsCount', {count: results.length})}
        </Text>
      )}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <FaultCodeCard fault={item} onPress={() => handleFaultPress(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  searchInput: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  filterButtonText: {
    fontSize: typography.sizes.base,
    color: colors.gray[700],
  },
  filterIcon: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  brandPicker: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    maxHeight: 300,
  },
  brandOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  brandOptionText: {
    fontSize: typography.sizes.base,
    color: colors.gray[900],
  },
  resultsCount: {
    padding: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
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
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.gray[600],
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    textAlign: 'center',
  },
});

