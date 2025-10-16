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
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: themedColors.textSecondary,
        tabBarStyle: {
          backgroundColor: themedColors.surface,
          borderTopColor: themedColors.border,
        },
      }}>
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: t('navigation.search'),
          tabBarIcon: ({color}) => <Text style={{color, fontSize: 24}}>🔍</Text>,
        }}
      />
      {isPremium() && (
        <Tab.Screen
          name="FavoritesTab"
          component={FavoritesScreen}
          options={{
            tabBarLabel: t('navigation.favorites'),
            tabBarIcon: ({color}) => <Text style={{color, fontSize: 24}}>⭐</Text>,
          }}
        />
      )}
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

