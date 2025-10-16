/**
 * Main Tab Navigator
 * Bottom tabs for primary app navigation
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainTabsParamList} from './types';
import SearchStackNavigator from './SearchStackNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabNavigator() {
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}>
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: t('navigation.search'),
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 24}}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('navigation.settings'),
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 24}}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

