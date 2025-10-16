/**
 * Brand Repository - Mock Implementation
 * Pure mock data repository (no Supabase)
 * Now supports bilingual data through on-the-fly translation
 */

import {Brand} from '../types';
import brandsData from '../mock/brands.json';
import {normalizeSearch, delay} from '@utils/index';
import {toBilingualBrand} from './bilingual';
import {usePrefsStore} from '@state/usePrefsStore';

// Simulate network delay for realistic mock behavior
const MOCK_DELAY_MS = 150;

/**
 * Searches brands by name or alias
 * Returns brands matching the query (case-insensitive)
 */
export async function searchBrands(query: string): Promise<Brand[]> {
  await delay(MOCK_DELAY_MS);
  const language = usePrefsStore.getState().language;

  let brands = brandsData as Brand[];

  if (query.trim()) {
    const normalizedQuery = normalizeSearch(query);
    brands = brands.filter(brand => {
      const nameMatch = normalizeSearch(brand.name).includes(normalizedQuery);
      const aliasMatch = brand.aliases?.some(alias =>
        normalizeSearch(alias).includes(normalizedQuery),
      );
      return nameMatch || aliasMatch;
    });
  }

  return brands.map(brand => toBilingualBrand(brand, language));
}

/**
 * Gets a brand by ID
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  await delay(MOCK_DELAY_MS);
  const language = usePrefsStore.getState().language;

  const brand = (brandsData as Brand[]).find(b => b.id === id);
  return brand ? toBilingualBrand(brand, language) : null;
}

/**
 * Gets all brands (for dropdowns, etc.)
 */
export async function getAllBrands(): Promise<Brand[]> {
  await delay(MOCK_DELAY_MS);
  const language = usePrefsStore.getState().language;

  return (brandsData as Brand[]).map(brand => toBilingualBrand(brand, language));
}

