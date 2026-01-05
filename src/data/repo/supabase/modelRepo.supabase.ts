/**
 * Supabase Boiler Model Repository
 * Fetches boiler model data from Supabase
 * No fallback to mock data - throws errors instead
 */

import {supabase} from '@lib/supabase';
import {BoilerModel} from '../../types';

/**
 * Supabase boiler model type
 */
type SupabaseBoilerModel = {
  id: string;
  brand_id: string;
  model_name: string;
  year_start: number | null;
  year_end: number | null;
  created_at: string;
  updated_at: string;
};

/**
 * Converts Supabase boiler model to app BoilerModel type
 */
function convertSupabaseModel(sm: SupabaseBoilerModel): BoilerModel {
  // Format years as "2018-2023" or just "2018" if only start year
  let years: string | undefined;
  if (sm.year_start) {
    if (sm.year_end && sm.year_end !== sm.year_start) {
      years = `${sm.year_start}-${sm.year_end}`;
    } else {
      years = `${sm.year_start}`;
    }
  }

  return {
    id: sm.id,
    brandId: sm.brand_id,
    modelName: sm.model_name,
    years,
  };
}

/**
 * Returns all models for a given brand (Supabase version)
 */
export async function getModelsByBrand(brandId: string): Promise<BoilerModel[]> {
  try {
    const {data, error} = await supabase
      .from('boiler_models')
      .select('*')
      .eq('brand_id', brandId)
      .order('model_name', {ascending: true});

    if (error) {
      console.error('Supabase getModelsByBrand error:', error);
      throw error;
    }

    // Empty result is valid - return empty array
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((sm: SupabaseBoilerModel) => convertSupabaseModel(sm));
  } catch (error) {
    console.error('Supabase getModelsByBrand failed:', error);
    throw error;
  }
}

/**
 * Returns a model by ID (Supabase version)
 */
export async function getModelById(id: string): Promise<BoilerModel | null> {
  try {
    const {data, error} = await supabase
      .from('boiler_models')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase getModelById error:', error);
      throw error;
    }

    // Not found is valid - return null
    if (!data) {
      return null;
    }

    return convertSupabaseModel(data as SupabaseBoilerModel);
  } catch (error) {
    console.error('Supabase getModelById failed:', error);
    throw error;
  }
}

/**
 * Returns all models (Supabase version)
 */
export async function getAllModels(): Promise<BoilerModel[]> {
  try {
    const {data, error} = await supabase
      .from('boiler_models')
      .select('*')
      .order('model_name', {ascending: true});

    if (error) {
      console.error('Supabase getAllModels error:', error);
      throw error;
    }

    // Empty result is valid - return empty array
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((sm: SupabaseBoilerModel) => convertSupabaseModel(sm));
  } catch (error) {
    console.error('Supabase getAllModels failed:', error);
    throw error;
  }
}

