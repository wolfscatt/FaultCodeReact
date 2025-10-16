/**
 * User Store
 * Manages user authentication, subscription plan, and usage quotas
 */

import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

export type PlanType = 'free' | 'pro';

type UserState = {
  // Authentication (mocked for now)
  isLoggedIn: boolean;
  userId: string | null;

  // Subscription
  plan: PlanType;

  // Usage tracking (for free tier limits)
  dailyQuotaUsed: number;
  dailyQuotaLimit: number;
  lastResetDate: string; // ISO date string

  // Actions
  login: (userId: string) => void;
  logout: () => void;
  upgradeToPro: () => void;
  downgradeToFree: () => void;
  incrementQuota: () => void;
  resetDailyQuota: () => void;
  checkAndResetQuota: () => void;
};

const DAILY_FREE_LIMIT = 10;

/**
 * User store with subscription and quota management
 * Uses immer middleware for easier state updates
 */
export const useUserStore = create<UserState>()(
  immer(set => ({
    // Initial state
    isLoggedIn: false,
    userId: null,
    plan: 'free',
    dailyQuotaUsed: 0,
    dailyQuotaLimit: DAILY_FREE_LIMIT,
    lastResetDate: new Date().toISOString().split('T')[0],

    // Login (mock)
    login: userId =>
      set(state => {
        state.isLoggedIn = true;
        state.userId = userId;
      }),

    // Logout
    logout: () =>
      set(state => {
        state.isLoggedIn = false;
        state.userId = null;
        state.plan = 'free';
        state.dailyQuotaUsed = 0;
      }),

    // Upgrade to pro plan (mock purchase)
    upgradeToPro: () =>
      set(state => {
        state.plan = 'pro';
      }),

    // Downgrade to free (mock cancellation)
    downgradeToFree: () =>
      set(state => {
        state.plan = 'free';
        state.dailyQuotaUsed = 0;
      }),

    // Increment usage counter
    incrementQuota: () =>
      set(state => {
        state.dailyQuotaUsed += 1;
      }),

    // Reset daily quota manually
    resetDailyQuota: () =>
      set(state => {
        state.dailyQuotaUsed = 0;
        state.lastResetDate = new Date().toISOString().split('T')[0];
      }),

    // Check if quota needs reset (new day) and reset if needed
    checkAndResetQuota: () =>
      set(state => {
        const today = new Date().toISOString().split('T')[0];
        if (state.lastResetDate !== today) {
          state.dailyQuotaUsed = 0;
          state.lastResetDate = today;
        }
      }),
  })),
);

/**
 * Utility function to check if user can access fault details
 * @param plan - User's subscription plan ('free' or 'pro')
 * @param dailyQuotaUsed - Number of faults viewed today
 * @param dailyQuotaLimit - Maximum faults allowed per day for free users
 * @returns boolean - true if user can access more content
 */
export const canAccessFaultDetail = (
  plan: PlanType,
  dailyQuotaUsed: number,
  dailyQuotaLimit: number,
): boolean => {
  // Pro users have unlimited access
  if (plan === 'pro') {
    return true;
  }

  // Free users are limited by daily quota
  return dailyQuotaUsed < dailyQuotaLimit;
};

/**
 * Helper hook to check if user can access more content
 */
export const useCanAccessContent = (): {
  canAccess: boolean;
  remaining: number;
  limit: number;
} => {
  const {plan, dailyQuotaUsed, dailyQuotaLimit} = useUserStore();

  const canAccess = canAccessFaultDetail(plan, dailyQuotaUsed, dailyQuotaLimit);

  if (plan === 'pro') {
    return {
      canAccess: true,
      remaining: Infinity,
      limit: Infinity,
    };
  }

  return {
    canAccess,
    remaining: Math.max(0, dailyQuotaLimit - dailyQuotaUsed),
    limit: dailyQuotaLimit,
  };
};

