/**
 * Theme Provider
 * Applies global theme (dark/light) to all components using NativeWind
 */

import React, {useEffect} from 'react';
import {View, useColorScheme} from 'react-native';
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
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({children}: ThemeProviderProps) {
  const theme = usePrefsStore(state => state.theme);
  const systemColorScheme = useColorScheme();

  // Use user preference, fallback to system preference
  const activeColorScheme = theme || systemColorScheme || 'light';

  return (
    <View
      style={{flex: 1}}
      className={activeColorScheme === 'dark' ? 'dark' : ''}>
      {children}
    </View>
  );
}

export default ThemeProvider;

