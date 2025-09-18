export const darkTheme = {
  background: {
    primary: '#000000',
    secondary: '#1A1625',
    card: '#1A1625',
    glass: '#8B5CF620',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    muted: '#6B7280',
  },
  neon: {
    purple: '#a855f7',
    green: '#10b981',
    yellow: '#f59e0b',
  },
  gradients: {
    background: 'linear-gradient(135deg, #000000 0%, #1A1625 100%)',
  },
};

export const colors = {
  primary: '#a855f7',
  secondary: '#10b981',
  accent: '#f59e0b',
  background: '#000000',
  surface: '#1A1625',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#8B5CF620',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};
