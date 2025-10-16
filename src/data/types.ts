/**
 * Core data types for FaultCode app
 * These types represent the domain model for boiler brands, models, fault codes, and resolution steps
 */

export type Brand = {
  id: string;
  name: string;
  aliases?: string[]; // Alternative names/spellings for search
  country?: string;
  logoUrl?: string; // For future enhancement
};

export type BoilerModel = {
  id: string;
  brandId: string;
  modelName: string;
  years?: string; // e.g., "2018-2023"
};

export type SeverityLevel = 'info' | 'warning' | 'critical';

export type FaultCode = {
  id: string;
  brandId: string;
  boilerModelId?: string; // Optional: some codes apply to all models
  code: string; // e.g., "E01", "F28", "A01"
  title: string; // Short description
  severity: SeverityLevel;
  summary: string; // Detailed explanation
  causes: string[]; // List of possible causes
  safetyNotice?: string; // Important safety warnings
  lastVerifiedAt?: string; // ISO date string for data quality tracking
};

export type ResolutionStep = {
  id: string;
  faultCodeId: string;
  order: number; // Step sequence
  text: string; // Step instruction
  estimatedTimeMin?: number; // Estimated time to complete
  requiresPro?: boolean; // Whether professional help is required
  tools?: string[]; // Required tools/equipment
  imagePrompt?: string; // For future AI-generated images
  imageUrl?: string; // Actual image URL when available
};

// Search filters and results
export type SearchFilters = {
  q?: string; // Search query
  brandId?: string;
  modelId?: string;
};

export type FaultDetailResult = {
  fault: FaultCode;
  steps: ResolutionStep[];
};

