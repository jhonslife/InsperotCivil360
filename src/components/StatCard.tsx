import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, SHADOWS, BORDER_RADIUS } from '../constants/theme';

interface StatCardProps {
  value: number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    marginHorizontal: 4,
    ...SHADOWS.small,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.surface,
  },
  label: {
    fontSize: 10,
    color: '#B0C4DE',
    textAlign: 'center',
    marginTop: 2,
  },
});
