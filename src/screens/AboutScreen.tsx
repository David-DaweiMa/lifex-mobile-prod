import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>About LifeX</Text>
            <Text style={styles.subtitle}>Learn more about our app</Text>
          </View>
        </View>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>LX</Text>
          <Text style={styles.appName}>LifeX</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            LifeX is your personal guide to discovering the best local businesses, 
            experiences, and hidden gems across New Zealand. Powered by AI, we provide 
            personalized recommendations tailored to your preferences and lifestyle.
          </Text>
        </View>

        <View style={styles.linksContainer}>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://lifex.nz')}
          >
            <Ionicons name="globe" size={22} color={colors.primary} />
            <Text style={styles.linkText}>Visit our website</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => Linking.openURL('https://instagram.com/lifex.nz')}
          >
            <Ionicons name="logo-instagram" size={22} color={colors.primary} />
            <Text style={styles.linkText}>Follow us on Instagram</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => Linking.openURL('mailto:hello@lifex.nz')}
          >
            <Ionicons name="mail" size={22} color={colors.primary} />
            <Text style={styles.linkText}>Contact us</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ in New Zealand</Text>
          <Text style={styles.footerText}>© 2024 LifeX. All rights reserved.</Text>
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  logo: {
    fontSize: 64,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  version: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  descriptionContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: typography.fontSize.md * 1.6,
    textAlign: 'center',
  },
  linksContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginLeft: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default AboutScreen;


