/**
 * User Store
 * Manages user authentication, subscription plan, and usage quotas
 * Now integrated with Supabase Auth
 */

import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';
import * as AuthService from '@lib/auth';
import type {AuthUser, UserData} from '@lib/auth';

export type PlanType = 'free' | 'pro';

type UserState = {
  // Authentication (Supabase Auth)
  isLoggedIn: boolean;
  userId: string | null;
  user: AuthUser | null;
  email: string | null;

  // Subscription
  plan: PlanType;
  planId: string | null;

  // Usage tracking (for free tier limits) - MONTHLY QUOTA
  monthlyQuotaUsed: number;
  monthlyQuotaLimit: number;
  quotaResetDate: string; // ISO date string - when quota will reset

  // Loading states
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  register: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  logout: () => Promise<void>;
  loadUserData: (userId: string) => Promise<void>;
  upgradeToPro: () => Promise<void>;
  downgradeToFree: () => void;
  incrementQuota: () => Promise<void>;
  resetMonthlyQuota: () => void;
  checkAndResetQuota: () => void;
  isPremium: () => boolean;
  canAccessFavorites: () => boolean;
  canViewFault: () => boolean;
};

const MONTHLY_FREE_LIMIT = 10;

/**
 * User store with subscription and quota management
 * Uses immer middleware for easier state updates
 * Integrated with Supabase Auth
 */
