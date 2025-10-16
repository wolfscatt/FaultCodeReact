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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useUserStore} from '@state/useUserStore';
import type {RootStackParamList} from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {register, isLoading} = useUserStore();

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24}}
        keyboardShouldPersistTaps="handled">
        <View className="mb-10">
          <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create Account
          </Text>
          <Text className="text-lg text-gray-600 dark:text-gray-400">
            Sign up to get started
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700"
            placeholder="your.email@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!isLoading}
          />
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            At least 6 characters
          </Text>
        </View>

        {/* Confirm Password Input */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
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
          className={`bg-blue-500 py-4 rounded-lg mb-4 ${
            isLoading ? 'opacity-50' : ''
          }`}
          onPress={handleRegister}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
            <Text className="text-blue-500 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy */}
        <View className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Text className="text-center text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{'\n'}
            Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

