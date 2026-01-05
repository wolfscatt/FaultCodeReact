/**
 * BrandModelsScreen
 * Shows a grid of models for a selected brand, plus an option to view all faults for that brand.
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius, shadows} from '@theme/tokens';
import {BoilerModel} from '@data/types';
import {getModelsByBrand} from '@data/repo/modelRepo';
import {SearchStackScreenProps} from '../navigation/types';

type Props = SearchStackScreenProps<'BrandModels'>;

type Tile =
  | {type: 'allBrandFaults'; id: 'all'; label: string}
  | {type: 'model'; id: string; model: BoilerModel};

const NUM_COLUMNS = 3;
const GAP = 12; // Gap between cards
const CARD_WIDTH = (Dimensions.get('window').width - spacing.md * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function BrandModelsScreen({route, navigation}: Props) {
  const {brandId, brandName} = route.params;
  const {t} = useTranslation();
  const {colors: themedColors} = useTheme();
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const models = await getModelsByBrand(brandId);
        const modelTiles: Tile[] = models.map(model => ({
          type: 'model',
          id: model.id,
          model,
        }));

        const allTile: Tile = {
          type: 'allBrandFaults',
          id: 'all',
          label: t('home.brandAllFaults', 'All fault codes'),
        };

        setTiles([allTile, ...modelTiles]);
      } catch (error) {
        console.log('Failed to load models for brand:', error);
      }
    };

    load();
  }, [brandId, t]);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    content: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
    },
    card: {
      width: CARD_WIDTH,
      marginBottom: GAP,
      marginRight: GAP,
      backgroundColor: themedColors.surface,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.sm,
      ...shadows.md,
      borderWidth: 1,
      borderColor: 'rgba(15, 23, 42, 0.06)',
      aspectRatio: 1,
    },
    allCard: {
      backgroundColor: colors.primary[600],
    },
    allLabel: {
      marginTop: spacing.sm,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    modelLabel: {
      marginTop: spacing.sm,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: themedColors.text,
      textAlign: 'center',
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: themedColors.background,
      borderWidth: 1,
      borderColor: 'rgba(148, 163, 184, 0.6)',
    },
    badgeText: {
      fontSize: typography.sizes.xs,
      color: themedColors.textSecondary,
    },
  });

  const renderItem = ({item, index}: {item: Tile; index: number}) => {
    const isLastInRow = (index + 1) % NUM_COLUMNS === 0;

    const cardStyle = [
      dynamicStyles.card,
      isLastInRow && {marginRight: 0},
      item.type === 'allBrandFaults' && dynamicStyles.allCard,
    ];

    if (item.type === 'allBrandFaults') {
      return (
        <TouchableOpacity
          style={cardStyle}
          onPress={() =>
            navigation.navigate('BrandFaults', {
              brandId,
              brandName,
            })
          }>
          <View style={dynamicStyles.badge}>
            <Text style={[dynamicStyles.badgeText, {color: colors.primary[700]}]}>
              {brandName}
            </Text>
          </View>
          <Text style={dynamicStyles.allLabel}>{item.label}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={() =>
          navigation.navigate('BrandFaults', {
            brandId,
            brandName,
            modelId: item.model.id,
            modelName: item.model.modelName,
          })
        }>
        <View style={dynamicStyles.badge}>
          <Text style={dynamicStyles.badgeText}>{item.model.years || ' '}</Text>
        </View>
        <Text style={dynamicStyles.modelLabel}>{item.model.modelName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      <FlatList
        data={tiles}
        keyExtractor={item => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={dynamicStyles.content}
        renderItem={renderItem}
      />
    </View>
  );
}


