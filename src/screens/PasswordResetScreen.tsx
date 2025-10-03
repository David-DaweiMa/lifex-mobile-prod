import React, { useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthTextInput } from '../components/AuthTextInput';
import { AuthButton } from '../components/AuthButton';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';

const PasswordResetScreen: React.FC<any> = ({ navigation }) => {
  const { sendPasswordReset, clearError, error, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<string | undefined>();

  const handleReset = async () => {
    if (!email) {
      setFeedback('Please enter your email');
      return;
    }

    setFeedback(undefined);
    clearError();
    const result = await sendPasswordReset(email);

    if (result.error) {
      setFeedback(result.error);
      return;
    }

    setFeedback('Check your inbox for password reset instructions');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>Enter your email address and we’ll send you a reset link.</Text>

        <AuthTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />

        {(feedback || error) && <Text style={styles.feedback}>{feedback || error}</Text>}

        <AuthButton title="Send reset link" onPress={handleReset} loading={loading} />
        <AuthButton
          title="Back to login"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginBottom: spacing.xl,
  },
  feedback: {
    color: colors.info,
    marginBottom: spacing.md,
    fontSize: typography.fontSize.sm,
  },
});

export default PasswordResetScreen;


