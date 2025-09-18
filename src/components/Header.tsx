import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onSearchPress,
  onProfilePress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>LX</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.headerButton} onPress={onSearchPress}>
          <Ionicons name="search-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onProfilePress}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
});

export default Header;
