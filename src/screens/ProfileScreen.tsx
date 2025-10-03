import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
  };

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'favorites':
        navigation.navigate('Favorites' as never);
        break;
      case 'history':
        navigation.navigate('History' as never);
        break;
      case 'subscription':
        navigation.navigate('Membership' as never);
        break;
      case 'privacy':
        navigation.navigate('PrivacyPolicy' as never);
        break;
      case 'terms':
        navigation.navigate('TermsOfService' as never);
        break;
      case 'settings':
        navigation.navigate('Settings' as never);
        break;
      case 'help':
        navigation.navigate('Help' as never);
        break;
      case 'about':
        navigation.navigate('About' as never);
        break;
      default:
        console.log(`Menu item pressed: ${itemId}`);
        break;
    }
  };

  const menuItems = [
    { id: 'favorites', title: 'Favorites', icon: '❤️', description: 'Your saved businesses and places' },
    { id: 'history', title: 'History', icon: '📜', description: 'Your past searches and recommendations' },
    { id: 'subscription', title: 'Subscription', icon: '💎', description: 'Manage your plan and upgrade features' },
    { id: 'privacy', title: 'Privacy Policy', icon: '🔒', description: 'How we protect your data' },
    { id: 'terms', title: 'Terms of Service', icon: '📋', description: 'Terms and conditions' },
    { id: 'settings', title: 'Settings', icon: '⚙️', description: 'App preferences and notifications' },
    { id: 'help', title: 'Help & Support', icon: '❓', description: 'Get help or contact support' },
    { id: 'about', title: 'About LifeX', icon: 'ℹ️', description: 'Learn more about our app' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Manage your account and preferences</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name || 'LifeX Explorer'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'Guest user'}</Text>
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>{user?.subscription_level || 'Guest Access'}</Text>
          </View>
        </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Discoveries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subscription Section */}
        <View style={styles.subscriptionContainer}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionTitle}>Subscription</Text>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Membership' as never)}
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionPlan}>Free Plan</Text>
            <Text style={styles.subscriptionDescription}>
              Limited features and recommendations
            </Text>
          </View>
          <View style={styles.subscriptionFeatures}>
            <View style={styles.subscriptionFeature}>
              <Text style={styles.subscriptionFeatureText}>• 5 AI conversations per day</Text>
            </View>
            <View style={styles.subscriptionFeature}>
              <Text style={styles.subscriptionFeatureText}>• Basic recommendations</Text>
            </View>
            <View style={styles.subscriptionFeature}>
              <Text style={styles.subscriptionFeatureText}>• Limited trending content</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        {user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.logoutButton, styles.loginButton]}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}

        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appInfoText}>LifeX v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ in New Zealand</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  userContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  userBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  userBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    justifyContent: 'space-around', // 让两列更好地分布
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  menuContainer: {
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconText: {
    fontSize: typography.fontSize.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  menuDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  menuArrow: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.bold,
  },
  subscriptionContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subscriptionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  upgradeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subscriptionInfo: {
    marginBottom: spacing.md,
  },
  subscriptionPlan: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subscriptionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  subscriptionFeatures: {
    gap: spacing.xs,
  },
  subscriptionFeature: {
    // Empty for now
  },
  subscriptionFeatureText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  loginButton: {
    borderColor: colors.primary,
  },
  logoutButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.error,
  },
  loginButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default ProfileScreen;
