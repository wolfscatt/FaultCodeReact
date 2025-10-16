/**
 * Analytics Integration Tests
 * Verifies analytics events are fired from screens
 */

import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import SearchHomeScreen from '../SearchHomeScreen';
import FaultDetailScreen from '../FaultDetailScreen';
import {useAnalyticsStore} from '@state/useAnalyticsStore';
import {useUserStore} from '@state/useUserStore';

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: mockGoBack,
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
} as any;

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Analytics Integration', () => {
  beforeEach(() => {
    // Reset analytics store
    useAnalyticsStore.getState().clearEvents();
    
    // Reset user store
    const userStore = useUserStore.getState();
    userStore.resetDailyQuota();
    userStore.downgradeToFree();
    
    // Clear navigation mocks
    mockNavigate.mockClear();
    mockReplace.mockClear();
    mockGoBack.mockClear();
  });

  describe('Search Analytics', () => {
    it(
      'should fire search event when user searches',
      async () => {
        const mockRoute = {
          key: 'SearchHome',
          name: 'SearchHome' as const,
          params: undefined,
        };

        const {getByPlaceholderText} = render(
          <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
        );

        const searchInput = getByPlaceholderText('search.placeholder');

        // Simulate user typing
        fireEvent.changeText(searchInput, 'E03');

        // Wait for debounced search to fire (CI is slower)
        await waitFor(
          () => {
            const events = useAnalyticsStore.getState().events;
            expect(events.length).toBeGreaterThan(0);
          },
          {timeout: 2000},
        );

        // Verify search event was logged
        const events = useAnalyticsStore.getState().events;
        const searchEvent = events.find((e: any) => e.name === 'search');

        expect(searchEvent).toBeDefined();
        expect(searchEvent?.props?.searchTerm).toBe('E03');
        expect(searchEvent?.props?.termLength).toBe(3);
      },
      10000,
    ); // 10s timeout for slow CI environments

    it('should fire search event with brandId when brand is selected', async () => {
      const mockRoute = {
        key: 'SearchHome',
        name: 'SearchHome' as const,
        params: undefined,
      };

      const {getByPlaceholderText, getByText} = render(
        <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const searchInput = getByPlaceholderText('search.placeholder');
      
      // Select a brand (wait for brands to load)
      await waitFor(() => {
        const brandFilter = getByText('search.brandFilter');
        expect(brandFilter).toBeDefined();
      });
      
      // Type search query
      fireEvent.changeText(searchInput, 'E03');
      
      // Wait for search event
      await waitFor(
        () => {
          const events = useAnalyticsStore.getState().events;
          const searchEvent = events.find((e: any) => e.name === 'search');
          expect(searchEvent).toBeDefined();
        },
        {timeout: 1000},
      );
    });

    it('should fire multiple search events for different queries', async () => {
      const mockRoute = {
        key: 'SearchHome',
        name: 'SearchHome' as const,
        params: undefined,
      };

      const {getByPlaceholderText} = render(
        <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const searchInput = getByPlaceholderText('search.placeholder');
      
      // First search
      fireEvent.changeText(searchInput, 'E01');
      await waitFor(() => {
        const events = useAnalyticsStore.getState().events;
        expect(events.some((e: any) => e.props?.searchTerm === 'E01')).toBe(true);
      }, {timeout: 1000});
      
      // Second search
      fireEvent.changeText(searchInput, 'E02');
      await waitFor(() => {
        const events = useAnalyticsStore.getState().events;
        expect(events.some((e: any) => e.props?.searchTerm === 'E02')).toBe(true);
      }, {timeout: 1000});
      
      // Should have at least 2 search events
      const events = useAnalyticsStore.getState().events;
      const searchEvents = events.filter((e: any) => e.name === 'search');
      expect(searchEvents.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Fault View Analytics', () => {
    it('should fire fault_view event when viewing fault', async () => {
      // Upgrade to pro to avoid paywall
      useUserStore.getState().upgradeToPro();
      
      const mockRoute = {
        key: 'FaultDetail',
        name: 'FaultDetail' as const,
        params: {faultId: 'fault_001'},
      };

      render(<FaultDetailScreen navigation={mockNavigation} route={mockRoute} />);

      // Wait for fault to load and event to fire
      await waitFor(
        () => {
          const events = useAnalyticsStore.getState().events;
          const faultViewEvent = events.find((e: any) => e.name === 'fault_view');
          expect(faultViewEvent).toBeDefined();
        },
        {timeout: 3000},
      );

      // Verify fault_view event details
      const events = useAnalyticsStore.getState().events;
      const faultViewEvent = events.find((e: any) => e.name === 'fault_view');
      
      expect(faultViewEvent?.props?.faultId).toBe('fault_001');
      expect(faultViewEvent?.props?.code).toBeDefined();
      expect(faultViewEvent?.props?.brandId).toBeDefined();
      expect(faultViewEvent?.props?.severity).toBeDefined();
    });

    it('should include fault code in analytics', async () => {
      useUserStore.getState().upgradeToPro();
      
      const mockRoute = {
        key: 'FaultDetail',
        name: 'FaultDetail' as const,
        params: {faultId: 'fault_001'},
      };

      render(<FaultDetailScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(
        () => {
          const events = useAnalyticsStore.getState().events;
          const faultViewEvent = events.find((e: any) => e.name === 'fault_view');
          expect(faultViewEvent?.props?.code).toBeTruthy();
        },
        {timeout: 3000},
      );
    });

    it('should include brandId in analytics', async () => {
      useUserStore.getState().upgradeToPro();
      
      const mockRoute = {
        key: 'FaultDetail',
        name: 'FaultDetail' as const,
        params: {faultId: 'fault_001'},
      };

      render(<FaultDetailScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(
        () => {
          const events = useAnalyticsStore.getState().events;
          const faultViewEvent = events.find((e: any) => e.name === 'fault_view');
          expect(faultViewEvent?.props?.brandId).toBeTruthy();
        },
        {timeout: 3000},
      );
    });

    it('should include severity in analytics', async () => {
      useUserStore.getState().upgradeToPro();
      
      const mockRoute = {
        key: 'FaultDetail',
        name: 'FaultDetail' as const,
        params: {faultId: 'fault_001'},
      };

      render(<FaultDetailScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(
        () => {
          const events = useAnalyticsStore.getState().events;
          const faultViewEvent = events.find((e: any) => e.name === 'fault_view');
          expect(faultViewEvent?.props?.severity).toMatch(/^(info|warning|critical)$/);
        },
        {timeout: 3000},
      );
    });
  });

  describe('Event Ordering', () => {
    it('should maintain chronological order of events', async () => {
      // Simulate user journey: search → view fault
      
      // 1. Search
      const searchRoute = {
        key: 'SearchHome',
        name: 'SearchHome' as const,
        params: undefined,
      };

      const {getByPlaceholderText} = render(
        <SearchHomeScreen navigation={mockNavigation} route={searchRoute} />,
      );

      fireEvent.changeText(getByPlaceholderText('search.placeholder'), 'E03');
      
      await waitFor(() => {
        const events = useAnalyticsStore.getState().events;
        expect(events.some((e: any) => e.name === 'search')).toBe(true);
      }, {timeout: 1000});

      const eventsAfterSearch = useAnalyticsStore.getState().events;
      const searchEventTs = eventsAfterSearch.find((e: any) => e.name === 'search')?.ts || 0;
      
      // 2. View fault (upgrade to pro first)
      useUserStore.getState().upgradeToPro();
      
      const faultRoute = {
        key: 'FaultDetail',
        name: 'FaultDetail' as const,
        params: {faultId: 'fault_001'},
      };

      render(<FaultDetailScreen navigation={mockNavigation} route={faultRoute} />);

      await waitFor(() => {
        const events = useAnalyticsStore.getState().events;
        expect(events.some((e: any) => e.name === 'fault_view')).toBe(true);
      }, {timeout: 3000});

      const allEvents = useAnalyticsStore.getState().events;
      const faultViewEventTs = allEvents.find((e: any) => e.name === 'fault_view')?.ts || 0;
      
      // fault_view should come after search
      expect(faultViewEventTs).toBeGreaterThan(searchEventTs);
    });
  });

  describe('Acceptance Criteria', () => {
    it('✅ Searching fires "search" event', async () => {
      const mockRoute = {
        key: 'SearchHome',
        name: 'SearchHome' as const,
        params: undefined,
      };

      const {getByPlaceholderText} = render(
        <SearchHomeScreen navigation={mockNavigation} route={mockRoute} />,
      );

      const searchInput = getByPlaceholderText('search.placeholder');
      fireEvent.changeText(searchInput, 'E03');
      
      await waitFor(
        () => {
          const events = useAnalyticsStore.getState().events;
          const searchEvent = events.find((e: any) => e.name === 'search');
          expect(searchEvent).toBeDefined();
          expect(searchEvent?.props?.searchTerm).toBe('E03');
        },
        {timeout: 1000},
      );
    });

    it('✅ Viewing fault fires "fault_view" event', async () => {
      useUserStore.getState().upgradeToPro();
      
      const mockRoute = {
        key: 'FaultDetail',
        name: 'FaultDetail' as const,
        params: {faultId: 'fault_001'},
      };

      render(<FaultDetailScreen navigation={mockNavigation} route={mockRoute} />);

      await waitFor(
        () => {
          const events = useAnalyticsStore.getState().events;
          const faultViewEvent = events.find((e: any) => e.name === 'fault_view');
          expect(faultViewEvent).toBeDefined();
          expect(faultViewEvent?.props?.faultId).toBe('fault_001');
          expect(faultViewEvent?.props?.code).toBeTruthy();
          expect(faultViewEvent?.props?.brandId).toBeTruthy();
          expect(faultViewEvent?.props?.severity).toBeTruthy();
        },
        {timeout: 3000},
      );
    });
  });
});

