import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

const VerifyEmailScreen: React.FC<any> = ({ route, navigation }) => {
  const email = route?.params?.email;

  const goBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Confirm your email</Text>
        <Text style={styles.description}>
          {email
            ? `We sent a verification link to ${email}.`
            : 'We sent a verification link to your email address.'}
        </Text>
        <Text style={styles.description}>Please check your inbox and follow the instructions.</Text>

        <TouchableOpacity style={styles.button} onPress={goBackToLogin}>
          <Text style={styles.buttonText}>Back to login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default VerifyEmailScreen;



