/**
 * Profile Screen
 * Shows user information, plan details, and logout option
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useUserStore} from '@state/useUserStore';
import type {RootStackParamList} from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    isLoggedIn,
    email,
    plan,
    dailyQuotaUsed,
    dailyQuotaLimit,
    logout,
    upgradeToPro,
  } = useUserStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.navigate('Login');
        },
      },
    ]);
  };

  const handleUpgrade = async () => {
    Alert.alert(
      'Upgrade to Pro',
      'This is a demo. In production, this would integrate with payment processing.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Upgrade (Mock)',
          onPress: async () => {
            await upgradeToPro();
            Alert.alert('Success', 'Upgraded to Pro plan!');
          },
        },
      ],
    );
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  // Guest view
  if (!isLoggedIn) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center px-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Sign In Required
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Create an account or sign in to access your profile and unlock all
          features.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 py-3 px-8 rounded-lg"
          onPress={goToLogin}>
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Logged in view
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-6 py-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile
          </Text>
          <Text className="text-lg text-gray-600 dark:text-gray-400">
            Manage your account
          </Text>
        </View>

        {/* Account Information */}
        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Email
          </Text>
          <Text className="text-lg text-gray-900 dark:text-white">{email}</Text>
        </View>

        {/* Plan Information */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Subscription Plan
          </Text>
          <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Plan
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  plan === 'pro'
                    ? 'bg-yellow-500'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}>
                <Text
                  className={`font-semibold ${
                    plan === 'pro'
                      ? 'text-gray-900'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                  {plan === 'pro' ? 'Pro' : 'Free'}
                </Text>
              </View>
            </View>

            {plan === 'free' && (
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Daily Quota
                </Text>
                <Text className="text-lg text-gray-900 dark:text-white">
                  {dailyQuotaUsed} / {dailyQuotaLimit} faults viewed today
                </Text>
                <View className="mt-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                  <View
                    className={`h-full ${
                      dailyQuotaUsed >= dailyQuotaLimit
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        (dailyQuotaUsed / dailyQuotaLimit) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </View>
              </View>
            )}

            {plan === 'free' && (
              <TouchableOpacity
                className="bg-blue-500 py-3 rounded-lg mt-2"
                onPress={handleUpgrade}>
                <Text className="text-white text-center font-semibold">
                  Upgrade to Pro
                </Text>
              </TouchableOpacity>
            )}

            {plan === 'pro' && (
              <View className="mt-2">
                <Text className="text-green-600 dark:text-green-400 font-medium">
                  ✓ Unlimited fault details
                </Text>
                <Text className="text-green-600 dark:text-green-400 font-medium">
                  ✓ Advanced search
                </Text>
                <Text className="text-green-600 dark:text-green-400 font-medium">
                  ✓ Priority support
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        {plan === 'free' && (
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Usage Stats
            </Text>
            <View className="flex-row justify-between">
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mr-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Used Today
                </Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dailyQuotaUsed}
                </Text>
              </View>
              <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ml-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Remaining
                </Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.max(0, dailyQuotaLimit - dailyQuotaUsed)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Account Actions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Actions
          </Text>
          <TouchableOpacity
            className="bg-red-500 py-4 rounded-lg"
            onPress={handleLogout}>
            <Text className="text-white text-center font-semibold text-lg">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