export const useUserStore = create<UserState>()(
  immer((set, get) => ({
    // Initial state
    isLoggedIn: false,
    userId: null,
    user: null,
    email: null,
    plan: 'free',
    planId: null,
    monthlyQuotaUsed: 0,
    monthlyQuotaLimit: MONTHLY_FREE_LIMIT,
    quotaResetDate: (() => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString().split('T')[0];
    })(),
    isLoading: false,
    isInitialized: false,

    // Initialize - check for existing session
    initialize: async () => {
      set(state => {
        state.isLoading = true;
      });

      try {
        const {session} = await AuthService.getSession();

        if (session?.user) {
          // Load user data from database
          await get().loadUserData(session.user.id);

          set(state => {
            state.isLoggedIn = true;
            state.userId = session.user.id;
            state.user = session.user;
            state.email = session.user.email || null;
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        set(state => {
          state.isLoading = false;
          state.isInitialized = true;
        });
      }
    },

    // Login with Supabase Auth
    login: async (email: string, password: string) => {
      set(state => {
        state.isLoading = true;
      });

      try {
        const {user, session, error} = await AuthService.signIn(email, password);

        if (error || !user || !session) {
          set(state => {
            state.isLoading = false;
          });
          return {
            success: false,
            error: error?.message || 'Login failed',
          };
        }

        // Load user data from database
        await get().loadUserData(user.id);

        set(state => {
          state.isLoggedIn = true;
          state.userId = user.id;
          state.user = user;
          state.email = user.email || null;
          state.isLoading = false;
        });

        return {success: true};
      } catch (error: any) {
        set(state => {
          state.isLoading = false;
        });
        return {
          success: false,
          error: error?.message || 'Login failed',
        };
      }
    },

    // Register with Supabase Auth
    register: async (email: string, password: string) => {
      set(state => {
        state.isLoading = true;
      });

      try {
        const {user, session, error} = await AuthService.signUp(email, password);

        if (error || !user) {
          set(state => {
            state.isLoading = false;
          });
          return {
            success: false,
            error: error?.message || 'Registration failed',
          };
        }

        // Create user record in database using admin client (bypasses RLS)
        // This works even when email verification is pending (session is null)
        const {success, error: createError} = await AuthService.createUserRecord(
          user.id,
          user.email || email, // Use user.email from auth, fallback to registration email
        );

        if (!success) {
          set(state => {
            state.isLoading = false;
          });
          console.error('Failed to create user profile:', createError);
          return {
            success: false,
            error: createError?.message || 'Failed to create user profile',
          };
        }

        // Check if email verification is required (session will be null)
        if (!session) {
          set(state => {
            state.isLoading = false;
          });
          return {
            success: true,
            requiresVerification: true,
            message: 'Please check your email to verify your account',
          };
        }

        // If we have a session (email verification disabled), log the user in
        await get().loadUserData(user.id);

        set(state => {
          state.isLoggedIn = true;
          state.userId = user.id;
          state.user = user;
          state.email = user.email || null;
          state.isLoading = false;
        });

        return {success: true, requiresVerification: false};
      } catch (error: any) {
        set(state => {
          state.isLoading = false;
        });
        return {
          success: false,
          error: error?.message || 'Registration failed',
        };
      }
    },

    // Load user data from Supabase
    loadUserData: async (userId: string) => {
      try {
        const {data, error} = await AuthService.getUserData(userId);

        if (error || !data) {
          console.error('Error loading user data:', error);
          return;
        }

        set(state => {
          state.plan = data.plan_name;
          state.planId = data.plan_id;
          state.monthlyQuotaUsed = data.monthly_quota_used;
          state.quotaResetDate = data.quota_reset_date;
          // Pro users have unlimited quota
          state.monthlyQuotaLimit = data.plan_name === 'pro' ? Infinity : MONTHLY_FREE_LIMIT;
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    },

    // Logout from Supabase Auth
    logout: async () => {
      await AuthService.signOut();
      set(state => {
        state.isLoggedIn = false;
        state.userId = null;
        state.user = null;
        state.email = null;
        state.plan = 'free';
        state.planId = null;
        state.monthlyQuotaUsed = 0;
        state.monthlyQuotaLimit = MONTHLY_FREE_LIMIT;
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        state.quotaResetDate = nextMonth.toISOString().split('T')[0];
      });
    },

    // Upgrade to pro plan (calls Supabase)
    upgradeToPro: async () => {
      const userId = get().userId;
      if (!userId) return;

      try {
        const {success} = await AuthService.upgradeToPro(userId);
        if (success) {
          await get().loadUserData(userId);
        }
      } catch (error) {
        console.error('Error upgrading to pro:', error);
      }
    },

    // Downgrade to free (mock for now)
    downgradeToFree: () =>
      set(state => {
        state.plan = 'free';
        state.monthlyQuotaUsed = 0;
        state.monthlyQuotaLimit = MONTHLY_FREE_LIMIT;
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        state.quotaResetDate = nextMonth.toISOString().split('T')[0];
      }),

    // Increment usage counter (calls Supabase)
    incrementQuota: async () => {
      const userId = get().userId;
      if (!userId) {
        // If not logged in, just increment locally
        set(state => {
          state.monthlyQuotaUsed += 1;
        });
        return;
      }

      try {
        const {success} = await AuthService.incrementUserQuota(userId);
        if (success) {
          set(state => {
            state.monthlyQuotaUsed += 1;
          });
        }
      } catch (error) {
        console.error('Error incrementing quota:', error);
        // Still increment locally even if API fails
        set(state => {
          state.monthlyQuotaUsed += 1;
        });
      }
    },

    // Reset monthly quota manually
    resetMonthlyQuota: () =>
      set(state => {
        state.monthlyQuotaUsed = 0;
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        state.quotaResetDate = nextMonth.toISOString().split('T')[0];
      }),

    // Check if quota needs reset (new month) and reset if needed
    checkAndResetQuota: () =>
      set(state => {
        const today = new Date();
        const resetDate = new Date(state.quotaResetDate);
        if (resetDate <= today) {
          state.monthlyQuotaUsed = 0;
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          state.quotaResetDate = nextMonth.toISOString().split('T')[0];
        }
      }),

    // Check if user is premium
    isPremium: () => {
      return get().plan === 'pro';
    },

    // Check if user can access favorites (premium-only)
    canAccessFavorites: () => {
      return get().plan === 'pro';
    },

    // Check if user can view a fault (based on quota)
    canViewFault: () => {
      const state = get();
      // Pro users always have access
      if (state.plan === 'pro') {
        return true;
      }
      // Free users check quota
      return state.monthlyQuotaUsed < state.monthlyQuotaLimit;
    },
  })),
);

/**
 * Utility function to check if user can access fault details
 * @param plan - User's subscription plan ('free' or 'pro')
 * @param monthlyQuotaUsed - Number of faults viewed this month
 * @param monthlyQuotaLimit - Maximum faults allowed per month for free users
 * @returns boolean - true if user can access more content
 */
export const canAccessFaultDetail = (
  plan: PlanType,
  monthlyQuotaUsed: number,
  monthlyQuotaLimit: number,
): boolean => {
  // Pro users have unlimited access
  if (plan === 'pro') {
    return true;
  }

  // Free users are limited by monthly quota
  return monthlyQuotaUsed < monthlyQuotaLimit;
};

/**
 * Helper hook to check if user can access more content
 */
export const useCanAccessContent = (): {
  canAccess: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
} => {
  const {plan, monthlyQuotaUsed, monthlyQuotaLimit} = useUserStore();

  const canAccess = canAccessFaultDetail(plan, monthlyQuotaUsed, monthlyQuotaLimit);

  if (plan === 'pro') {
    return {
      canAccess: true,
      remaining: Infinity,
      limit: Infinity,
      isPremium: true,
    };
  }

  return {
    canAccess,
    remaining: Math.max(0, monthlyQuotaLimit - monthlyQuotaUsed),
    limit: monthlyQuotaLimit,
    isPremium: false,
  };
};

