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
import {SUPABASE_URL, SUPABASE_ANON_KEY} from '@env';

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not found. Please configure SUPABASE_URL and SUPABASE_ANON_KEY in .env file.',
  );
}

/**
 * Supabase client instance
 * 
 * Configured with:
 * - URL: Your Supabase project URL
 * - Anon Key: Your Supabase anonymous/public API key
 * - Auth: Persists session in async storage (ready for future auth implementation)
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

