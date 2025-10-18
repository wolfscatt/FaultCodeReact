/**
 * Main Tab Navigator
 * Bottom tabs for primary app navigation
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainTabsParamList} from './types';
import SearchStackNavigator from './SearchStackNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import {useTranslation} from 'react-i18next';
import {Text} from 'react-native';
import {useTheme} from '@theme/useTheme';
import {colors} from '@theme/tokens';
import {useUserStore} from '@state/useUserStore';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabNavigator() {
  const {t} = useTranslation();
  const {colors: themedColors} = useTheme();
  const {isPremium} = useUserStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3366FF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: t('navigation.search'),
          tabBarIcon: ({color, size}) => <Text style={{color, fontSize: size || 20}}>🔍</Text>,
        }}
      />
      {isPremium() && (
        <Tab.Screen
          name="FavoritesTab"
          component={FavoritesScreen}
          options={{
            tabBarLabel: t('navigation.favorites'),
            tabBarIcon: ({color, size}) => <Text style={{color, fontSize: size || 20}}>⭐</Text>,
          }}
        />
      )}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('navigation.settings'),
          tabBarIcon: ({color, size}) => <Text style={{color, fontSize: size || 20}}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

