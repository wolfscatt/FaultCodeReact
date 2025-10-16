/**
 * Supabase Authentication Service
 * 
 * Provides authentication methods and user management
 */

import {supabase, supabaseAdmin} from './supabase';
import {User, Session, AuthError} from '@supabase/supabase-js';

export type AuthUser = User;
export type AuthSession = Session;

/**
 * User data from Supabase users table
 */
export type UserData = {
  id: string;
  plan_id: string;
  plan_name: 'free' | 'pro';
  monthly_quota_used: number;
  quota_reset_date: string;
  preferences: {
    language?: 'en' | 'tr';
    theme?: 'light' | 'dark';
  };
};

/**
 * Authentication result
 */
export type AuthResult = {
  user: AuthUser | null;
  session: AuthSession | null;
  error: AuthError | null;
};

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error: any) {
    return {
      user: null,
      session: null,
      error: {message: error?.message || 'Sign up failed', name: 'AuthError'} as any,
    };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    const {data, error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  } catch (error: any) {
    return {
      user: null,
      session: null,
      error: {message: error?.message || 'Sign in failed', name: 'AuthError'} as any,
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{error: AuthError | null}> => {
  const {error} = await supabase.auth.signOut();
  return {error};
};

/**
 * Get the current session
 */
export const getSession = async (): Promise<{
  session: AuthSession | null;
  error: AuthError | null;
}> => {
  const {data, error} = await supabase.auth.getSession();
  return {session: data.session, error};
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<{
  user: AuthUser | null;
  error: AuthError | null;
}> => {
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();
  return {user, error};
};

/**
 * Fetch user data from the users table
 */
export const getUserData = async (
  userId: string,
): Promise<{data: UserData | null; error: any}> => {
  try {
    const {data, error} = await supabase
      .from('users')
      .select(
        `
        id,
        plan_id,
        monthly_quota_used,
        quota_reset_date,
        preferences,
        plans!inner(name)
      `,
      )
      .eq('id', userId)
      .single();

    if (error) {
      return {data: null, error};
    }

    // Transform the data to match our UserData type
    const userData: UserData = {
      id: data.id,
      plan_id: data.plan_id,
      plan_name: (data.plans as any).name as 'free' | 'pro',
      monthly_quota_used: data.monthly_quota_used,
      quota_reset_date: data.quota_reset_date,
      preferences: data.preferences || {},
    };

    return {data: userData, error: null};
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {data: null, error};
  }
};

/**
 * Create user record in users table after signup
 * This should be called after successful auth signup
 * 
 * Uses supabaseAdmin (service role) to bypass RLS policies
 * This allows user profile creation even when the user's email is not yet verified
 */
export const createUserRecord = async (
  userId: string,
  email: string,
): Promise<{success: boolean; error: any}> => {
  try {
    // Get the free plan ID using admin client
    const {data: freePlan, error: planError} = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('name', 'free')
      .single();

    if (planError || !freePlan) {
      console.error('Error fetching free plan:', planError);
      return {
        success: false,
        error: planError || new Error('Free plan not found'),
      };
    }

    // Calculate next month's reset date
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    
    // Create user record using admin client (bypasses RLS)
    const {error} = await supabaseAdmin.from('users').insert({
      id: userId,
      email: email,
      plan_id: freePlan.id,
      monthly_quota_used: 0,
      quota_reset_date: resetDate.toISOString().split('T')[0],
      preferences: {
        language: 'en',
        theme: 'light',
      },
    });

    if (error) {
      console.error('Error creating user record:', error);
      return {success: false, error};
    }

    return {success: true, error: null};
  } catch (error) {
    console.error('Error creating user record:', error);
    return {success: false, error};
  }
};

/**
 * Update user's monthly quota
 */
export const incrementUserQuota = async (
  userId: string,
): Promise<{success: boolean; error: any}> => {
  try {
    const {error} = await supabase.rpc('increment_monthly_quota', {
      user_id: userId,
    });

    if (error) {
      return {success: false, error};
    }

    return {success: true, error: null};
  } catch (error) {
    console.error('Error incrementing quota:', error);
    return {success: false, error};
  }
};

/**
 * Check if user can access fault details
 * @param userId - User ID
 * @returns True if user can view fault details (based on plan and quota)
 */
export const canAccessFaultDetail = async (
  userId: string,
): Promise<{canAccess: boolean; error: any}> => {
  try {
    const {data, error} = await supabase.rpc('can_access_fault_detail', {
      user_id: userId,
    });

    if (error) {
      console.error('Error checking access:', error);
      return {canAccess: false, error};
    }

    return {canAccess: !!data, error: null};
  } catch (error) {
    console.error('Error checking access:', error);
    return {canAccess: false, error};
  }
};

/**
 * Upgrade user to pro plan
 */
export const upgradeToPro = async (
  userId: string,
): Promise<{success: boolean; error: any}> => {
  try {
    // Get the pro plan ID
    const {data: proPlan} = await supabase
      .from('plans')
      .select('id')
      .eq('name', 'pro')
      .single();

    if (!proPlan) {
      return {success: false, error: new Error('Pro plan not found')};
    }

    const {error} = await supabase
      .from('users')
      .update({plan_id: proPlan.id})
      .eq('id', userId);

    if (error) {
      return {success: false, error};
    }

    return {success: true, error: null};
  } catch (error) {
    console.error('Error upgrading to pro:', error);
    return {success: false, error};
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: AuthSession | null) => void,
) => {
  return supabase.auth.onAuthStateChange(callback);
};

