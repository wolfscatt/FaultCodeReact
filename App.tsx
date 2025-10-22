/**
 * FaultCode App
 * Entry point for the React Native application
 */

import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/app/navigation/RootNavigator';
import ThemeProvider from './src/providers/ThemeProvider';
import './src/i18n'; // Initialize i18n
import {usePrefsStore} from './src/state/usePrefsStore';
import {useUserStore} from './src/state/useUserStore';
import {initializeAds} from './src/services/AdManager';

// Ignore specific warnings during development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App(): React.JSX.Element {
  const theme = usePrefsStore(state => state.theme);
  const initialize = useUserStore(state => state.initialize);

  // Initialize auth and ads on app start
  useEffect(() => {
    initialize();
    initializeAds();
  }, [initialize]);

  // Set status bar style based on theme
  useEffect(() => {
    StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content');
  }, [theme]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <StatusBar
              barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
              backgroundColor={theme === 'dark' ? '#111827' : '#ffffff'}
            />
            <RootNavigator />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;

