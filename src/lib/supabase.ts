/**
 * Supabase Client Configuration
 * 
 * This module initializes and exports the Supabase client for use throughout the app.
 * Credentials are loaded from environment variables (.env file).
 * 
 * Usage:
 *   import { supabase } from '@lib/supabase';
 *   const { data, error } = await supabase.from('table_name').select();
 */

import {createClient} from '@supabase/supabase-js';
import {SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY} from '@env';

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not found. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in .env file.',
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    'Supabase service role key not found. Admin operations (like creating user profiles) may fail.',
  );
}

/**
 * Supabase client instance (Public/Anon)
 * 
 * Configured with:
 * - URL: Your Supabase project URL
 * - Anon Key: Your Supabase anonymous/public API key
 * - Auth: Persists session in async storage
 * 
 * Use this for all user-facing operations (respects RLS policies)
 */
export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      // When implementing auth, you can configure storage here
      // storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

/**
 * Supabase admin client instance (Service Role)
 * 
 * Configured with:
 * - URL: Your Supabase project URL
 * - Service Role Key: Your Supabase service role key (bypasses RLS)
 * 
 * ⚠️ WARNING: This client bypasses Row Level Security!
 * Only use for trusted server-side operations like:
 * - Creating user profiles after signup
 * - Admin operations
 * - Background jobs
 * 
 * NEVER expose this client to the frontend or use it for user operations!
 */
export const supabaseAdmin = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || '', // Fallback to anon key if service role not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Helper function to check Supabase connection
 * @returns Promise<boolean> - true if connected, false otherwise
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const {error} = await supabase.from('_health_check').select('*').limit(1);
    // If table doesn't exist, that's fine - we're just checking connectivity
    if (error && !error.message.includes('does not exist')) {
      console.error('Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

export default supabase;

