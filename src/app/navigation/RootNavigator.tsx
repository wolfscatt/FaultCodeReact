/**
 * Root Navigator
 * Main navigation entry point with auth, modals, and main app
 */

import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from './types';
import {useUserStore} from '@state/useUserStore';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const {isInitialized, isLoggedIn} = useUserStore();

  // Show loading screen while checking for existing session
  if (!isInitialized) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'}}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
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

