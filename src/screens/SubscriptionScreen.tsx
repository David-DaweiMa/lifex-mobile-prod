import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface SubscriptionScreenProps {
  navigation?: any;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const handleNavigateToChat = () => {
    navigation?.navigate('Chat');
  };

  const handleNavigateToMembership = () => {
    navigation?.navigate('Membership');
  };

  const handleNavigateToPrivacy = () => {
    navigation?.navigate('PrivacyPolicy');
  };

  const handleNavigateToTerms = () => {
    navigation?.navigate('TermsOfService');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Coly</Text>
          <Text style={styles.subtitle}>Your personal AI companion</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>🤖</Text>
          </View>
          <Text style={styles.heroTitle}>Meet Coly</Text>
          <Text style={styles.heroDescription}>
            Your intelligent assistant that learns your preferences and helps you discover 
            the best local businesses, deals, and experiences in New Zealand.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What Coly can do for you</Text>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>🎯</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Personalized Recommendations</Text>
              <Text style={styles.featureDescription}>
                Get suggestions tailored to your taste and preferences
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>💬</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Natural Conversations</Text>
              <Text style={styles.featureDescription}>
                Chat naturally and get instant, helpful responses
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>📱</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Mobile Optimized</Text>
              <Text style={styles.featureDescription}>
                Designed for mobile-first experience on the go
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureIconText}>🔒</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Privacy Focused</Text>
              <Text style={styles.featureDescription}>
                Your data is secure and your privacy is protected
              </Text>
            </View>
          </View>
        </View>

        {/* Current Plan */}
        <View style={styles.currentPlanContainer}>
          <Text style={styles.currentPlanTitle}>Your Current Plan</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Free Plan</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Active</Text>
              </View>
            </View>
            <Text style={styles.planDescription}>
              Limited access to basic features and recommendations
            </Text>
            <View style={styles.planLimits}>
              <Text style={styles.planLimitText}>• 5 AI conversations per day</Text>
              <Text style={styles.planLimitText}>• Basic recommendations</Text>
              <Text style={styles.planLimitText}>• Limited trending content</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleNavigateToChat}
          >
            <Text style={styles.primaryButtonText}>Start Chatting with Coly</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleNavigateToMembership}
          >
            <Text style={styles.secondaryButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialContainer}>
          <Text style={styles.testimonialText}>
            "Coly helped me discover the most amazing coffee shop in Ponsonby. 
            It's like having a local friend who knows all the best spots!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Sarah, Auckland</Text>
        </View>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
          <Text style={styles.legalText}>
            By using LifeX, you agree to our{' '}
            <Text style={styles.legalLink} onPress={handleNavigateToTerms}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={handleNavigateToPrivacy}>
              Privacy Policy
            </Text>
          </Text>
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
    marginBottom: spacing.xl,
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
  heroContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroIconText: {
    fontSize: typography.fontSize.xxxl,
  },
  heroTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  heroDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.5,
  },
  featuresContainer: {
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureIconText: {
    fontSize: typography.fontSize.xl,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.md * 1.5,
  },
  currentPlanContainer: {
    marginBottom: spacing.xl,
  },
  currentPlanTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  planBadge: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  planBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  planDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  planLimits: {
    gap: spacing.xs,
  },
  planLimitText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  actionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  testimonialContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  testimonialText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: typography.fontSize.md * 1.5,
    marginBottom: spacing.md,
  },
  testimonialAuthor: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  legalContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  legalText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.5,
  },
  legalLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default SubscriptionScreen;
