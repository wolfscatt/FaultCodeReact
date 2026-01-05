/**
 * Search Stack Navigator
 * Handles search and fault detail screens
 */

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {SearchStackParamList} from './types';
import HomeScreen from '../screens/HomeScreen';
import SearchHomeScreen from '../screens/SearchHomeScreen';
import BrandModelsScreen from '../screens/BrandModelsScreen';
import BrandFaultsScreen from '../screens/BrandFaultsScreen';
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
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'FaultCode',
        }}
      />
      <Stack.Screen
        name="SearchHome"
        component={SearchHomeScreen}
        options={{
          headerTitle: 'FaultCode',
        }}
      />
      <Stack.Screen
        name="BrandModels"
        component={BrandModelsScreen}
        options={({route}) => ({
          headerTitle: route.params.brandName,
        })}
      />
      <Stack.Screen
        name="BrandFaults"
        component={BrandFaultsScreen}
        options={({route}) => ({
          headerTitle: route.params.modelName || route.params.brandName,
        })}
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

