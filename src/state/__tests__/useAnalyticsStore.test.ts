/**
 * Analytics Store Tests
 * Tests for event logging and in-memory storage
 */

import {useAnalyticsStore, analytics, AnalyticsEvent} from '../useAnalyticsStore';

// Mock console.log to capture analytics logs
const originalConsoleLog = console.log;
let consoleOutput: any[] = [];

describe('useAnalyticsStore', () => {
  beforeEach(() => {
    // Reset store
    useAnalyticsStore.getState().clearEvents();
    
    // Mock console.log
    consoleOutput = [];
    console.log = jest.fn((...args) => {
      consoleOutput.push(args);
    });
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  describe('Event Logging', () => {
    it('should log events to console', () => {
      analytics.search('E03', 'brand_001');
      
      expect(console.log).toHaveBeenCalled();
      expect(consoleOutput[0][0]).toBe('[Analytics]');
      expect(consoleOutput[0][1]).toBe('search');
    });

    it('should store events in memory', () => {
      analytics.search('E03');
      
      const events = useAnalyticsStore.getState().events;
      expect(events.length).toBe(1);
      expect(events[0].name).toBe('search');
    });

    it('should include timestamp in events', () => {
      const beforeTs = Date.now();
      analytics.search('E03');
      const afterTs = Date.now();
      
      const events = useAnalyticsStore.getState().events;
      expect(events[0].ts).toBeGreaterThanOrEqual(beforeTs);
      expect(events[0].ts).toBeLessThanOrEqual(afterTs);
    });

    it('should include props in events', () => {
      analytics.search('E03', 'brand_001');
      
      const events = useAnalyticsStore.getState().events;
      expect(events[0].props).toBeDefined();
      expect(events[0].props?.searchTerm).toBe('E03');
      expect(events[0].props?.brandId).toBe('brand_001');
    });
  });

  describe('Event Types', () => {
    it('should log app_open event', () => {
      analytics.appOpen();
      
      const events = useAnalyticsStore.getState().events;
      expect(events.length).toBe(1);
      expect(events[0].name).toBe('app_open');
    });

    it('should log search event with telemetry', () => {
      analytics.search('E03', 'brand_001');
      
      const events = useAnalyticsStore.getState().events;
      expect(events[0].name).toBe('search');
      expect(events[0].props?.searchTerm).toBe('E03');
      expect(events[0].props?.brandId).toBe('brand_001');
      expect(events[0].props?.termLength).toBe(3);
    });

    it('should log search event without brandId', () => {
      analytics.search('fault code');
      
      const events = useAnalyticsStore.getState().events;
      expect(events[0].props?.searchTerm).toBe('fault code');
      expect(events[0].props?.brandId).toBeNull();
      expect(events[0].props?.termLength).toBe(10); // 'fault code' is 10 chars
    });

    it('should log fault_view event with telemetry', () => {
      analytics.faultView('fault_001', 'E03', 'brand_001', 'critical');
      
      const events = useAnalyticsStore.getState().events;
      expect(events[0].name).toBe('fault_view');
      expect(events[0].props?.faultId).toBe('fault_001');
      expect(events[0].props?.code).toBe('E03');
      expect(events[0].props?.brandId).toBe('brand_001');
      expect(events[0].props?.severity).toBe('critical');
    });

    it('should log paywall_shown event', () => {
      analytics.paywallShown('quota_exceeded', 0);
      
      const events = useAnalyticsStore.getState().events;
      expect(events[0].name).toBe('paywall_shown');
      expect(events[0].props?.reason).toBe('quota_exceeded');
      expect(events[0].props?.remaining).toBe(0);
    });

    it('should log upgrade_click event', () => {
      analytics.upgradeClick('paywall', 'free');
      
      const events = useAnalyticsStore.getState().events;
      expect(events[0].name).toBe('upgrade_click');
      expect(events[0].props?.source).toBe('paywall');
      expect(events[0].props?.currentPlan).toBe('free');
      expect(events[0].props?.targetPlan).toBe('pro');
    });
  });

  describe('Event Storage', () => {
    it('should keep last 50 events', () => {
      // Log 60 events
      for (let i = 0; i < 60; i++) {
        analytics.search(`query_${i}`);
      }
      
      const events = useAnalyticsStore.getState().events;
      expect(events.length).toBe(50);
      
      // Should keep the most recent 50
      expect(events[0].props?.searchTerm).toBe('query_10');
      expect(events[49].props?.searchTerm).toBe('query_59');
    });

    it('should maintain order of events', () => {
      analytics.search('first');
      analytics.faultView('fault_001', 'E03', 'brand_001', 'info');
      analytics.paywallShown('test', 0);
      
      const events = useAnalyticsStore.getState().events;
      expect(events[0].name).toBe('search');
      expect(events[1].name).toBe('fault_view');
      expect(events[2].name).toBe('paywall_shown');
    });

    it('should clear all events', () => {
      analytics.search('test');
      analytics.faultView('fault_001', 'E03', 'brand_001', 'info');
      
      expect(useAnalyticsStore.getState().events.length).toBe(2);
      
      useAnalyticsStore.getState().clearEvents();
      
      expect(useAnalyticsStore.getState().events.length).toBe(0);
    });

    it('should get all events', () => {
      analytics.search('test1');
      analytics.search('test2');
      
      const events = useAnalyticsStore.getState().getEvents();
      expect(events.length).toBe(2);
      expect(events[0].props?.searchTerm).toBe('test1');
      expect(events[1].props?.searchTerm).toBe('test2');
    });
  });

  describe('Multiple Events', () => {
    it('should handle rapid successive events', () => {
      analytics.search('A');
      analytics.search('AB');
      analytics.search('ABC');
      
      const events = useAnalyticsStore.getState().events;
      expect(events.length).toBe(3);
      expect(events[0].props?.searchTerm).toBe('A');
      expect(events[1].props?.searchTerm).toBe('AB');
      expect(events[2].props?.searchTerm).toBe('ABC');
    });

    it('should handle mixed event types', () => {
      analytics.appOpen();
      analytics.search('E03');
      analytics.faultView('fault_001', 'E03', 'brand_001', 'warning');
      analytics.paywallShown('quota_exceeded', 0);
      analytics.upgradeClick('paywall', 'free');
      
      const events = useAnalyticsStore.getState().events;
      expect(events.length).toBe(5);
      expect(events[0].name).toBe('app_open');
      expect(events[1].name).toBe('search');
      expect(events[2].name).toBe('fault_view');
      expect(events[3].name).toBe('paywall_shown');
      expect(events[4].name).toBe('upgrade_click');
    });
  });

  describe('Event Shape', () => {
    it('should have correct shape for all events', () => {
      analytics.search('test', 'brand_001');
      
      const event = useAnalyticsStore.getState().events[0];
      
      // Required fields
      expect(event.name).toBeDefined();
      expect(typeof event.name).toBe('string');
      expect(event.ts).toBeDefined();
      expect(typeof event.ts).toBe('number');
      
      // Optional props
      expect(event.props).toBeDefined();
      expect(typeof event.props).toBe('object');
    });

    it('should allow events without props', () => {
      analytics.appOpen();
      
      const event = useAnalyticsStore.getState().events[0];
      expect(event.name).toBe('app_open');
      expect(event.props).toBeUndefined();
    });
  });

  describe('Console Logging Format', () => {
    it('should log in readable format', () => {
      analytics.search('E03', 'brand_001');
      
      expect(consoleOutput[0][0]).toBe('[Analytics]');
      expect(consoleOutput[0][1]).toBe('search');
      expect(consoleOutput[0][2]).toHaveProperty('timestamp');
      expect(consoleOutput[0][2]).toHaveProperty('searchTerm', 'E03');
      expect(consoleOutput[0][2]).toHaveProperty('brandId', 'brand_001');
    });

    it('should include ISO timestamp in console log', () => {
      analytics.faultView('fault_001', 'E03', 'brand_001', 'critical');
      
      const loggedData = consoleOutput[0][2];
      expect(loggedData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });
});

