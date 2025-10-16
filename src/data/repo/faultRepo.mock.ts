/**
 * Fault Code Repository - Mock Implementation
 * Pure mock data repository (no Supabase)
 * Now supports bilingual data through on-the-fly translation
 */

import {FaultCode, ResolutionStep, SearchFilters, FaultDetailResult} from '../types';
import faultCodesData from '../mock/fault_codes.json';
import stepsData from '../mock/steps.json';
import {normalizeSearch, delay} from '@utils/index';
import {toBilingualFaultCode, toBilingualStep} from './bilingual';
import {usePrefsStore} from '@state/usePrefsStore';

const MOCK_DELAY_MS = 200;

/**
 * Search faults with relevancy scoring
 * Priority: brand match > exact code match > title match > summary match
 */
export async function searchFaults(filters: SearchFilters): Promise<FaultCode[]> {
  await delay(MOCK_DELAY_MS);
  const language = usePrefsStore.getState().language;

  let results = faultCodesData as FaultCode[];

  // Filter by brand if specified
  if (filters.brandId) {
    results = results.filter(fault => fault.brandId === filters.brandId);
  }

  // Filter by model if specified
  if (filters.modelId) {
    results = results.filter(
      fault =>
        !fault.boilerModelId || // Applies to all models
        fault.boilerModelId === filters.modelId,
    );
  }

  // Search by query with relevancy scoring
  if (filters.q && filters.q.trim()) {
    const normalizedQuery = normalizeSearch(filters.q);

    // Score each result based on match type
    // Scoring: brand exact +10, code exact +8, title includes +4, summary includes +2
    const scored = results.map(fault => {
      let score = 0;

      // Brand exact match (if brandId filter matches)
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

    // Filter out non-matches and sort by score (highest first)
    results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.fault);
  }

  // Convert to bilingual format based on current language
  return results.map(fault => toBilingualFaultCode(fault, language));
}

/**
 * Gets fault detail with resolution steps
 */
export async function getFaultById(id: string): Promise<FaultDetailResult | null> {
  await delay(MOCK_DELAY_MS);
  const language = usePrefsStore.getState().language;

  const fault = (faultCodesData as FaultCode[]).find(f => f.id === id);
  if (!fault) {
    return null;
  }

  // Get associated resolution steps
  const steps = (stepsData as ResolutionStep[])
    .filter(step => step.faultCodeId === id)
    .sort((a, b) => a.order - b.order);

  // Convert to bilingual format based on current language
  return {
    fault: toBilingualFaultCode(fault, language),
    steps: steps.map(step => toBilingualStep(step, language)),
  };
}

/**
 * Gets recent fault codes (for suggestions, etc.)
 * In real implementation, this would track user history
 */
export async function getRecentFaults(limit: number = 10): Promise<FaultCode[]> {
  await delay(MOCK_DELAY_MS);
  const language = usePrefsStore.getState().language;

  // For now, return most recently verified faults
  const sorted = [...(faultCodesData as FaultCode[])].sort((a, b) => {
    const dateA = a.lastVerifiedAt ? new Date(a.lastVerifiedAt).getTime() : 0;
    const dateB = b.lastVerifiedAt ? new Date(b.lastVerifiedAt).getTime() : 0;
    return dateB - dateA;
  });

  // Convert to bilingual format based on current language
  return sorted.slice(0, limit).map(fault => toBilingualFaultCode(fault, language));
}

