/**
 * Favorites Repository
 * Handles user's saved fault codes (Premium-only feature)
 */

import {supabase} from '@lib/supabase';
import {FaultCode} from '../types';

export type Favorite = {
  id: string;
  userId: string;
  faultCodeId: string;
  createdAt: string;
};

export type FavoriteWithFault = Favorite & {
  faultCode: FaultCode;
};

/**
 * Add a fault code to favorites
 * @param userId - User ID
 * @param faultCodeId - Fault code ID to save
 * @returns Success status and error if any
 */
export async function addFavorite(
  userId: string,
  faultCodeId: string,
): Promise<{success: boolean; error: any}> {
  try {
    // Check if this is mock data (non-UUID format)
    if (!faultCodeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.warn('Mock data detected - favorites not persisted to Supabase');
      return {success: true, error: null}; // Mock success for development
    }

    const {error} = await supabase.from('favorites').insert({
      user_id: userId,
      fault_code_id: faultCodeId,
    });

    if (error) {
      // Check if it's a duplicate (already favorited)
      if (error.code === '23505') {
        return {success: true, error: null}; // Already favorited is not an error
      }
      console.error('Error adding favorite:', error);
      return {success: false, error};
    }

    return {success: true, error: null};
  } catch (error) {
    console.error('Error adding favorite:', error);
    return {success: false, error};
  }
}

/**
 * Remove a fault code from favorites
 * @param userId - User ID
 * @param faultCodeId - Fault code ID to remove
 * @returns Success status and error if any
 */
export async function removeFavorite(
  userId: string,
  faultCodeId: string,
): Promise<{success: boolean; error: any}> {
  try {
    // Check if this is mock data (non-UUID format)
    if (!faultCodeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.warn('Mock data detected - favorites not persisted to Supabase');
      return {success: true, error: null}; // Mock success for development
    }

    const {error} = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('fault_code_id', faultCodeId);

    if (error) {
      console.error('Error removing favorite:', error);
      return {success: false, error};
    }

    return {success: true, error: null};
  } catch (error) {
    console.error('Error removing favorite:', error);
    return {success: false, error};
  }
}

/**
 * Get all favorites for a user with fault code details
 * @param userId - User ID
 * @returns Array of favorites with fault code data
 */
export async function getUserFavorites(
  userId: string,
): Promise<{data: FavoriteWithFault[]; error: any}> {
  try {
    const {data, error} = await supabase
      .from('favorites')
      .select(
        `
        id,
        user_id,
        fault_code_id,
        created_at,
        fault_codes (
          id,
          brand_id,
          boiler_model_id,
          code,
          title,
          severity,
          summary,
          causes,
          safety_notice,
          last_verified_at,
          created_at,
          updated_at
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', {ascending: false});

    if (error) {
      console.error('Error fetching favorites:', error);
      return {data: [], error};
    }

    // Transform the data to match our types
    const favorites: FavoriteWithFault[] =
      data?.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        faultCodeId: item.fault_code_id,
        createdAt: item.created_at,
        faultCode: {
          id: item.fault_codes.id,
          brandId: item.fault_codes.brand_id,
          boilerModelId: item.fault_codes.boiler_model_id,
          code: item.fault_codes.code,
          title: item.fault_codes.title,
          severity: item.fault_codes.severity,
          summary: item.fault_codes.summary,
          causes: item.fault_codes.causes,
          safetyNotice: item.fault_codes.safety_notice,
          lastVerifiedAt: item.fault_codes.last_verified_at,
          createdAt: item.fault_codes.created_at,
          updatedAt: item.fault_codes.updated_at,
        },
      })) || [];

    return {data: favorites, error: null};
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return {data: [], error};
  }
}

/**
 * Check if a fault code is favorited by a user
 * @param userId - User ID
 * @param faultCodeId - Fault code ID to check
 * @returns True if favorited, false otherwise
 */
export async function isFavorited(
  userId: string,
  faultCodeId: string,
): Promise<{isFavorited: boolean; error: any}> {
  try {
    // Check if this is mock data (non-UUID format)
    if (!faultCodeId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.warn('Mock data detected - returning false for favorites check');
      return {isFavorited: false, error: null}; // Mock data not favorited
    }

    const {data, error} = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('fault_code_id', faultCodeId)
      .single();

    if (error) {
      // Not found is not an error for this check
      if (error.code === 'PGRST116') {
        return {isFavorited: false, error: null};
      }
      console.error('Error checking favorite status:', error);
      return {isFavorited: false, error};
    }

    return {isFavorited: !!data, error: null};
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return {isFavorited: false, error};
  }
}

/**
 * Get count of favorites for a user
 * @param userId - User ID
 * @returns Count of favorites
 */
export async function getFavoritesCount(
  userId: string,
): Promise<{count: number; error: any}> {
  try {
    const {count, error} = await supabase
      .from('favorites')
      .select('*', {count: 'exact', head: true})
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting favorites count:', error);
      return {count: 0, error};
    }

    return {count: count || 0, error: null};
  } catch (error) {
    console.error('Error getting favorites count:', error);
    return {count: 0, error};
  }
}

