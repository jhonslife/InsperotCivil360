import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BORDER_RADIUS, FONTS, SPACING } from '../constants/theme';

interface FormNoticeProps {
  title: string;
  message: string;
  tone?: 'info' | 'warning' | 'success';
}

const TONE_STYLES = {
  info: {
    icon: 'information-outline',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    iconColor: '#1D4ED8',
    titleColor: '#1E3A8A',
    textColor: '#1E40AF',
  },
  warning: {
    icon: 'alert-outline',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    iconColor: '#B45309',
    titleColor: '#92400E',
    textColor: '#B45309',
  },
  success: {
    icon: 'check-circle-outline',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    iconColor: '#047857',
    titleColor: '#065F46',
    textColor: '#047857',
  },
} as const;

export function FormNotice({ title, message, tone = 'info' }: FormNoticeProps) {
  const palette = TONE_STYLES[tone];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor },
      ]}
    >
      <MaterialCommunityIcons name={palette.icon as any} size={20} color={palette.iconColor} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: palette.titleColor }]}>{title}</Text>
        <Text style={[styles.message, { color: palette.textColor }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  title: {
    ...FONTS.medium,
    fontSize: 14,
    marginBottom: 2,
  },
  message: {
    ...FONTS.small,
    fontSize: 12,
    lineHeight: 18,
  },
});