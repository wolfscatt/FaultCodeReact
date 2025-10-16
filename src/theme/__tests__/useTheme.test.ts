/**
 * useTheme Hook Tests
 * Tests for theme-aware color values and severity color consistency
 */

import {renderHook} from '@testing-library/react-native';
import {useTheme} from '../useTheme';
import {usePrefsStore} from '@state/usePrefsStore';
import {colors} from '../tokens';

describe('useTheme', () => {
  beforeEach(() => {
    // Reset theme to light before each test
    usePrefsStore.getState().setTheme('light');
  });

  describe('Light Theme', () => {
    it('should return light theme colors', () => {
      usePrefsStore.getState().setTheme('light');
      
      const {result} = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('light');
      expect(result.current.colors.background).toBe(colors.light.background);
      expect(result.current.colors.surface).toBe(colors.light.surface);
      expect(result.current.colors.text).toBe(colors.light.text);
      expect(result.current.colors.textSecondary).toBe(colors.light.textSecondary);
      expect(result.current.colors.border).toBe(colors.light.border);
    });

    it('should return primary color', () => {
      const {result} = renderHook(() => useTheme());
      expect(result.current.colors.primary).toBe(colors.primary[600]);
    });
  });

  describe('Dark Theme', () => {
    it('should return dark theme colors', () => {
      usePrefsStore.getState().setTheme('dark');
      
      const {result} = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('dark');
      expect(result.current.colors.background).toBe(colors.dark.background);
      expect(result.current.colors.surface).toBe(colors.dark.surface);
      expect(result.current.colors.text).toBe(colors.dark.text);
      expect(result.current.colors.textSecondary).toBe(colors.dark.textSecondary);
      expect(result.current.colors.border).toBe(colors.dark.border);
    });

    it('should return primary color', () => {
      usePrefsStore.getState().setTheme('dark');
      
      const {result} = renderHook(() => useTheme());
      expect(result.current.colors.primary).toBe(colors.primary[600]);
    });
  });

  describe('Severity Colors Consistency', () => {
    it('should have consistent info color in light mode', () => {
      usePrefsStore.getState().setTheme('light');
      
      const {result} = renderHook(() => useTheme());
      expect(result.current.colors.severity.info).toBe(colors.severity.info);
    });

    it('should have consistent info color in dark mode', () => {
      usePrefsStore.getState().setTheme('dark');
      
      const {result} = renderHook(() => useTheme());
      expect(result.current.colors.severity.info).toBe(colors.severity.info);
    });

    it('should have consistent warning color in light mode', () => {
      usePrefsStore.getState().setTheme('light');
      
      const {result} = renderHook(() => useTheme());
      expect(result.current.colors.severity.warning).toBe(colors.severity.warning);
    });

    it('should have consistent warning color in dark mode', () => {
      usePrefsStore.getState().setTheme('dark');
      
      const {result} = renderHook(() => useTheme());
      expect(result.current.colors.severity.warning).toBe(colors.severity.warning);
    });

    it('should have consistent critical color in light mode', () => {
      usePrefsStore.getState().setTheme('light');
      
      const {result} = renderHook(() => useTheme());
      expect(result.current.colors.severity.critical).toBe(colors.severity.critical);
    });

    it('should have consistent critical color in dark mode', () => {
      usePrefsStore.getState().setTheme('dark');
      
      const {result} = renderHook(() => useTheme());
      expect(result.current.colors.severity.critical).toBe(colors.severity.critical);
    });

    it('should have identical severity colors across light and dark themes', () => {
      // Get light theme colors
      usePrefsStore.getState().setTheme('light');
      const {result: lightResult} = renderHook(() => useTheme());
      const lightSeverity = lightResult.current.colors.severity;
      
      // Get dark theme colors
      usePrefsStore.getState().setTheme('dark');
      const {result: darkResult} = renderHook(() => useTheme());
      const darkSeverity = darkResult.current.colors.severity;
      
      // All severity colors should be identical
      expect(lightSeverity.info).toBe(darkSeverity.info);
      expect(lightSeverity.warning).toBe(darkSeverity.warning);
      expect(lightSeverity.critical).toBe(darkSeverity.critical);
    });

    it('should have all three severity colors defined', () => {
      const {result} = renderHook(() => useTheme());
      
      expect(result.current.colors.severity.info).toBeDefined();
      expect(result.current.colors.severity.warning).toBeDefined();
      expect(result.current.colors.severity.critical).toBeDefined();
    });
  });

  describe('Theme Switching', () => {
    it('should update colors when theme changes', () => {
      const {result, rerender} = renderHook(() => useTheme());
      
      // Initially light
      expect(result.current.theme).toBe('light');
      expect(result.current.colors.background).toBe(colors.light.background);
      
      // Switch to dark
      usePrefsStore.getState().setTheme('dark');
      rerender(undefined);
      
      expect(result.current.theme).toBe('dark');
      expect(result.current.colors.background).toBe(colors.dark.background);
    });

    it('should maintain severity colors when theme changes', () => {
      const {result, rerender} = renderHook(() => useTheme());
      
      // Light theme severity colors
      const lightSeverityInfo = result.current.colors.severity.info;
      const lightSeverityWarning = result.current.colors.severity.warning;
      const lightSeverityCritical = result.current.colors.severity.critical;
      
      // Switch to dark
      usePrefsStore.getState().setTheme('dark');
      rerender(undefined);
      
      // Dark theme severity colors should be the same
      expect(result.current.colors.severity.info).toBe(lightSeverityInfo);
      expect(result.current.colors.severity.warning).toBe(lightSeverityWarning);
      expect(result.current.colors.severity.critical).toBe(lightSeverityCritical);
    });
  });

  describe('Color Contrast', () => {
    it('should have different background colors for light and dark', () => {
      expect(colors.light.background).not.toBe(colors.dark.background);
    });

    it('should have different text colors for light and dark', () => {
      expect(colors.light.text).not.toBe(colors.dark.text);
    });

    it('should have light text in dark mode and dark text in light mode', () => {
      // Light mode should have dark text
      usePrefsStore.getState().setTheme('light');
      const {result: lightResult} = renderHook(() => useTheme());
      expect(lightResult.current.colors.text).toBe(colors.gray[900]); // Dark text
      
      // Dark mode should have light text
      usePrefsStore.getState().setTheme('dark');
      const {result: darkResult} = renderHook(() => useTheme());
      expect(darkResult.current.colors.text).toBe(colors.gray[50]); // Light text
    });
  });
});

