import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { colors, spacing, typography } from '../constants/theme';

const TermsOfServiceScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Terms of Service" 
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
          
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using LifeX mobile application, you accept and agree to be bound by 
            the terms and provision of this agreement.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.text}>
            Permission is granted to temporarily use LifeX for personal, non-commercial transitory 
            viewing only. This is the grant of a license, not a transfer of title.
          </Text>
          
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.text}>
            When you create an account with us, you must provide information that is accurate, 
            complete, and current at all times.
          </Text>
          
          <Text style={styles.sectionTitle}>4. Prohibited Uses</Text>
          <Text style={styles.text}>
            You may not use our service for any unlawful purpose or to solicit others to perform 
            unlawful acts.
          </Text>
          
          <Text style={styles.sectionTitle}>5. Content</Text>
          <Text style={styles.text}>
            Our service allows you to post, link, store, share and otherwise make available 
            certain information, text, graphics, videos, or other material.
          </Text>
          
          <Text style={styles.sectionTitle}>6. Contact Information</Text>
          <Text style={styles.text}>
            If you have any questions about these Terms of Service, please contact us at:
            {'\n'}Email: legal@lifex.co.nz
            {'\n'}Address: Auckland, New Zealand
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  lastUpdated: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
});

export default TermsOfServiceScreen;
