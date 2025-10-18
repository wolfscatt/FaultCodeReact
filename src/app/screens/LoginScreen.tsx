/**
 * Login Screen
 * User authentication with email and password
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

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {login, isLoading} = useUserStore();
  const {colors: themedColors} = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      // Navigate to main app
      navigation.navigate('MainTabs');
    } else {
      Alert.alert('Login Failed', result.error || 'Please try again');
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
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
    guestContainer: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: themedColors.border,
    },
    guestButton: {
      paddingVertical: spacing.md,
    },
    guestText: {
      textAlign: 'center',
      color: themedColors.textSecondary,
      fontSize: typography.sizes.base,
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your account</Text>
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
        <View style={styles.inputContainerLarge}>
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
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account? </Text>
          <TouchableOpacity onPress={goToRegister} disabled={isLoading}>
            <Text style={styles.linkButton}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Option */}
        <View style={styles.guestContainer}>
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.navigate('MainTabs')}
            disabled={isLoading}>
            <Text style={styles.guestText}>
              Continue as Guest (Limited Features)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

