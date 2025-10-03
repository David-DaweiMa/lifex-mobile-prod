import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthTextInput } from '../components/AuthTextInput';
import { AuthButton } from '../components/AuthButton';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';

const RegisterScreen: React.FC<any> = ({ navigation }) => {
  const { register, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      setFormError('Please enter a valid email and password');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    setFormError(undefined);
    setIsLoading(true);

    try {
      const result = await register(email, password, {
        full_name: fullName,
      });

      if (result.error) {
        setFormError(result.error);
        return;
      }

      // 注册成功,返回上一页
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create your LifeX account</Text>
          <Text style={styles.subtitle}>Start exploring curated local experiences across New Zealand</Text>
        </View>

        <View style={styles.form}>
          <AuthTextInput
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Alex Smith"
          />
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
            placeholder="Choose a strong password"
            textContentType="newPassword"
          />
          <AuthTextInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Re-enter your password"
          />

          {(formError || error) && <Text style={styles.error}>{formError || error}</Text>}

          <AuthButton title="Sign Up" onPress={handleRegister} loading={isLoading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.link}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
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
  form: {},
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginRight: spacing.xs,
  },
  link: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },
});

export default RegisterScreen;


