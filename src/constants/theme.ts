export const COLORS = {
  primary: '#0F172A', // Deeper navy
  secondary: '#1E293B', // Slate navy
  accent: '#F59E0B', // Amber/Gold for prominence
  accentLight: '#FEF3C7',
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  text: '#0F172A',
  textPrimary: '#0F172A',
  textSecondary: '#64748B', // Slate 500
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E2E8F0', // Slate 200
  disabled: '#94A3B8',
  overlay: 'rgba(15, 23, 42, 0.6)',
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
};

export const FONTS = {
  regular: { fontSize: 14, color: COLORS.textPrimary },
  medium: { fontSize: 16, fontWeight: '500' as const, color: COLORS.textPrimary },
  bold: { fontSize: 16, fontWeight: '700' as const, color: COLORS.textPrimary },
  title: { fontSize: 20, fontWeight: '700' as const, color: COLORS.textPrimary },
  header: { fontSize: 24, fontWeight: '700' as const, color: COLORS.surface },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
