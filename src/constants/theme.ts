export const COLORS = {
  primary: '#1B3A5C',
  secondary: '#2E5C8A',
  accent: '#E8762B',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
  disabled: '#9CA3AF',
  overlay: 'rgba(0,0,0,0.5)',
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
