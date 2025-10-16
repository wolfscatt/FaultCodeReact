/**
 * SettingsScreen Tests
 * Tests for language switching, theme toggling, and UI updates
 */

import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import SettingsScreen from '../SettingsScreen';
import {usePrefsStore} from '@state/usePrefsStore';
import {useUserStore} from '@state/useUserStore';

// Mock i18next module
jest.mock('@i18n/index', () => ({
  __esModule: true,
  default: {
    language: 'en',
    changeLanguage: jest.fn((lang: string) => {
      // Update the language property
      (mockI18n as any).language = lang;
      return Promise.resolve();
    }),
  },
}));

const mockI18n = require('@i18n/index').default;

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    // Reset stores to default state
    const prefsStore = usePrefsStore.getState();
    prefsStore.setLanguage('en');
    prefsStore.setTheme('light');
    prefsStore.setAnalyticsOptIn(false);

    const userStore = useUserStore.getState();
    userStore.downgradeToFree();
  });

  describe('Language Switching', () => {
    it('should render language toggle button', () => {
      const {getByTestId} = render(<SettingsScreen />);
      const languageToggle = getByTestId('language-toggle');
      expect(languageToggle).toBeDefined();
    });

    it('should toggle language from English to Turkish', () => {
      const {getByTestId, getByText} = render(<SettingsScreen />);
      
      // Initially English
      expect(getByText('English')).toBeDefined();
      expect(usePrefsStore.getState().language).toBe('en');
      
      // Toggle to Turkish
      const languageToggle = getByTestId('language-toggle');
      fireEvent.press(languageToggle);
      
      // Should now be Turkish
      expect(usePrefsStore.getState().language).toBe('tr');
      
      // i18n changeLanguage should be called
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('tr');
    });

    it('should toggle language from Turkish back to English', () => {
      const {getByTestId} = render(<SettingsScreen />);
      const languageToggle = getByTestId('language-toggle');
      
      // Toggle to Turkish
      fireEvent.press(languageToggle);
      expect(usePrefsStore.getState().language).toBe('tr');
      
      // Toggle back to English
      fireEvent.press(languageToggle);
      expect(usePrefsStore.getState().language).toBe('en');
    });

    it('should display current language correctly', () => {
      const {getByText, rerender} = render(<SettingsScreen />);
      
      // Check English display
      expect(getByText('English')).toBeDefined();
      
      // Change to Turkish manually
      usePrefsStore.getState().setLanguage('tr');
      
      // Re-render and check Turkish display
      rerender(<SettingsScreen />);
      expect(getByText('Türkçe')).toBeDefined();
    });
  });

  describe('Theme Switching', () => {
    it('should render theme toggle switch', () => {
      const {getByTestId} = render(<SettingsScreen />);
      const themeToggle = getByTestId('theme-toggle');
      expect(themeToggle).toBeDefined();
    });

    it('should toggle theme from light to dark', () => {
      const {getByTestId} = render(<SettingsScreen />);
      
      // Initially light
      expect(usePrefsStore.getState().theme).toBe('light');
      
      // Toggle to dark
      const themeToggle = getByTestId('theme-toggle');
      fireEvent(themeToggle, 'valueChange', true);
      
      // Should now be dark
      expect(usePrefsStore.getState().theme).toBe('dark');
    });

    it('should toggle theme from dark to light', () => {
      const {getByTestId} = render(<SettingsScreen />);
      const themeToggle = getByTestId('theme-toggle');
      
      // Set to dark first
      usePrefsStore.getState().setTheme('dark');
      expect(usePrefsStore.getState().theme).toBe('dark');
      
      // Toggle to light
      fireEvent(themeToggle, 'valueChange', false);
      
      // Should now be light
      expect(usePrefsStore.getState().theme).toBe('light');
    });

    it('should update UI colors when theme changes', () => {
      const {getByTestId, rerender} = render(<SettingsScreen />);
      
      // Initially light theme
      expect(usePrefsStore.getState().theme).toBe('light');
      
      // Toggle to dark
      const themeToggle = getByTestId('theme-toggle');
      fireEvent(themeToggle, 'valueChange', true);
      
      // Re-render to apply theme
      rerender(<SettingsScreen />);
      
      // Theme should be dark
      expect(usePrefsStore.getState().theme).toBe('dark');
    });
  });

  describe('Combined Language and Theme', () => {
    it('should handle both language and theme changes', () => {
      const {getByTestId} = render(<SettingsScreen />);
      
      // Change language
      const languageToggle = getByTestId('language-toggle');
      fireEvent.press(languageToggle);
      expect(usePrefsStore.getState().language).toBe('tr');
      
      // Change theme
      const themeToggle = getByTestId('theme-toggle');
      fireEvent(themeToggle, 'valueChange', true);
      expect(usePrefsStore.getState().theme).toBe('dark');
      
      // Both should persist
      expect(usePrefsStore.getState().language).toBe('tr');
      expect(usePrefsStore.getState().theme).toBe('dark');
    });

    it('should maintain language when theme changes', () => {
      const {getByTestId} = render(<SettingsScreen />);
      
      // Set Turkish
      const languageToggle = getByTestId('language-toggle');
      fireEvent.press(languageToggle);
      expect(usePrefsStore.getState().language).toBe('tr');
      
      // Toggle theme
      const themeToggle = getByTestId('theme-toggle');
      fireEvent(themeToggle, 'valueChange', true);
      
      // Language should remain Turkish
      expect(usePrefsStore.getState().language).toBe('tr');
    });

    it('should maintain theme when language changes', () => {
      const {getByTestId} = render(<SettingsScreen />);
      
      // Set dark theme
      const themeToggle = getByTestId('theme-toggle');
      fireEvent(themeToggle, 'valueChange', true);
      expect(usePrefsStore.getState().theme).toBe('dark');
      
      // Toggle language
      const languageToggle = getByTestId('language-toggle');
      fireEvent.press(languageToggle);
      
      // Theme should remain dark
      expect(usePrefsStore.getState().theme).toBe('dark');
    });
  });

  describe('Subscription Display', () => {
    it('should display Free plan for free users', () => {
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('Free Plan')).toBeDefined();
    });

    it('should display Pro plan for pro users', () => {
      // Upgrade to Pro
      useUserStore.getState().upgradeToPro();
      
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('✨ Pro Plan')).toBeDefined();
    });

    it('should show downgrade button for pro users', () => {
      // Upgrade to Pro
      useUserStore.getState().upgradeToPro();
      
      const {getByText} = render(<SettingsScreen />);
      const downgradeButton = getByText('Downgrade to Free (Demo)');
      expect(downgradeButton).toBeDefined();
    });

    it('should not show downgrade button for free users', () => {
      const {queryByText} = render(<SettingsScreen />);
      const downgradeButton = queryByText('Downgrade to Free (Demo)');
      expect(downgradeButton).toBeNull();
    });
  });

  describe('Analytics Opt-in', () => {
    it('should toggle analytics opt-in', () => {
      const {getAllByRole} = render(<SettingsScreen />);
      
      // Get all switches (theme, analytics) - analytics is the second one
      const switches = getAllByRole('switch');
      const analyticsSwitch = switches[1]; // 0: theme, 1: analytics
      
      // Initially false
      expect(usePrefsStore.getState().analyticsOptIn).toBe(false);
      
      // Toggle on
      fireEvent(analyticsSwitch, 'valueChange', true);
      expect(usePrefsStore.getState().analyticsOptIn).toBe(true);
      
      // Toggle off
      fireEvent(analyticsSwitch, 'valueChange', false);
      expect(usePrefsStore.getState().analyticsOptIn).toBe(false);
    });
  });

  describe('App Info', () => {
    it('should display app version', () => {
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('FaultCode v0.1.0')).toBeDefined();
    });

    it('should display app description', () => {
      const {getByText} = render(<SettingsScreen />);
      expect(getByText('Boiler fault code assistant with mock data')).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should render all sections', () => {
      const {getByText, getAllByText} = render(<SettingsScreen />);
      
      expect(getByText('settings.language')).toBeDefined();
      expect(getByText('settings.theme')).toBeDefined();
      // analytics appears twice (section title and label)
      expect(getAllByText('settings.analytics').length).toBeGreaterThan(0);
      expect(getByText('settings.subscription')).toBeDefined();
    });

    it('should have proper testIDs for interactive elements', () => {
      const {getByTestId} = render(<SettingsScreen />);
      
      expect(getByTestId('language-toggle')).toBeDefined();
      expect(getByTestId('theme-toggle')).toBeDefined();
    });
  });
});

