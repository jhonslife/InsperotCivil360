import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import { GRAVIDADE_LABELS, Gravidade } from '../constants/inspectionTypes';

const SEVERITY_COLORS: Record<Gravidade, string> = {
  baixa: COLORS.success,
  media: COLORS.warning,
  alta: COLORS.error,
};

interface SeverityBadgeProps {
  gravidade: Gravidade;
}

export function SeverityBadge({ gravidade }: SeverityBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[gravidade] + '20' }]}>
      <View style={[styles.dot, { backgroundColor: SEVERITY_COLORS[gravidade] }]} />
      <Text style={[styles.text, { color: SEVERITY_COLORS[gravidade] }]}>
        {GRAVIDADE_LABELS[gravidade]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
