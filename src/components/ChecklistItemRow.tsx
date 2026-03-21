import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { ChecklistStatus } from '../models/ChecklistItem';

interface ChecklistItemRowProps {
  descricao: string;
  conforme: ChecklistStatus;
  observacao: string;
  onToggle: () => void;
  onPress: () => void;
}

export function ChecklistItemRow({ descricao, conforme, onToggle, onPress }: ChecklistItemRowProps) {
  const getIcon = () => {
    switch (conforme) {
      case 1: return 'checkbox-marked';
      case 2: return 'close-box';
      default: return 'checkbox-blank-outline';
    }
  };

  const getColor = () => {
    switch (conforme) {
      case 1: return COLORS.success;
      case 2: return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getBadge = () => {
    if (conforme === 1) return <View style={[styles.badge, { backgroundColor: COLORS.success }]}><Text style={styles.badgeText}>Conforme</Text></View>;
    if (conforme === 2) return <View style={[styles.badge, { backgroundColor: COLORS.error }]}><Text style={styles.badgeText}>Não Conforme</Text></View>;
    return null;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
        <MaterialCommunityIcons name={getIcon()} size={24} color={getColor()} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.descricao}>{descricao}</Text>
        {getBadge()}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  checkbox: {
    marginRight: SPACING.sm,
    padding: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  descricao: {
    ...FONTS.regular,
    flex: 1,
    marginRight: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '600',
  },
});
