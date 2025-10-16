/**
 * Bilingual Data Utilities
 * 
 * Helpers to convert between mock data (English-only) and bilingual format
 * This ensures consistent data format across mock and Supabase sources
 */

import {FaultCode, ResolutionStep, Brand} from '../types';
import {simpleTranslate, translateArray} from '../../../scripts/translations';

/**
 * Bilingual text object
 */
export type BilingualText = {
  en: string;
  tr: string;
};

/**
 * Bilingual array object
 */
export type BilingualArray = {
  en: string[];
  tr: string[];
};

/**
 * Converts English text to bilingual object
 */
export function toBilingualText(englishText: string): BilingualText {
  return {
    en: englishText,
    tr: simpleTranslate(englishText),
  };
}

/**
 * Converts English array to bilingual array object
 */
export function toBilingualArray(englishArray: string[]): BilingualArray {
  return {
    en: englishArray,
    tr: translateArray(englishArray),
  };
}

/**
 * Extracts text from bilingual object based on language
 */
export function fromBilingualText(
  bilingualText: BilingualText | string,
  language: 'en' | 'tr',
): string {
  if (typeof bilingualText === 'string') {
    // Mock data format - translate on the fly
    return language === 'tr' ? simpleTranslate(bilingualText) : bilingualText;
  }
  return bilingualText[language] || bilingualText.en;
}

/**
 * Extracts array from bilingual object based on language
 */
export function fromBilingualArray(
  bilingualArray: BilingualArray | string[],
  language: 'en' | 'tr',
): string[] {
  if (Array.isArray(bilingualArray)) {
    // Mock data format - translate on the fly
    return language === 'tr' ? translateArray(bilingualArray) : bilingualArray;
  }
  return bilingualArray[language] || bilingualArray.en;
}

/**
 * Converts mock FaultCode to bilingual-compatible format
 * This allows mock data to work with language switching
 */
export function toBilingualFaultCode(fault: FaultCode, language: 'en' | 'tr'): FaultCode {
  return {
    ...fault,
    title: fromBilingualText(fault.title as any, language),
    summary: fromBilingualText(fault.summary as any, language),
    causes: fromBilingualArray(fault.causes as any, language),
    safetyNotice: fault.safetyNotice
      ? fromBilingualText(fault.safetyNotice as any, language)
      : undefined,
  };
}

/**
 * Converts mock ResolutionStep to bilingual-compatible format
 */
export function toBilingualStep(step: ResolutionStep, language: 'en' | 'tr'): ResolutionStep {
  return {
    ...step,
    text: fromBilingualText(step.text as any, language),
    tools: step.tools ? fromBilingualArray(step.tools as any, language) : undefined,
  };
}

/**
 * Converts mock Brand to bilingual-compatible format
 */
export function toBilingualBrand(brand: Brand, language: 'en' | 'tr'): Brand {
  // Brand names are proper nouns, so they stay the same in both languages
  return {
    ...brand,
    name: brand.name, // Keep as-is
  };
}

