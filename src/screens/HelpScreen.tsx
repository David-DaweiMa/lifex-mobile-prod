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

const HelpScreen: React.FC = () => {
  const navigation = useNavigation();

  const helpSections = [
    {
      title: 'Contact Us',
      items: [
        {
          icon: 'mail',
          label: 'Email Support',
          description: 'support@lifex.nz',
          action: () => Linking.openURL('mailto:support@lifex.nz'),
        },
        {
          icon: 'chatbubbles',
          label: 'Live Chat',
          description: 'Chat with our support team',
          action: () => console.log('Open live chat'),
        },
      ],
    },
    {
      title: 'Resources',
      items: [
        {
          icon: 'book',
          label: 'User Guide',
          description: 'Learn how to use LifeX',
          action: () => console.log('Open user guide'),
        },
        {
          icon: 'help-circle',
          label: 'FAQs',
          description: 'Frequently asked questions',
          action: () => console.log('Open FAQs'),
        },
        {
          icon: 'bug',
          label: 'Report a Bug',
          description: 'Help us improve the app',
          action: () => Linking.openURL('mailto:support@lifex.nz?subject=Bug Report'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Help & Support</Text>
            <Text style={styles.subtitle}>Get help or contact support</Text>
          </View>
        </View>

        {helpSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.helpItem}
                  onPress={item.action}
                >
                  <View style={styles.helpIcon}>
                    <Ionicons name={item.icon as any} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.helpContent}>
                    <Text style={styles.helpLabel}>{item.label}</Text>
                    <Text style={styles.helpDescription}>{item.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  helpDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
});

export default HelpScreen;


