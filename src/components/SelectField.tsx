import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../constants/theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  error?: string | null;
}

export function SelectField({ label, value, options, onSelect, error }: SelectFieldProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || 'Selecionar...';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.select, error && styles.selectError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {selectedLabel}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.optionSelected]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[styles.optionText, item.value === value && styles.optionTextSelected]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
  },
  selectError: {
    borderColor: COLORS.error,
  },
  selectText: {
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
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    maxHeight: 400,
    ...SHADOWS.large,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: 16,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
