/**
 * Supabase Repository Index
 * 
 * This module exports Supabase-based repositories with automatic fallback to mock data.
 * 
 * Usage:
 *   import { searchBrands, searchFaults } from '@data/repo/supabase';
 * 
 * Features:
 *   - Bilingual support (reads JSONB fields based on user language)
 *   - Automatic fallback to mock data if Supabase fails or returns no data
 *   - Same API as mock repositories for seamless integration
 */

export * from './brandRepo.supabase';
export * from './faultRepo.supabase';

