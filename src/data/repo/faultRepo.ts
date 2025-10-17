/**
 * Fault Code Repository
 * Handles fault code and resolution step data with advanced search and relevancy ranking
 * 
 * This is the main entry point for fault code data.
 * By default, it uses Supabase with automatic fallback to mock data.
 * 
 * To force mock data (for testing), import from './faultRepo.mock' instead.
 */

import {FaultCode, SearchFilters, FaultDetailResult} from '../types';
import * as mockFaultRepo from './faultRepo.mock';
import * as supabaseFaultRepo from './supabase/faultRepo.supabase';

// Check if Supabase is configured
// Safely import env vars (may not be available in tests)
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

try {
  const env = require('@env');
  SUPABASE_URL = env.SUPABASE_URL || '';
  SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';
  
  // Debug logging
  console.log('[FaultRepo] Environment check:', {
    SUPABASE_URL: SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  });
} catch (error) {
  console.log('[FaultRepo] Environment import failed:', error);
  
  // FALLBACK: Try direct environment variable access
  try {
    SUPABASE_URL = process.env.SUPABASE_URL || '';
    SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
    console.log('[FaultRepo] Fallback environment check:', {
      SUPABASE_URL: SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    });
  } catch (fallbackError) {
    console.log('[FaultRepo] Fallback environment access failed:', fallbackError);
  }
}

const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
console.log('[FaultRepo] Using Supabase:', USE_SUPABASE);

// TEMPORARY FIX: Force Supabase usage if environment variables are not loading
// Remove this after confirming environment variables work
const FORCE_SUPABASE = true;
const finalUseSupabase = USE_SUPABASE || FORCE_SUPABASE;
console.log('[FaultRepo] Final decision - Using Supabase:', finalUseSupabase);

// Select appropriate repository based on configuration
const faultRepo = finalUseSupabase ? supabaseFaultRepo : mockFaultRepo;

/**
 * Search faults with relevancy scoring
 * Priority: brand match > exact code match > title match > summary match
 */
export const searchFaults = faultRepo.searchFaults;

/**
 * Gets fault detail with resolution steps
 */
export const getFaultById = faultRepo.getFaultById;

/**
 * Gets recent fault codes (for suggestions, etc.)
 * In real implementation, this would track user history
 */
export const getRecentFaults = faultRepo.getRecentFaults;

