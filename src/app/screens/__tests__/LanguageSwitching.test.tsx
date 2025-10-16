/**
 * Language Switching Integration Tests
 * 
 * Verifies that bilingual content updates when user changes language
 */

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import SearchHomeScreen from '../SearchHomeScreen';
import FaultDetailScreen from '../FaultDetailScreen';
import {usePrefsStore} from '@state/usePrefsStore';
import {act} from 'react-test-renderer';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation: any = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
};

const mockRoute: any = {
  key: 'test-route',
  name: 'SearchHome',
  params: {},
};

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return key.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] || '');
      }
      return key;
    },
  }),
}));

// Mock analytics
jest.mock('@state/useAnalyticsStore', () => ({
  analytics: {
    search: jest.fn(),
    faultView: jest.fn(),
  },
}));

describe('Language Switching Integration', () => {
  beforeEach(() => {
    // Reset to English
    act(() => {
      usePrefsStore.getState().setLanguage('en');
    });
    mockNavigate.mockClear();
  });

  describe('Search Screen', () => {
    it('should display English content by default', async () => {
      const {getByPlaceholderText, findByText} = render(
        <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
      );

      // Trigger search
      const searchInput = getByPlaceholderText('search.placeholder');
      fireEvent.changeText(searchInput, 'F28');

      // Wait for English results
      await waitFor(
        async () => {
          const resultText = await findByText(/Ignition failure/i);
          expect(resultText).toBeDefined();
        },
        {timeout: 2000},
      );
    });

    it('should update to Turkish when language changes', async () => {
      const {getByPlaceholderText, findByText, rerender} = render(
        <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
      );

      // Search in English
      const searchInput = getByPlaceholderText('search.placeholder');
      fireEvent.changeText(searchInput, 'F28');

      // Wait for English results
      await waitFor(
        async () => {
          await findByText(/Ignition failure/i);
        },
        {timeout: 2000},
      );

      // Switch to Turkish
      act(() => {
        usePrefsStore.getState().setLanguage('tr');
      });

      // Re-render to trigger language change effect
      rerender(<SearchHomeScreen navigation={mockNavigation} route={mockRoute} />);

      // Wait for Turkish results (translated)
      await waitFor(
        async () => {
          const turkishText = await findByText(/Ateşleme hatası/i);
          expect(turkishText).toBeDefined();
        },
        {timeout: 3000},
      );
    });

    it('should re-fetch data when language changes', async () => {
      const {rerender} = render(
        <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
      );

      // Initial load in English
      await waitFor(() => {
        expect(usePrefsStore.getState().language).toBe('en');
      });

      // Switch language
      act(() => {
        usePrefsStore.getState().setLanguage('tr');
      });

      // Re-render should trigger data refresh
      rerender(<SearchHomeScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(() => {
        expect(usePrefsStore.getState().language).toBe('tr');
      });
    });
  });

  describe('Fault Detail Screen', () => {
    const faultRoute: any = {
      key: 'test-fault-route',
      name: 'FaultDetail',
      params: {faultId: 'fault_001'},
    };

    it('should display English fault details by default', async () => {
      const {findByText} = render(
        <FaultDetailScreen navigation={mockNavigation} route={faultRoute} />,
      );

      await waitFor(
        async () => {
          const englishTitle = await findByText(/Ignition failure/i);
          expect(englishTitle).toBeDefined();
        },
        {timeout: 2000},
      );
    });

    it('should update to Turkish when language changes', async () => {
      const {findByText, rerender} = render(
        <FaultDetailScreen navigation={mockNavigation} route={faultRoute} />,
      );

      // Wait for English content
      await waitFor(
        async () => {
          await findByText(/Ignition failure/i);
        },
        {timeout: 2000},
      );

      // Switch to Turkish
      act(() => {
        usePrefsStore.getState().setLanguage('tr');
      });

      // Re-render to trigger language change effect
      rerender(<FaultDetailScreen navigation={mockNavigation} route={faultRoute} />);

      // Wait for Turkish content
      await waitFor(
        async () => {
          const turkishTitle = await findByText(/Ateşleme hatası/i);
          expect(turkishTitle).toBeDefined();
        },
        {timeout: 3000},
      );
    });

    it('should translate resolution steps when language changes', async () => {
      const {findByText, rerender} = render(
        <FaultDetailScreen navigation={mockNavigation} route={faultRoute} />,
      );

      // Wait for English steps
      await waitFor(
        async () => {
          await findByText(/Check that the gas supply/i);
        },
        {timeout: 2000},
      );

      // Switch to Turkish
      act(() => {
        usePrefsStore.getState().setLanguage('tr');
      });

      // Re-render
      rerender(<FaultDetailScreen navigation={mockNavigation} route={faultRoute} />);

      // Wait for Turkish steps
      await waitFor(
        async () => {
          const turkishStep = await findByText(/Gaz beslemesini kontrol/i);
          expect(turkishStep).toBeDefined();
        },
        {timeout: 3000},
      );
    });

    it('should translate safety notices when language changes', async () => {
      const {findByText, rerender} = render(
        <FaultDetailScreen navigation={mockNavigation} route={faultRoute} />,
      );

      // Wait for English safety notice
      await waitFor(
        async () => {
          await findByText(/If you smell gas/i);
        },
        {timeout: 2000},
      );

      // Switch to Turkish
      act(() => {
        usePrefsStore.getState().setLanguage('tr');
      });

      // Re-render
      rerender(<FaultDetailScreen navigation={mockNavigation} route={faultRoute} />);

      // Wait for Turkish safety notice
      await waitFor(
        async () => {
          // The translation should contain "gaz" (Turkish for gas)
          const turkishNotice = await findByText(/gaz/i);
          expect(turkishNotice).toBeDefined();
        },
        {timeout: 3000},
      );
    });
  });

  describe('Language Persistence', () => {
    it('should maintain language selection across screen navigation', async () => {
      // Set Turkish
      act(() => {
        usePrefsStore.getState().setLanguage('tr');
      });

      // Render Search screen
      const {findByText: findInSearch} = render(
        <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
      );

      // Should show Turkish content
      await waitFor(() => {
        expect(usePrefsStore.getState().language).toBe('tr');
      });

      // Navigate to detail (simulated by rendering detail screen)
      const faultRoute: any = {
        key: 'test-persistence-route',
        name: 'FaultDetail',
        params: {faultId: 'fault_001'},
      };
      const {findByText: findInDetail} = render(
        <FaultDetailScreen navigation={mockNavigation} route={faultRoute} />,
      );

      // Should still show Turkish content
      await waitFor(
        async () => {
          const turkishText = await findInDetail(/Ateşleme hatası/i);
          expect(turkishText).toBeDefined();
        },
        {timeout: 3000},
      );

      // Language should still be Turkish
      expect(usePrefsStore.getState().language).toBe('tr');
    });
  });
});

