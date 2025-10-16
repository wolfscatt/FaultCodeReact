/**
 * Search Stack Navigator
 * Handles search and fault detail screens
 */

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {SearchStackParamList} from './types';
import SearchHomeScreen from '../screens/SearchHomeScreen';
import FaultDetailScreen from '../screens/FaultDetailScreen';

const Stack = createStackNavigator<SearchStackParamList>();

export default function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#111827',
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

