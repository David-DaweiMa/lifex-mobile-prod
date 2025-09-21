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

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Privacy Policy" 
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
          
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.text}>
            We collect information you provide directly to us, such as when you create an account, 
            use our services, or contact us for support.
          </Text>
          
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.text}>
            We use the information we collect to provide, maintain, and improve our services, 
            including personalized recommendations and customer support.
          </Text>
          
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.text}>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </Text>
          
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.text}>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </Text>
          
          <Text style={styles.sectionTitle}>5. Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about this Privacy Policy, please contact us at:
            {'\n'}Email: privacy@lifex.co.nz
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

export default PrivacyPolicyScreen;
