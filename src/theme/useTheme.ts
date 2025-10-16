/**
 * useTheme hook
 * Provides theme-aware values based on current theme setting
 */

import {usePrefsStore, Theme} from '@state/usePrefsStore';
import {colors} from './tokens';

type ThemedColors = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  severity: {
    info: string;
    warning: string;
    critical: string;
  };
};

/**
 * Hook to get theme-aware color values
 * Severity colors remain consistent across light/dark modes for clarity and accessibility
 */
export const useTheme = (): {theme: Theme; colors: ThemedColors} => {
  const theme = usePrefsStore(state => state.theme);

  const themedColors: ThemedColors = {
    background: theme === 'light' ? colors.light.background : colors.dark.background,
    surface: theme === 'light' ? colors.light.surface : colors.dark.surface,
    text: theme === 'light' ? colors.light.text : colors.dark.text,
    textSecondary: theme === 'light' ? colors.light.textSecondary : colors.dark.textSecondary,
    border: theme === 'light' ? colors.light.border : colors.dark.border,
    primary: colors.primary[600],
    // Severity colors are consistent across themes for instant recognition
    severity: {
      info: colors.severity.info,
      warning: colors.severity.warning,
      critical: colors.severity.critical,
    },
  };

  return {
    theme,
    colors: themedColors,
  };
};

