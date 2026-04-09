import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../constants/theme';

interface StatCardProps {
  value: number | string;
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
  trend?: string;
}

export function StatCard({ value, label, icon, color = COLORS.primary }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon || 'chart-bar'} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31%', // Three columns with spacing
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  content: {
    alignItems: 'flex-start',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
