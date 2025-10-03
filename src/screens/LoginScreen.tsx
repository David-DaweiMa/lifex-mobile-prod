import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthTextInput } from '../components/AuthTextInput';
import { AuthButton } from '../components/AuthButton';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';

const LoginScreen: React.FC<any> = ({ navigation }) => {
  const { login, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setFormError('Please enter your email and password');
      return;
    }

    setFormError(undefined);
    setIsLoading(true);
    
    try {
      const result = await login(email, password);

      if (result.error) {
        setFormError(result.error);
      } else {
        // 登录成功,返回上一页
        navigation.goBack();
      }
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>
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

          <View style={styles.passwordFooter}>
            <TouchableOpacity onPress={goToForgotPassword}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {(formError || error) && <Text style={styles.error}>{formError || error}</Text>}

          <AuthButton title="Log In" onPress={handleLogin} loading={isLoading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.signupLink}>Sign up</Text>
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
    paddingTop: spacing.xxl,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  passwordFooter: {
    alignItems: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  forgotLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  signupLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default LoginScreen;


