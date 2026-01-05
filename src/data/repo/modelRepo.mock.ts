/**
 * Boiler Model Repository - Mock Implementation
 * Pure mock data repository (no Supabase)
 * Reads from local JSON file
 */

import {BoilerModel} from '../types';
import modelsData from '../mock/models.json';
import {delay} from '@utils/index';

// Simulate small network delay for consistency with other mock repos
const MOCK_DELAY_MS = 150;

/**
 * Returns all models for a given brand.
 */
export async function getModelsByBrand(brandId: string): Promise<BoilerModel[]> {
  await delay(MOCK_DELAY_MS);
  return (modelsData as BoilerModel[]).filter(model => model.brandId === brandId);
}

/**
 * Returns a model by ID.
 */
export async function getModelById(id: string): Promise<BoilerModel | null> {
  await delay(MOCK_DELAY_MS);
  const model = (modelsData as BoilerModel[]).find(m => m.id === id);
  return model ?? null;
}

/**
 * Returns all models.
 */
export async function getAllModels(): Promise<BoilerModel[]> {
  await delay(MOCK_DELAY_MS);
  return modelsData as BoilerModel[];
}

