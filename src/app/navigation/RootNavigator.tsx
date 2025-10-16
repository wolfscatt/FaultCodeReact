/**
 * Root Navigator
 * Main navigation entry point with modals
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from './types';
import MainTabNavigator from './MainTabNavigator';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: 'modal',
        }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Upgrade to Pro',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

