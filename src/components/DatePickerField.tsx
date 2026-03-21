import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';
import { formatDate } from '../utils/formatDate';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  error?: string | null;
}

export function DatePickerField({ label, value, onChange, error }: DatePickerFieldProps) {
  const displayValue = value ? formatDate(value) : 'Selecionar data...';

  const handlePress = () => {
    const today = new Date().toISOString().split('T')[0];
    if (!value) {
      onChange(today);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={handlePress}
      >
        <Text style={[styles.text, !value && styles.placeholder]}>
          {displayValue}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...FONTS.medium,
    fontSize: 14,
    marginBottom: SPACING.xs,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  text: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  placeholder: {
    color: COLORS.disabled,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});
