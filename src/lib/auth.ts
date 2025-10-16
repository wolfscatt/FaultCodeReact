/**
 * Supabase Authentication Service
 * 
 * Provides authentication methods and user management
 */

import {supabase} from './supabase';
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
  daily_quota_used: number;
  last_quota_reset_date: string;
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
        daily_quota_used,
        last_quota_reset_date,
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
      daily_quota_used: data.daily_quota_used,
      last_quota_reset_date: data.last_quota_reset_date,
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
 */
export const createUserRecord = async (
  userId: string,
): Promise<{success: boolean; error: any}> => {
  try {
    // Get the free plan ID
    const {data: freePlan} = await supabase
      .from('plans')
      .select('id')
      .eq('name', 'free')
      .single();

    if (!freePlan) {
      return {success: false, error: new Error('Free plan not found')};
    }

    const {error} = await supabase.from('users').insert({
      id: userId,
      plan_id: freePlan.id,
      daily_quota_used: 0,
      last_quota_reset_date: new Date().toISOString().split('T')[0],
      preferences: {
        language: 'en',
        theme: 'light',
      },
    });

    if (error) {
      return {success: false, error};
    }

    return {success: true, error: null};
  } catch (error) {
    console.error('Error creating user record:', error);
    return {success: false, error};
  }
};

/**
 * Update user's daily quota
 */
export const incrementUserQuota = async (
  userId: string,
): Promise<{success: boolean; error: any}> => {
  try {
    const {error} = await supabase.rpc('increment_user_quota', {
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

