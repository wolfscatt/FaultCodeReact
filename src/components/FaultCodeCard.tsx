/**
 * FaultCodeCard Component
 * Displays a fault code in a card format for list views
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {FaultCode} from '@data/types';
import {colors, spacing, borderRadius, typography, shadows} from '@theme/tokens';

type Props = {
  fault: FaultCode;
  onPress: () => void;
};

export default function FaultCodeCard({fault, onPress}: Props) {
  const severityColor =
    fault.severity === 'critical'
      ? colors.severity.critical
      : fault.severity === 'warning'
      ? colors.severity.warning
      : colors.severity.info;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.code}>{fault.code}</Text>
        <View style={[styles.badge, {backgroundColor: severityColor}]}>
          <Text style={styles.badgeText}>{fault.severity}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {fault.title}
      </Text>
      <Text style={styles.summary} numberOfLines={3}>
        {fault.summary}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  code: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
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
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  summary: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
});

