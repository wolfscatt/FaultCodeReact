/**
 * Analytics Store
 * Console-based analytics for MVP with in-memory event tracking
 */

import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

export type AnalyticsEventName =
  | 'app_open'
  | 'search'
  | 'fault_view'
  | 'paywall_shown'
  | 'upgrade_click';

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  ts: number;
  props?: Record<string, any>;
};

type AnalyticsState = {
  events: AnalyticsEvent[];
  
  // Actions
  logEvent: (name: AnalyticsEventName, props?: Record<string, any>) => void;
  clearEvents: () => void;
  getEvents: () => AnalyticsEvent[];
};

const MAX_EVENTS = 50;

/**
 * Analytics store
 * Logs events to console and keeps last 50 in memory
 */
export const useAnalyticsStore: any = create<AnalyticsState>()(
  immer((set) => ({
    events: [],

    // Log an event
    logEvent: (name, props) => {
      const event: AnalyticsEvent = {
        name,
        ts: Date.now(),
        props,
      };

      // Log to console for MVP
      console.log('[Analytics]', event.name, {
        timestamp: new Date(event.ts).toISOString(),
        ...event.props,
      });

      set(state => {
        // Add new event
        state.events.push(event);

        // Keep only last 50 events
        if (state.events.length > MAX_EVENTS) {
          state.events = state.events.slice(-MAX_EVENTS);
        }
      });
    },

    // Clear all events (for testing/debugging)
    clearEvents: () =>
      set(state => {
        state.events = [];
      }),

    // Get all events (for debugging/export)
    getEvents: () => {
      return useAnalyticsStore.getState().events;
    },
  })),
);

/**
 * Analytics utility functions
 * Type-safe event logging with telemetry
 */

export const analytics = {
  /**
   * Log app open event
   */
  appOpen: () => {
    useAnalyticsStore.getState().logEvent('app_open');
  },

  /**
   * Log search event
   * @param searchTerm - User's search query
   * @param brandId - Selected brand filter (if any)
   */
  search: (searchTerm: string, brandId?: string) => {
    useAnalyticsStore.getState().logEvent('search', {
      searchTerm,
      brandId: brandId || null,
      termLength: searchTerm.length,
    });
  },

  /**
   * Log fault view event
   * @param faultId - ID of the viewed fault
   * @param code - Fault code (e.g., "E03")
   * @param brandId - Brand ID
   * @param severity - Fault severity
   */
  faultView: (faultId: string, code: string, brandId: string, severity: string) => {
    useAnalyticsStore.getState().logEvent('fault_view', {
      faultId,
      code,
      brandId,
      severity,
    });
  },

  /**
   * Log paywall shown event
   * @param reason - Why paywall was shown (e.g., "quota_exceeded")
   * @param remaining - Remaining quota
   */
  paywallShown: (reason: string, remaining: number) => {
    useAnalyticsStore.getState().logEvent('paywall_shown', {
      reason,
      remaining,
    });
  },

  /**
   * Log upgrade click event
   * @param source - Where the upgrade was clicked (e.g., "paywall", "settings")
   * @param currentPlan - Current plan before upgrade
   */
  upgradeClick: (source: string, currentPlan: string) => {
    useAnalyticsStore.getState().logEvent('upgrade_click', {
      source,
      currentPlan,
      targetPlan: 'pro',
    });
  },
};

/**
 * Hook to access analytics events (for debugging/display)
 */
export const useAnalytics = () => {
  const events = useAnalyticsStore((state: AnalyticsState) => state.events);
  const clearEvents = useAnalyticsStore((state: AnalyticsState) => state.clearEvents);
  
  return {
    events,
    clearEvents,
    recentEvents: events.slice(-10), // Last 10 events
    totalEvents: events.length,
  };
};

