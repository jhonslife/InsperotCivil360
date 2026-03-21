import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants/theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  error?: string | null;
  editable?: boolean;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  error,
  editable = true,
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.inputError,
          !editable && styles.disabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.disabled}
        multiline={multiline}
        keyboardType={keyboardType}
        editable={editable}
      />
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
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  disabled: {
    backgroundColor: COLORS.background,
    color: COLORS.textSecondary,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});
