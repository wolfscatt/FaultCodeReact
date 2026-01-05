/**
 * Brand Repository
 * Handles brand data access with search capabilities
 * 
 * This is the main entry point for brand data.
 * By default, it uses Supabase with automatic fallback to mock data.
 * 
 * To force mock data (for testing), import from './brandRepo.mock' instead.
 */

import {Brand} from '../types';
import * as mockBrandRepo from './brandRepo.mock';
import * as supabaseBrandRepo from './supabase/brandRepo.supabase';

// Check if Supabase is configured
// Safely import env vars (may not be available in tests)
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

try {
  const env = require('@env');
  SUPABASE_URL = env.SUPABASE_URL || '';
  SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';
  
  // Debug logging
  console.log('[BrandRepo] Environment check:', {
    SUPABASE_URL: SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  });
} catch (error) {
  console.log('[BrandRepo] Environment import failed:', error);
  
  // FALLBACK: Try direct environment variable access
  try {
    SUPABASE_URL = process.env.SUPABASE_URL || '';
    SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
    console.log('[BrandRepo] Fallback environment check:', {
      SUPABASE_URL: SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    });
  } catch (fallbackError) {
    console.log('[BrandRepo] Fallback environment access failed:', fallbackError);
  }
}

const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
console.log('[BrandRepo] Using Supabase:', USE_SUPABASE);

// TEMPORARY FIX: Force Supabase usage if environment variables are not loading
// Remove this after confirming environment variables work
const FORCE_SUPABASE = true;
const finalUseSupabase = USE_SUPABASE || FORCE_SUPABASE;
console.log('[BrandRepo] Final decision - Using Supabase:', finalUseSupabase);

// Select appropriate repository based on configuration
const brandRepo = finalUseSupabase ? supabaseBrandRepo : mockBrandRepo;

/**
 * Searches brands by name or alias
 * Returns brands matching the query (case-insensitive)
 */
export const searchBrands = brandRepo.searchBrands;

/**
 * Gets a brand by ID
 */
export const getBrandById = brandRepo.getBrandById;

/**
 * Gets all brands (for dropdowns, etc.)
 */
export const getAllBrands = brandRepo.getAllBrands;

