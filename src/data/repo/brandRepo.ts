/**
 * Brand Repository
 * Handles brand data access with search capabilities
 */

import {Brand} from '../types';
import brandsData from '../mock/brands.json';
import {normalizeSearch, delay} from '@utils/index';

// Simulate network delay for realistic mock behavior
const MOCK_DELAY_MS = 150;

/**
 * Searches brands by name or alias
 * Returns brands matching the query (case-insensitive)
 */
export async function searchBrands(query: string): Promise<Brand[]> {
  await delay(MOCK_DELAY_MS);

  if (!query.trim()) {
    return brandsData as Brand[];
  }

  const normalizedQuery = normalizeSearch(query);

  return (brandsData as Brand[]).filter(brand => {
    const nameMatch = normalizeSearch(brand.name).includes(normalizedQuery);
    const aliasMatch = brand.aliases?.some(alias =>
      normalizeSearch(alias).includes(normalizedQuery),
    );
    return nameMatch || aliasMatch;
  });
}

/**
 * Gets a brand by ID
 */
export async function getBrandById(id: string): Promise<Brand | null> {
  await delay(MOCK_DELAY_MS);

  const brand = (brandsData as Brand[]).find(b => b.id === id);
  return brand || null;
}

/**
 * Gets all brands (for dropdowns, etc.)
 */
export async function getAllBrands(): Promise<Brand[]> {
  await delay(MOCK_DELAY_MS);
  return brandsData as Brand[];
}

