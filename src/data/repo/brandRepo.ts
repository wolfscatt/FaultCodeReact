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
} catch {
  // Env vars not available (likely in tests), use mock data
}

const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Select appropriate repository based on configuration
const brandRepo = USE_SUPABASE ? supabaseBrandRepo : mockBrandRepo;

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

