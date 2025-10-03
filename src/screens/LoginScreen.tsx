import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthTextInput } from '../components/AuthTextInput';
import { AuthButton } from '../components/AuthButton';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';

const LoginScreen: React.FC<any> = ({ navigation }) => {
  const { login, error, loading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | undefined>();

  const handleLogin = async () => {
    if (!email || !password) {
      setFormError('Please enter your email and password');
      return;
    }

    setFormError(undefined);
    const result = await login(email, password);

    if (result.error) {
      setFormError(result.error);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  const goToForgotPassword = () => {
    navigation.navigate('PasswordReset');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back to LifeX</Text>
          <Text style={styles.subtitle}>Log in to discover the best local experiences</Text>
        </View>

        <View style={styles.form}>
          <AuthTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="you@example.com"
          />
          <AuthTextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
            textContentType="password"
          />

          {(formError || error) && <Text style={styles.error}>{formError || error}</Text>}

          <AuthButton title="Log In" onPress={handleLogin} loading={loading} />

          <TouchableOpacity onPress={goToForgotPassword}>
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.link}>Sign up</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },
  form: {
    flexGrow: 1,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  link: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginRight: spacing.xs,
  },
});

export default LoginScreen;


