import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showHome?: boolean;
  onHome?: () => void;
}

export function Header({ title, showBack, onBack, showHome, onHome }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.surface} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {showHome && (
          <TouchableOpacity onPress={onHome} style={styles.iconButton}>
            <MaterialCommunityIcons name="home" size={24} color={COLORS.surface} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...FONTS.header,
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
