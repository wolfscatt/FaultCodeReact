/**
 * Supabase Fault Code Repository
 * Fetches fault codes and resolution steps from Supabase with bilingual support
 * Falls back to mock data if Supabase is unavailable
 */

import {supabase} from '@lib/supabase';
import {FaultCode, ResolutionStep, SearchFilters, FaultDetailResult, SeverityLevel} from '../../types';
import {normalizeSearch} from '@utils/index';
import {usePrefsStore} from '@state/usePrefsStore';

// Fallback to mock data
import * as mockFaultRepo from '../faultRepo';

/**
 * Supabase fault code type (with bilingual JSONB fields)
 */
type SupabaseFaultCode = {
  id: string;
  brand_id: string;
  code: string;
  title: {en: string; tr: string};
  severity: SeverityLevel;
  summary: {en: string; tr: string};
  causes: {en: string[]; tr: string[]};
  safety_notice: {en: string; tr: string} | null;
  last_verified_at: string | null;
};

/**
 * Supabase resolution step type (with bilingual JSONB fields)
 */
type SupabaseResolutionStep = {
  id: string;
  fault_code_id: string;
  order_number: number;
  text: {en: string; tr: string};
  estimated_time_min: number | null;
  requires_pro: boolean;
  tools: {en: string[]; tr: string[]} | null;
  image_url: string | null;
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
    safetyNotice: sf.safety_notice?.[language] || sf.safety_notice?.en,
    lastVerifiedAt: sf.last_verified_at || undefined,
  };
}

/**
 * Converts Supabase resolution step to app ResolutionStep type
 */
function convertSupabaseStep(ss: SupabaseResolutionStep, language: 'en' | 'tr'): ResolutionStep {
  return {
    id: ss.id,
    faultCodeId: ss.fault_code_id,
    order: ss.order_number,
    text: ss.text[language] || ss.text.en,
    estimatedTimeMin: ss.estimated_time_min || undefined,
    requiresPro: ss.requires_pro,
    tools: ss.tools?.[language] || ss.tools?.en || [],
    imageUrl: ss.image_url || undefined,
  };
}

/**
 * Search faults with relevancy scoring (Supabase version)
 */
export async function searchFaults(filters: SearchFilters): Promise<FaultCode[]> {
  try {
    const language = usePrefsStore.getState().language;

    // Build query
    let query = supabase.from('fault_codes').select('*');

    // Filter by brand
    if (filters.brandId) {
      query = query.eq('brand_id', filters.brandId);
    }

    // Execute query
    const {data, error} = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn('No faults found in Supabase, falling back to mock data');
      return mockFaultRepo.searchFaults(filters);
    }

    // Convert to app FaultCode type
    let results = data.map((sf: SupabaseFaultCode) => convertSupabaseFault(sf, language));

    // Client-side search with relevancy scoring
    if (filters.q && filters.q.trim()) {
      const normalizedQuery = normalizeSearch(filters.q);

      // Score each result
      const scored = results.map((fault: FaultCode) => {
        let score = 0;

        // Brand exact match
        if (filters.brandId && fault.brandId === filters.brandId) {
          score += 10;
        }

        // Code exact match
        if (normalizeSearch(fault.code) === normalizedQuery) {
          score += 8;
        }

        // Title includes query
        if (normalizeSearch(fault.title).includes(normalizedQuery)) {
          score += 4;
        }

        // Summary includes query
        if (normalizeSearch(fault.summary).includes(normalizedQuery)) {
          score += 2;
        }

        return {fault, score};
      });

      // Filter and sort by score
      results = scored
        .filter((item: {fault: FaultCode; score: number}) => item.score > 0)
        .sort((a: {fault: FaultCode; score: number}, b: {fault: FaultCode; score: number}) => b.score - a.score)
        .map((item: {fault: FaultCode; score: number}) => item.fault);
    }

    return results;
  } catch (error) {
    console.warn('Supabase fault search failed, using mock data:', error);
    return mockFaultRepo.searchFaults(filters);
  }
}

/**
 * Gets fault detail with resolution steps (Supabase version)
 */
export async function getFaultById(id: string): Promise<FaultDetailResult | null> {
  try {
    const language = usePrefsStore.getState().language;

    // Fetch fault code
    const {data: faultData, error: faultError} = await supabase
      .from('fault_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (faultError) throw faultError;

    if (!faultData) {
      console.warn(`Fault ${id} not found in Supabase, falling back to mock data`);
      return mockFaultRepo.getFaultById(id);
    }

    // Fetch resolution steps
    const {data: stepsData, error: stepsError} = await supabase
      .from('resolution_steps')
      .select('*')
      .eq('fault_code_id', id)
      .order('order_number', {ascending: true});

    if (stepsError) throw stepsError;

    // Convert to app types
    const fault = convertSupabaseFault(faultData as SupabaseFaultCode, language);
    const steps = (stepsData || []).map((ss: SupabaseResolutionStep) =>
      convertSupabaseStep(ss, language),
    );

    return {fault, steps};
  } catch (error) {
    console.warn('Supabase getFaultById failed, using mock data:', error);
    return mockFaultRepo.getFaultById(id);
  }
}

/**
 * Gets recent fault codes (Supabase version)
 */
export async function getRecentFaults(limit: number = 10): Promise<FaultCode[]> {
  try {
    const language = usePrefsStore.getState().language;

    const {data, error} = await supabase
      .from('fault_codes')
      .select('*')
      .order('last_verified_at', {ascending: false, nullsLast: true})
      .limit(limit);

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn('No recent faults found in Supabase, falling back to mock data');
      return mockFaultRepo.getRecentFaults(limit);
    }

    return data.map((sf: SupabaseFaultCode) => convertSupabaseFault(sf, language));
  } catch (error) {
    console.warn('Supabase getRecentFaults failed, using mock data:', error);
    return mockFaultRepo.getRecentFaults(limit);
  }
}

