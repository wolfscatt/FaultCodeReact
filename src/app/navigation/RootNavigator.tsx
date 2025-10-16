/**
 * Root Navigator
 * Main navigation entry point with auth, modals, and main app
 */

import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from './types';
import {useUserStore} from '@state/useUserStore';
import {useTheme} from '@theme/useTheme';
import {colors} from '@theme/tokens';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {isInitialized, isLoggedIn} = useUserStore();
  const {theme, colors: themedColors} = useTheme();

  // Create navigation theme based on current theme
  const navigationTheme = theme === 'dark' 
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.primary[600],
          background: themedColors.background,
          card: themedColors.surface,
          text: themedColors.text,
          border: themedColors.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary[600],
          background: themedColors.background,
          card: themedColors.surface,
          text: themedColors.text,
          border: themedColors.border,
        },
      };

  // Show loading screen while checking for existing session
  if (!isInitialized) {
    return (
      <View style={{
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: themedColors.background
      }}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: themedColors.surface,
            borderBottomColor: themedColors.border,
          },
          headerTintColor: themedColors.text,
          headerTitleStyle: {
            color: themedColors.text,
          },
        }}
        initialRouteName={isLoggedIn ? 'MainTabs' : 'MainTabs'}>
        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown: true,
            headerTitle: 'Create Account',
            headerBackTitle: 'Back',
          }}
        />

        {/* Main App */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

        {/* Modal Screens */}
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Upgrade to Pro',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Profile',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

