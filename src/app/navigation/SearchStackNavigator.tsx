/**
 * Search Stack Navigator
 * Handles search and fault detail screens
 */

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {SearchStackParamList} from './types';
import SearchHomeScreen from '../screens/SearchHomeScreen';
import FaultDetailScreen from '../screens/FaultDetailScreen';
import {useTheme} from '@theme/useTheme';

const Stack = createStackNavigator<SearchStackParamList>();

export default function SearchStackNavigator() {
  const {colors: themedColors} = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: themedColors.surface,
          borderBottomColor: themedColors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: themedColors.text,
        headerTitleStyle: {
          color: themedColors.text,
        },
      }}>
      <Stack.Screen
        name="SearchHome"
        component={SearchHomeScreen}
        options={{
          headerTitle: 'FaultCode',
        }}
      />
      <Stack.Screen
        name="FaultDetail"
        component={FaultDetailScreen}
        options={{
          headerTitle: 'Fault Details',
        }}
      />
    </Stack.Navigator>
  );
}

