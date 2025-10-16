/**
 * User Store Tests
 * Tests for quota gating, plan management, and access control
 */

import {useUserStore, canAccessFaultDetail} from '../useUserStore';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const store = useUserStore.getState();
    store.downgradeToFree();
    store.resetDailyQuota();
  });

  describe('canAccessFaultDetail utility', () => {
    it('should return true for Pro users regardless of quota', () => {
      expect(canAccessFaultDetail('pro', 0, 10)).toBe(true);
      expect(canAccessFaultDetail('pro', 10, 10)).toBe(true);
      expect(canAccessFaultDetail('pro', 100, 10)).toBe(true);
    });

    it('should return true for free users within quota', () => {
      expect(canAccessFaultDetail('free', 0, 10)).toBe(true);
      expect(canAccessFaultDetail('free', 5, 10)).toBe(true);
      expect(canAccessFaultDetail('free', 9, 10)).toBe(true);
    });

    it('should return false when free users reach limit', () => {
      expect(canAccessFaultDetail('free', 10, 10)).toBe(false);
      expect(canAccessFaultDetail('free', 11, 10)).toBe(false);
      expect(canAccessFaultDetail('free', 15, 10)).toBe(false);
    });

    it('should respect different limit values', () => {
      expect(canAccessFaultDetail('free', 4, 5)).toBe(true);
      expect(canAccessFaultDetail('free', 5, 5)).toBe(false);
      
      expect(canAccessFaultDetail('free', 19, 20)).toBe(true);
      expect(canAccessFaultDetail('free', 20, 20)).toBe(false);
    });
  });

  describe('Initial state', () => {
    it('should start with free plan and zero quota', () => {
      const state = useUserStore.getState();
      expect(state.plan).toBe('free');
      expect(state.dailyQuotaUsed).toBe(0);
      expect(state.dailyQuotaLimit).toBe(10);
    });
  });

  describe('Plan management', () => {
    it('should upgrade to Pro plan', () => {
      const store = useUserStore.getState();
      
      expect(store.plan).toBe('free');
      store.upgradeToPro();
      
      const updatedState = useUserStore.getState();
      expect(updatedState.plan).toBe('pro');
    });

    it('should downgrade to Free plan and reset quota', () => {
      const store = useUserStore.getState();
      
      // Upgrade and use quota
      store.upgradeToPro();
      store.incrementQuota();
      store.incrementQuota();
      
      expect(useUserStore.getState().plan).toBe('pro');
      
      // Downgrade
      store.downgradeToFree();
      
      const state = useUserStore.getState();
      expect(state.plan).toBe('free');
      expect(state.dailyQuotaUsed).toBe(0); // Should reset quota
    });

    it('should allow upgrading from free to pro multiple times', () => {
      const store = useUserStore.getState();
      
      store.upgradeToPro();
      expect(useUserStore.getState().plan).toBe('pro');
      
      store.downgradeToFree();
      expect(useUserStore.getState().plan).toBe('free');
      
      store.upgradeToPro();
      expect(useUserStore.getState().plan).toBe('pro');
    });
  });

  describe('Quota management', () => {
    it('should increment quota', () => {
      const store = useUserStore.getState();
      
      expect(store.dailyQuotaUsed).toBe(0);
      
      store.incrementQuota();
      expect(useUserStore.getState().dailyQuotaUsed).toBe(1);
      
      store.incrementQuota();
      expect(useUserStore.getState().dailyQuotaUsed).toBe(2);
    });

    it('should allow incrementing beyond limit (enforcement is elsewhere)', () => {
      const store = useUserStore.getState();
      
      // Increment 15 times (beyond 10 limit)
      for (let i = 0; i < 15; i++) {
        store.incrementQuota();
      }
      
      expect(useUserStore.getState().dailyQuotaUsed).toBe(15);
    });

    it('should reset quota manually', () => {
      const store = useUserStore.getState();
      
      // Use up quota
      for (let i = 0; i < 10; i++) {
        store.incrementQuota();
      }
      
      expect(useUserStore.getState().dailyQuotaUsed).toBe(10);
      
      // Reset
      store.resetDailyQuota();
      expect(useUserStore.getState().dailyQuotaUsed).toBe(0);
    });
  });

  describe('Access control with store integration', () => {
    it('should block access when free user hits limit', () => {
      const store = useUserStore.getState();
      
      // Use up quota
      for (let i = 0; i < 10; i++) {
        store.incrementQuota();
      }
      
      const state = useUserStore.getState();
      const canAccess = canAccessFaultDetail(
        state.plan,
        state.dailyQuotaUsed,
        state.dailyQuotaLimit,
      );
      
      expect(canAccess).toBe(false);
    });

    it('should allow access after upgrading to Pro', () => {
      const store = useUserStore.getState();
      
      // Hit limit as free user
      for (let i = 0; i < 10; i++) {
        store.incrementQuota();
      }
      
      // Verify blocked
      let state = useUserStore.getState();
      expect(
        canAccessFaultDetail(state.plan, state.dailyQuotaUsed, state.dailyQuotaLimit),
      ).toBe(false);
      
      // Upgrade to Pro
      store.upgradeToPro();
      
      // Verify access granted
      state = useUserStore.getState();
      expect(
        canAccessFaultDetail(state.plan, state.dailyQuotaUsed, state.dailyQuotaLimit),
      ).toBe(true);
    });

    it('should allow Pro user to access even with high quota', () => {
      const store = useUserStore.getState();
      
      store.upgradeToPro();
      
      // Increment quota many times
      for (let i = 0; i < 50; i++) {
        store.incrementQuota();
      }
      
      const state = useUserStore.getState();
      expect(state.dailyQuotaUsed).toBe(50);
      
      const canAccess = canAccessFaultDetail(
        state.plan,
        state.dailyQuotaUsed,
        state.dailyQuotaLimit,
      );
      
      expect(canAccess).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle exactly at limit', () => {
      const store = useUserStore.getState();
      
      // Go to exactly 9 (one below limit)
      for (let i = 0; i < 9; i++) {
        store.incrementQuota();
      }
      
      let state = useUserStore.getState();
      expect(canAccessFaultDetail(state.plan, state.dailyQuotaUsed, state.dailyQuotaLimit)).toBe(
        true,
      );
      
      // Increment to exactly 10 (at limit)
      store.incrementQuota();
      
      state = useUserStore.getState();
      expect(canAccessFaultDetail(state.plan, state.dailyQuotaUsed, state.dailyQuotaLimit)).toBe(
        false,
      );
    });

    it('should handle zero limit edge case', () => {
      // Free user with 0 limit should be immediately blocked
      expect(canAccessFaultDetail('free', 0, 0)).toBe(false);
      
      // But Pro user should still have access
      expect(canAccessFaultDetail('pro', 0, 0)).toBe(true);
    });
  });
});

