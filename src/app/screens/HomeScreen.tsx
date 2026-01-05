/**
 * HomeScreen
 * Shows a grid of brands and an entry point to all fault codes.
 *
 * - First card: "All fault codes" -> navigates to full search screen
 * - Other cards: brands in a 3-column grid
 */

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius, shadows} from '@theme/tokens';
import {Brand} from '@data/types';
import {getAllBrands} from '@data/repo/brandRepo';
import {SearchStackScreenProps} from '../navigation/types';

type Props = SearchStackScreenProps<'Home'>;

type HomeTile =
  | {type: 'allFaults'; id: 'all'; label: string}
  | {type: 'brand'; id: string; brand: Brand};

const NUM_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = spacing.md * 2;
const GAP = spacing.sm;
const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function HomeScreen({navigation}: Props) {
  const {t} = useTranslation();
  const {colors: themedColors} = useTheme();
  const [tiles, setTiles] = useState<HomeTile[]>([]);

  useEffect(() => {
    // Load brands and build tile list
    const load = async () => {
      try {
        const brands = await getAllBrands();
        const brandTiles: HomeTile[] = brands.map(brand => ({
          type: 'brand',
          id: brand.id,
          brand,
        }));

        const allTile: HomeTile = {
          type: 'allFaults',
          id: 'all',
          label: t('home.allFaults', 'All fault codes'),
        };

        setTiles([allTile, ...brandTiles]);
      } catch (error) {
        console.log('Failed to load brands for Home screen:', error);
      }
    };

    load();
  }, [t]);

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
    },
    allFaultsCard: {
      backgroundColor: colors.primary[600],
    },
    allFaultsLabel: {
      marginTop: spacing.sm,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    brandLabel: {
      marginTop: spacing.sm,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: themedColors.text,
      textAlign: 'center',
    },
    iconCircle: {
      width: CARD_WIDTH * 0.45,
      aspectRatio: 1,
      borderRadius: (CARD_WIDTH * 0.45) / 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: themedColors.background,
      borderWidth: 1,
      borderColor: 'rgba(148, 163, 184, 0.6)',
    },
    allFaultsIconCircle: {
      backgroundColor: 'rgba(255,255,255,0.14)',
      borderColor: 'rgba(255,255,255,0.3)',
    },
    iconText: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
    },
    allFaultsIconText: {
      color: '#FFFFFF',
    },
  });

  const renderItem = ({item, index}: {item: HomeTile; index: number}) => {
    const isLastInRow = (index + 1) % NUM_COLUMNS === 0;

    const cardStyle = [
      dynamicStyles.card,
      isLastInRow && {marginRight: 0},
      item.type === 'allFaults' && dynamicStyles.allFaultsCard,
    ];

    if (item.type === 'allFaults') {
      return (
        <TouchableOpacity
          key={item.id}
          style={cardStyle}
          onPress={() => navigation.navigate('SearchHome')}>
          <View
            style={[
              dynamicStyles.iconCircle,
              dynamicStyles.allFaultsIconCircle,
            ]}>
            <Text style={[dynamicStyles.iconText, dynamicStyles.allFaultsIconText]}>
              #
            </Text>
          </View>
          <Text style={dynamicStyles.allFaultsLabel}>{item.label}</Text>
        </TouchableOpacity>
      );
    }

    const brandName = item.brand.name;
    const initials = brandName
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();

    return (
      <TouchableOpacity
        key={item.id}
        style={cardStyle}
        onPress={() =>
          navigation.navigate('BrandModels', {
            brandId: item.brand.id,
            brandName: item.brand.name,
          })
        }>
        <View style={dynamicStyles.iconCircle}>
          <Text style={dynamicStyles.iconText}>{initials}</Text>
        </View>
        <Text style={dynamicStyles.brandLabel}>{brandName}</Text>
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


