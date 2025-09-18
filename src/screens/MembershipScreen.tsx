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

interface MembershipScreenProps {
  navigation?: any;
}

const MembershipScreen: React.FC<MembershipScreenProps> = ({ navigation }) => {
  const handleNavigateBack = () => {
    navigation?.goBack();
  };

  const handleSelectPlan = (planType: string) => {
    console.log(`Selected plan: ${planType}`);
    // TODO: Implement plan selection logic
  };

  const plans = [
    {
      id: 'essential',
      name: 'Essential',
      price: '$9.99',
      period: '/month',
      description: 'Perfect for casual users',
      features: [
        '50 AI conversations per month',
        'Advanced recommendations',
        'Priority support',
        'Trending content access',
        'Deal notifications'
      ],
      popular: false,
      color: colors.primary,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$19.99',
      period: '/month',
      description: 'For power users and businesses',
      features: [
        'Unlimited AI conversations',
        'Premium recommendations',
        '24/7 priority support',
        'Full trending content',
        'Advanced analytics',
        'Custom business listings',
        'API access'
      ],
      popular: true,
      color: colors.secondary,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>Unlock the full potential of LifeX</Text>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Why upgrade?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🚀</Text>
              <Text style={styles.benefitText}>Faster AI responses</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <Text style={styles.benefitText}>More accurate recommendations</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💎</Text>
              <Text style={styles.benefitText}>Exclusive deals and offers</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📊</Text>
              <Text style={styles.benefitText}>Advanced analytics and insights</Text>
            </View>
          </View>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                plan.popular && styles.popularPlanCard
              ]}
              onPress={() => handleSelectPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.planPriceContainer}>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </View>
              </View>
              
              <Text style={styles.planDescription}>{plan.description}</Text>
              
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureIcon}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity style={[
                styles.selectButton,
                { backgroundColor: plan.color }
              ]}>
                <Text style={styles.selectButtonText}>
                  {plan.id === 'essential' ? 'Start Essential' : 'Go Premium'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>
              Yes! You can cancel your subscription at any time from your account settings.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
            <Text style={styles.faqAnswer}>
              We accept all major credit cards, PayPal, and Apple Pay.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is there a free trial?</Text>
            <Text style={styles.faqAnswer}>
              Yes! New users get a 7-day free trial of Premium features.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  benefitsContainer: {
    marginBottom: spacing.xl,
  },
  benefitsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: typography.fontSize.lg,
    marginRight: spacing.md,
  },
  benefitText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
  plansContainer: {
    marginBottom: spacing.xl,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  popularPlanCard: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  popularBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  planPeriod: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  planDescription: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  featuresContainer: {
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: typography.fontSize.md,
    color: colors.secondary,
    marginRight: spacing.md,
    fontWeight: typography.fontWeight.bold,
  },
  featureText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
  selectButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  faqContainer: {
    marginBottom: spacing.xl,
  },
  faqTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  faqItem: {
    marginBottom: spacing.lg,
  },
  faqQuestion: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  faqAnswer: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.md * 1.5,
  },
  footer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.5,
  },
});

export default MembershipScreen;
