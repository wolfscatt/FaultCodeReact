/**
 * Register Screen
 * New user registration with email and password
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useUserStore} from '@state/useUserStore';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius} from '@theme/tokens';
import type {RootStackParamList} from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {register, isLoading} = useUserStore();
  const {colors: themedColors} = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const result = await register(email, password);

    if (result.success) {
      // Check if email verification is required
      if (result.requiresVerification) {
        Alert.alert(
          '✅ Registration Successful',
          'We\'ve sent a verification link to your email. Please check your inbox and verify your account before logging in.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      } else {
        // Auto-confirmed (email verification disabled)
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{name: 'MainTabs'}],
                }),
            },
          ],
        );
      }
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  // Create dynamic styles based on current theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: typography.sizes['4xl'],
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.sizes.lg,
      color: themedColors.textSecondary,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    inputContainerLarge: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      color: themedColors.text,
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: themedColors.background,
      color: themedColors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: themedColors.border,
      fontSize: typography.sizes.base,
    },
    hint: {
      fontSize: typography.sizes.xs,
      color: themedColors.textSecondary,
      marginTop: spacing.xs,
    },
    button: {
      backgroundColor: colors.primary[600],
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      opacity: isLoading ? 0.5 : 1,
    },
    buttonText: {
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: typography.weights.semibold,
      fontSize: typography.sizes.lg,
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    linkText: {
      color: themedColors.textSecondary,
      fontSize: typography.sizes.base,
    },
    linkButton: {
      color: colors.primary[600],
      fontWeight: typography.weights.semibold,
      fontSize: typography.sizes.base,
    },
    termsContainer: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: themedColors.border,
    },
    termsText: {
      textAlign: 'center',
      fontSize: typography.sizes.xs,
      color: themedColors.textSecondary,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            placeholderTextColor={themedColors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={themedColors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!isLoading}
          />
          <Text style={styles.hint}>At least 6 characters</Text>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainerLarge}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={themedColors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!isLoading}
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
            <Text style={styles.linkButton}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By creating an account, you agree to our{'\n'}
            Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

