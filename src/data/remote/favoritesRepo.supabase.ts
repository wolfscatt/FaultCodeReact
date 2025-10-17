/**
 * Supabase Favorites Repository
 * Handles user's saved fault codes (Premium-only feature)
 * NO MOCK FALLBACK - Supabase only
 */

import {supabase} from '@lib/supabase';
import {FaultCode} from '@data/types';
import {usePrefsStore} from '@state/usePrefsStore';

export type Favorite = {
  id: string;
  user_id: string;
  fault_code_id: string;
  created_at: string;
};

export type FavoriteWithFault = Favorite & {
  fault_codes: FaultCode;
};

// Supabase fault code type (with JSONB fields)
type SupabaseFaultCode = {
  id: string;
  brand_id: string;
  code: string;
  title: {en: string; tr: string};
  severity: 'info' | 'warning' | 'critical';
  summary: {en: string; tr: string};
  causes: {en: string[]; tr: string[]};
  safety_notice: {en: string; tr: string} | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Converts Supabase fault code to app FaultCode type
 */
function convertSupabaseFault(sf: SupabaseFaultCode, language: 'en' | 'tr'): FaultCode {
  return {
    id: sf.id,
    brandId: sf.brand_id,
    code: sf.code,
    title: sf.title[language] || sf.title.en,
    severity: sf.severity,
    summary: sf.summary[language] || sf.summary.en,
    causes: sf.causes[language] || sf.causes.en,
    safetyNotice: sf.safety_notice?.[language] || sf.safety_notice?.en || undefined,
    lastVerifiedAt: sf.last_verified_at || undefined,
  };
}

/**
 * Add a fault code to favorites (idempotent)
 * @param userId - User ID
 * @param faultCodeId - Fault code ID to save
 * @returns Success status with created flag
 */
export async function addFavorite(
  userId: string,
  faultCodeId: string,
): Promise<{created: boolean; error: any}> {
  try {
    console.log(`[Favorites] Adding favorite: user=${userId}, fault=${faultCodeId}`);
    
    // Check if this is a valid UUID (Supabase format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!faultCodeId.match(uuidRegex)) {
      console.error(`[Favorites] Invalid fault ID format: ${faultCodeId}. Expected UUID format.`);
      return {
        created: false, 
        error: {
          code: 'INVALID_ID_FORMAT',
          message: `Invalid fault ID format: ${faultCodeId}. Expected UUID format.`,
        }
      };
    }
    
    const {data, error} = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        fault_code_id: faultCodeId,
      })
      .select('id')
      .single();

    if (error) {
      // Check if it's a duplicate (already favorited)
      if (error.code === '23505') {
        console.log(`[Favorites] Already favorited: user=${userId}, fault=${faultCodeId}`);
        return {created: false, error: null}; // Already favorited is not an error
      }
      console.error('[Favorites] Error adding favorite:', error);
      return {created: false, error};
    }

    console.log(`[Favorites] Successfully added favorite: ${data.id}`);
    return {created: true, error: null};
  } catch (error) {
    console.error('[Favorites] Exception adding favorite:', error);
    return {created: false, error};
  }
}

/**
 * Remove a fault code from favorites
 * @param userId - User ID
 * @param faultCodeId - Fault code ID to remove
 * @returns Success status with removed flag
 */
export async function removeFavorite(
  userId: string,
  faultCodeId: string,
): Promise<{removed: boolean; error: any}> {
  try {
    console.log(`[Favorites] Removing favorite: user=${userId}, fault=${faultCodeId}`);
    
    const {error} = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('fault_code_id', faultCodeId);

    if (error) {
      console.error('[Favorites] Error removing favorite:', error);
      return {removed: false, error};
    }

    console.log(`[Favorites] Successfully removed favorite: user=${userId}, fault=${faultCodeId}`);
    return {removed: true, error: null};
  } catch (error) {
    console.error('[Favorites] Exception removing favorite:', error);
    return {removed: false, error};
  }
}

/**
 * Get all favorites for a user with fault code details
 * @param userId - User ID
 * @returns Array of favorites with fault code data
 */
export async function listFavorites(userId: string): Promise<FaultCode[]> {
  try {
    console.log(`[Favorites] Listing favorites for user: ${userId}`);
    
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
      console.error('[Favorites] Error fetching favorites:', error);
      return [];
    }

    // Get current language
    const language = usePrefsStore.getState().language;

    // Transform the data to match our types
    const favorites: FaultCode[] = data?.map((item: any) => 
      convertSupabaseFault(item.fault_codes as SupabaseFaultCode, language)
    ) || [];

    console.log(`[Favorites] Found ${favorites.length} favorites for user: ${userId}`);
    return favorites;
  } catch (error) {
    console.error('[Favorites] Exception fetching favorites:', error);
    return [];
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
    console.log(`[Favorites] Checking favorite status: user=${userId}, fault=${faultCodeId}`);
    
    const {data, error} = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('fault_code_id', faultCodeId)
      .single();

    if (error) {
      // Not found is not an error for this check
      if (error.code === 'PGRST116') {
        console.log(`[Favorites] Not favorited: user=${userId}, fault=${faultCodeId}`);
        return {isFavorited: false, error: null};
      }
      console.error('[Favorites] Error checking favorite status:', error);
      return {isFavorited: false, error};
    }

    const isFav = !!data;
    console.log(`[Favorites] Favorite status: ${isFav} for user=${userId}, fault=${faultCodeId}`);
    return {isFavorited: isFav, error: null};
  } catch (error) {
    console.error('[Favorites] Exception checking favorite status:', error);
    return {isFavorited: false, error};
  }
}

/**
 * Get count of favorites for a user
 * @param userId - User ID
 * @returns Count of favorites
 */
export async function getFavoritesCount(userId: string): Promise<{count: number; error: any}> {
  try {
    console.log(`[Favorites] Getting favorites count for user: ${userId}`);
    
    const {count, error} = await supabase
      .from('favorites')
      .select('*', {count: 'exact', head: true})
      .eq('user_id', userId);

    if (error) {
      console.error('[Favorites] Error fetching favorites count:', error);
      return {count: 0, error};
    }
    
    console.log(`[Favorites] User ${userId} has ${count} favorites`);
    return {count: count || 0, error: null};
  } catch (error) {
    console.error('[Favorites] Exception fetching favorites count:', error);
    return {count: 0, error};
  }
}
