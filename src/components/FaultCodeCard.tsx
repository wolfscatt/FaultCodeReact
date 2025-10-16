/**
 * FaultCodeCard Component
 * Displays a fault code in a card format for list views
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {FaultCode} from '@data/types';
import {colors, spacing, borderRadius, typography, shadows} from '@theme/tokens';
import {useTheme} from '@theme/useTheme';

type Props = {
  fault: FaultCode;
  onPress: () => void;
};

export default function FaultCodeCard({fault, onPress}: Props) {
  const {colors: themedColors} = useTheme();
  
  const severityColor =
    fault.severity === 'critical'
      ? colors.severity.critical
      : fault.severity === 'warning'
      ? colors.severity.warning
      : colors.severity.info;

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: themedColors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: themedColors.border,
      ...shadows.md,
    },
    code: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
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
      lineHeight: 20,
    },
  });

  return (
    <TouchableOpacity style={dynamicStyles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={dynamicStyles.code}>{fault.code}</Text>
        <View style={[styles.badge, {backgroundColor: severityColor}]}>
          <Text style={styles.badgeText}>{fault.severity}</Text>
        </View>
      </View>
      <Text style={dynamicStyles.title} numberOfLines={2}>
        {fault.title}
      </Text>
      <Text style={dynamicStyles.summary} numberOfLines={3}>
        {fault.summary}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
});

