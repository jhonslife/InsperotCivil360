import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BORDER_RADIUS } from '../constants/theme';

interface StatusBadgeProps {
  status: string;
  label: string;
}

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
  conforme: { bg: '#D1FAE5', text: '#065F46' },
  nao_conforme: { bg: '#FEE2E2', text: '#991B1B' },
  pendente: { bg: '#FEF3C7', text: '#92400E' },
  ativa: { bg: '#DBEAFE', text: '#1E40AF' },
  concluida: { bg: '#D1FAE5', text: '#065F46' },
  paralisada: { bg: '#FEE2E2', text: '#991B1B' },
  aberta: { bg: '#FEE2E2', text: '#991B1B' },
  em_andamento: { bg: '#FEF3C7', text: '#92400E' },
  fechada: { bg: '#D1FAE5', text: '#065F46' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = STATUS_MAP[status] || { bg: '#F3F4F6', text: '#6B7280' };

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
