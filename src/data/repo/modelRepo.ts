/**
 * Boiler Model Repository
 * Handles boiler model data access.
 * 
 * This is the main entry point for boiler model data.
 * By default, it uses Supabase with automatic fallback to mock data.
 * 
 * To force mock data (for testing), import from './modelRepo.mock' instead.
 */

import * as mockModelRepo from './modelRepo.mock';
import * as supabaseModelRepo from './supabase/modelRepo.supabase';

// Check if Supabase is configured
// Safely import env vars (may not be available in tests)
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

try {
  const env = require('@env');
  SUPABASE_URL = env.SUPABASE_URL || '';
  SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';
  
  // Debug logging
  console.log('[ModelRepo] Environment check:', {
    SUPABASE_URL: SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
  });
} catch (error) {
  console.log('[ModelRepo] Environment import failed:', error);
  
  // FALLBACK: Try direct environment variable access
  try {
    SUPABASE_URL = process.env.SUPABASE_URL || '';
    SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
    console.log('[ModelRepo] Fallback environment check:', {
      SUPABASE_URL: SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    });
  } catch (fallbackError) {
    console.log('[ModelRepo] Fallback environment access failed:', fallbackError);
  }
}

const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
console.log('[ModelRepo] Using Supabase:', USE_SUPABASE);

// TEMPORARY FIX: Force Supabase usage if environment variables are not loading
// Remove this after confirming environment variables work
const FORCE_SUPABASE = true;
const finalUseSupabase = USE_SUPABASE || FORCE_SUPABASE;
console.log('[ModelRepo] Final decision - Using Supabase:', finalUseSupabase);

// Select appropriate repository based on configuration
const modelRepo = finalUseSupabase ? supabaseModelRepo : mockModelRepo;

/**
 * Returns all models for a given brand.
 */
export const getModelsByBrand = modelRepo.getModelsByBrand;

/**
 * Returns a model by ID.
 */
export const getModelById = modelRepo.getModelById;

/**
 * Returns all models.
 */
export const getAllModels = modelRepo.getAllModels;


