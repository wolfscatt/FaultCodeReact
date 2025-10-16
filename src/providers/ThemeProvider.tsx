/**
 * Theme Provider
 * Applies global theme (dark/light) to all components using NativeWind
 */

import React, {useEffect} from 'react';
import {View, useColorScheme, Appearance} from 'react-native';
import {usePrefsStore} from '@state/usePrefsStore';

type ThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * ThemeProvider component
 * 
 * Wraps the app and applies the global color scheme for NativeWind dark mode.
 * Listens to theme changes from usePrefsStore and propagates to all child components.
 * 
 * Uses React Native's Appearance API to set the color scheme globally,
 * which makes NativeWind's dark: classes work properly.
 * 
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({children}: ThemeProviderProps) {
  const theme = usePrefsStore(state => state.theme);

  // Set the color scheme globally using React Native's Appearance API
  // This makes NativeWind's dark: classes work properly
  useEffect(() => {
    // Force the appearance to match our theme setting
    Appearance.setColorScheme(theme);
  }, [theme]);

  return (
    <View
      style={{flex: 1}}
      // Apply colorScheme to this View for NativeWind
      // @ts-ignore - colorScheme exists but TypeScript doesn't know about it
      colorScheme={theme}>
      {children}
    </View>
  );
}

export default ThemeProvider;

