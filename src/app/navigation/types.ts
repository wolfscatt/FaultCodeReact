/**
 * Navigation type definitions
 * Provides type-safe navigation throughout the app
 */

import type {StackScreenProps} from '@react-navigation/stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';

// Root Stack (modals, etc.)
export type RootStackParamList = {
  MainTabs: undefined;
  Paywall: undefined;
};

// Main Bottom Tabs
export type MainTabsParamList = {
  SearchTab: undefined;
  SettingsTab: undefined;
};

// Search Stack
export type SearchStackParamList = {
  SearchHome: undefined;
  FaultDetail: {faultId: string};
};

// Type helpers for screens
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabsScreenProps<T extends keyof MainTabsParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type SearchStackScreenProps<T extends keyof SearchStackParamList> = CompositeScreenProps<
  StackScreenProps<SearchStackParamList, T>,
  MainTabsScreenProps<keyof MainTabsParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

