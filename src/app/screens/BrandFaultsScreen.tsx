/**
 * BrandFaultsScreen
 * Lists fault codes for a selected brand, optionally filtered by model.
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography} from '@theme/tokens';
import {FaultCode} from '@data/types';
import {searchFaults} from '@data/repo/faultRepo';
import FaultCodeCard from '@components/FaultCodeCard';
import {SearchStackScreenProps} from '../navigation/types';

type Props = SearchStackScreenProps<'BrandFaults'>;

export default function BrandFaultsScreen({route, navigation}: Props) {
  const {brandId, brandName, modelId, modelName} = route.params;
  const {t} = useTranslation();
  const {colors: themedColors} = useTheme();
  const [faults, setFaults] = useState<FaultCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const results = await searchFaults({brandId});
        const filtered =
          modelId != null
            ? results.filter(fault => fault.boilerModelId === modelId)
            : results;
        setFaults(filtered);
      } catch (error) {
        console.log('Failed to load brand/model faults:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [brandId, modelId]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: themedColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    headerText: {
      fontSize: typography.sizes.sm,
      color: themedColors.textSecondary,
    },
    listContent: {
      padding: spacing.md,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
      textAlign: 'center',
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
    },
  });

  const handleFaultPress = (faultId: string) => {
    navigation.navigate('FaultDetail', {faultId});
  };

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {brandName}
          {modelName ? ` • ${modelName}` : ''}
        </Text>
      </View>
      {faults.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('search.noResults')}</Text>
        </View>
      ) : (
        <FlatList
          data={faults}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <FaultCodeCard
              fault={item}
              onPress={() => handleFaultPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}


