/**
 * Preferences Store
 * Manages user preferences like language, theme, and privacy settings
 */

import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

export type Language = 'en' | 'tr';
export type Theme = 'light' | 'dark';

type PrefsState = {
  // Localization
  language: Language;

  // Appearance
  theme: Theme;

  // Privacy
  analyticsOptIn: boolean;

  // Actions
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setAnalyticsOptIn: (optIn: boolean) => void;
  toggleTheme: () => void;
};

/**
 * Preferences store
 * In production, this would be persisted to AsyncStorage
 */
export const usePrefsStore = create<PrefsState>()(
  immer(set => ({
    // Initial state
    language: 'en',
    theme: 'light',
    analyticsOptIn: false,

    // Set language
    setLanguage: lang =>
      set(state => {
        state.language = lang;
      }),

    // Set theme
    setTheme: theme =>
      set(state => {
        state.theme = theme;
      }),

    // Toggle between light and dark
    toggleTheme: () =>
      set(state => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
      }),

    // Set analytics opt-in
    setAnalyticsOptIn: optIn =>
      set(state => {
        state.analyticsOptIn = optIn;
      }),
  })),
);

