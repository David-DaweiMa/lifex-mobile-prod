import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = React.useState(true);
  const [locationServices, setLocationServices] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: 'location',
          label: 'Location Services',
          type: 'toggle',
          value: locationServices,
          onToggle: setLocationServices,
        },
        {
          icon: 'moon',
          label: 'Dark Mode',
          type: 'toggle',
          value: darkMode,
          onToggle: setDarkMode,
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: 'language',
          label: 'Language',
          type: 'link',
          value: 'English',
        },
        {
          icon: 'compass',
          label: 'Region',
          type: 'link',
          value: 'New Zealand',
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
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>App preferences and notifications</Text>
          </View>
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  {item.type === 'toggle' ? (
                    <Switch
                      value={item.value as boolean}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.text}
                    />
                  ) : (
                    <View style={styles.settingRight}>
                      <Text style={styles.settingValue}>{item.value as string}</Text>
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </View>
                  )}
                </View>
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
});

export default SettingsScreen;


