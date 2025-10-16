/**
 * Supabase Brand Repository
 * Fetches brand data from Supabase with bilingual support
 * Falls back to mock data if Supabase is unavailable
 */

import {supabase} from '@lib/supabase';
import {Brand} from '../../types';
import {normalizeSearch} from '@utils/index';
import {usePrefsStore} from '@state/usePrefsStore';

// Fallback to mock data - import directly from mock to avoid circular dependency
import * as mockBrandRepo from '../brandRepo.mock';

/**
 * Supabase brand type (with bilingual JSONB fields)
 */
type SupabaseBrand = {
  id: string;
  name: {en: string; tr: string};
  aliases: string[] | null;
  country: string | null;
  created_at: string;
};

/**
 * Converts Supabase brand (with JSONB) to app Brand type
 */
function convertSupabaseBrand(sb: SupabaseBrand, language: 'en' | 'tr'): Brand {
  return {
    id: sb.id,
    name: sb.name[language] || sb.name.en, // Fallback to English if translation missing
    aliases: sb.aliases || [],
    country: sb.country || undefined,
  };
}

/**
 * Searches brands by name or alias (Supabase version)
 */
export async function searchBrands(query: string): Promise<Brand[]> {
  try {
    const language = usePrefsStore.getState().language;

    // Fetch all brands (with client-side filtering for now)
    // In production, you could use Supabase full-text search on JSONB
    const {data, error} = await supabase
      .from('brands')
      .select('*')
      .order('name->en', {ascending: true});

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn('No brands found in Supabase, falling back to mock data');
      return mockBrandRepo.searchBrands(query);
    }

    // Convert to app Brand type
    let brands = data.map((sb: SupabaseBrand) => convertSupabaseBrand(sb, language));

    // Client-side search filtering
    if (query.trim()) {
      const normalizedQuery = normalizeSearch(query);
      brands = brands.filter((brand: Brand) => {
        const nameMatch = normalizeSearch(brand.name).includes(normalizedQuery);
        const aliasMatch = brand.aliases?.some((alias: string) =>
          normalizeSearch(alias).includes(normalizedQuery),
        );
        return nameMatch || aliasMatch;
      });
    }

    return brands;
  } catch (error) {
    console.warn('Supabase brand search failed, using mock data:', error);
    return mockBrandRepo.searchBrands(query);
  }
}

/**
 * Gets a brand by ID (Supabase version)
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const language = usePrefsStore.getState().language;

    const {data, error} = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      console.warn(`Brand ${id} not found in Supabase, falling back to mock data`);
      return mockBrandRepo.getBrandById(id);
    }

    return convertSupabaseBrand(data as SupabaseBrand, language);
  } catch (error) {
    console.warn('Supabase getBrandById failed, using mock data:', error);
    return mockBrandRepo.getBrandById(id);
  }
}

/**
 * Gets all brands (Supabase version)
 */
export async function getAllBrands(): Promise<Brand[]> {
  try {
    const language = usePrefsStore.getState().language;

    const {data, error} = await supabase
      .from('brands')
      .select('*')
      .order('name->en', {ascending: true});

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn('No brands found in Supabase, falling back to mock data');
      return mockBrandRepo.getAllBrands();
    }

    return data.map((sb: SupabaseBrand) => convertSupabaseBrand(sb, language));
  } catch (error) {
    console.warn('Supabase getAllBrands failed, using mock data:', error);
    return mockBrandRepo.getAllBrands();
  }
}

