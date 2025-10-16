/**
 * Mock Data to Supabase Migration Script
 * 
 * This script imports mock JSON data into Supabase with bilingual support.
 * 
 * Usage:
 *   1. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env
 *   2. Run: yarn ts-node scripts/importMockToSupabase.ts
 * 
 * Features:
 *   - Reads mock data from /src/data/mock/*.json
 *   - Translates all text to English + Turkish
 *   - Creates bilingual JSONB objects
 *   - Inserts into Supabase in batches
 *   - Skips duplicates
 *   - Reports detailed import statistics
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import {
  createBilingualText,
  createBilingualArray,
} from './translations';

// Load environment variables
dotenv.config();

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  console.error('💡 Tip: Get your service_role key from Supabase Dashboard → Project Settings → API');
  console.error('⚠️  WARNING: The service_role key bypasses RLS. Keep it secret and never commit it!');
  process.exit(1);
}

// Initialize Supabase client with service_role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Types matching mock data structure
interface MockBrand {
  id: string;
  name: string;
  aliases: string[];
  country: string;
}

interface MockModel {
  id: string;
  brandId: string;
  modelName: string;
  years: string;
}

interface MockFaultCode {
  id: string;
  brandId: string;
  code: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  summary: string;
  causes: string[];
  safetyNotice?: string;
  lastVerifiedAt: string;
}

interface MockStep {
  id: string;
  faultCodeId: string;
  order: number;
  text: string;
  estimatedTimeMin?: number;
  requiresPro: boolean;
  tools: string[];
  imagePrompt?: string;
}

// Import statistics
interface ImportStats {
  brands: { inserted: number; skipped: number; errors: number };
  models: { inserted: number; skipped: number; errors: number };
  faultCodes: { inserted: number; skipped: number; errors: number };
  steps: { inserted: number; skipped: number; errors: number };
}

const stats: ImportStats = {
  brands: { inserted: 0, skipped: 0, errors: 0 },
  models: { inserted: 0, skipped: 0, errors: 0 },
  faultCodes: { inserted: 0, skipped: 0, errors: 0 },
  steps: { inserted: 0, skipped: 0, errors: 0 },
};

// ID mapping (mock IDs to Supabase UUIDs)
const brandIdMap = new Map<string, string>();
const faultCodeIdMap = new Map<string, string>();

/**
 * Read JSON file from mock data directory
 */
function readMockData<T>(filename: string): T[] {
  const filePath = path.join(__dirname, '..', 'src', 'data', 'mock', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Parse year range (e.g., "2015-2023") into start and end years
 */
function parseYears(years: string): { start: number | null; end: number | null } {
  if (!years) return { start: null, end: null };
  
  const match = years.match(/(\d{4})-(\d{4})/);
  if (!match) return { start: null, end: null };
  
  return {
    start: parseInt(match[1], 10),
    end: parseInt(match[2], 10),
  };
}

/**
 * Import brands with bilingual names
 */
async function importBrands(): Promise<void> {
  console.log('\n📦 Importing brands...');
  
  const brands = readMockData<MockBrand>('brands.json');
  
  for (const brand of brands) {
    try {
      // Brand names are proper nouns, keep same in both languages
      const bilingualName = {
        en: brand.name,
        tr: brand.name,
      };
      
      const { data, error } = await supabase
        .from('brands')
        .insert({
          name: bilingualName,
          aliases: brand.aliases,
          country: brand.country,
        })
        .select('id')
        .single();
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`   ⏭️  Skipped: ${brand.name} (already exists)`);
          stats.brands.skipped++;
          
          // Get existing brand ID
          const { data: existing } = await supabase
            .from('brands')
            .select('id')
            .eq('name->en', brand.name)
            .single();
          
          if (existing) {
            brandIdMap.set(brand.id, existing.id);
          }
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ Imported: ${brand.name}`);
        stats.brands.inserted++;
        brandIdMap.set(brand.id, data.id);
      }
    } catch (error) {
      console.error(`   ❌ Error importing ${brand.name}:`, error);
      stats.brands.errors++;
    }
  }
}

/**
 * Import boiler models
 */
async function importModels(): Promise<void> {
  console.log('\n📦 Importing boiler models...');
  
  const models = readMockData<MockModel>('models.json');
  
  for (const model of models) {
    try {
      const brandUuid = brandIdMap.get(model.brandId);
      if (!brandUuid) {
        console.log(`   ⚠️  Skipped: ${model.modelName} (brand not found)`);
        stats.models.skipped++;
        continue;
      }
      
      const years = parseYears(model.years);
      
      const { error } = await supabase
        .from('boiler_models')
        .insert({
          brand_id: brandUuid,
          model_name: model.modelName,
          year_start: years.start,
          year_end: years.end,
        });
      
      if (error) {
        if (error.code === '23505') {
          console.log(`   ⏭️  Skipped: ${model.modelName} (already exists)`);
          stats.models.skipped++;
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ Imported: ${model.modelName}`);
        stats.models.inserted++;
      }
    } catch (error) {
      console.error(`   ❌ Error importing ${model.modelName}:`, error);
      stats.models.errors++;
    }
  }
}

/**
 * Import fault codes with bilingual content
 */
async function importFaultCodes(): Promise<void> {
  console.log('\n📦 Importing fault codes...');
  
  const faultCodes = readMockData<MockFaultCode>('fault_codes.json');
  
  for (const fault of faultCodes) {
    try {
      const brandUuid = brandIdMap.get(fault.brandId);
      if (!brandUuid) {
        console.log(`   ⚠️  Skipped: ${fault.code} (brand not found)`);
        stats.faultCodes.skipped++;
        continue;
      }
      
      // Create bilingual JSONB objects
      const bilingualTitle = createBilingualText(fault.title);
      const bilingualSummary = createBilingualText(fault.summary);
      const bilingualCauses = createBilingualArray(fault.causes);
      const bilingualSafetyNotice = fault.safetyNotice
        ? createBilingualText(fault.safetyNotice)
        : null;
      
      const { data, error } = await supabase
        .from('fault_codes')
        .insert({
          brand_id: brandUuid,
          code: fault.code,
          title: bilingualTitle,
          severity: fault.severity,
          summary: bilingualSummary,
          causes: bilingualCauses,
          safety_notice: bilingualSafetyNotice,
          last_verified_at: fault.lastVerifiedAt,
        })
        .select('id')
        .single();
      
      if (error) {
        if (error.code === '23505') {
          console.log(`   ⏭️  Skipped: ${fault.code} (already exists)`);
          stats.faultCodes.skipped++;
          
          // Get existing fault code ID
          const { data: existing } = await supabase
            .from('fault_codes')
            .select('id')
            .eq('brand_id', brandUuid)
            .eq('code', fault.code)
            .single();
          
          if (existing) {
            faultCodeIdMap.set(fault.id, existing.id);
          }
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ Imported: ${fault.code} - ${fault.title.substring(0, 40)}...`);
        stats.faultCodes.inserted++;
        faultCodeIdMap.set(fault.id, data.id);
      }
    } catch (error) {
      console.error(`   ❌ Error importing ${fault.code}:`, error);
      stats.faultCodes.errors++;
    }
  }
}

/**
 * Import resolution steps with bilingual text
 */
async function importSteps(): Promise<void> {
  console.log('\n📦 Importing resolution steps...');
  
  const steps = readMockData<MockStep>('steps.json');
  
  for (const step of steps) {
    try {
      const faultCodeUuid = faultCodeIdMap.get(step.faultCodeId);
      if (!faultCodeUuid) {
        console.log(`   ⚠️  Skipped step ${step.order} (fault code not found)`);
        stats.steps.skipped++;
        continue;
      }
      
      // Create bilingual JSONB objects
      const bilingualText = createBilingualText(step.text);
      const bilingualTools = step.tools.length > 0
        ? createBilingualArray(step.tools)
        : null;
      
      const { error } = await supabase
        .from('resolution_steps')
        .insert({
          fault_code_id: faultCodeUuid,
          order_number: step.order,
          text: bilingualText,
          estimated_time_min: step.estimatedTimeMin || null,
          requires_pro: step.requiresPro,
          tools: bilingualTools,
          image_url: null, // Image URLs not in mock data
        });
      
      if (error) {
        if (error.code === '23505') {
          console.log(`   ⏭️  Skipped step ${step.order} (already exists)`);
          stats.steps.skipped++;
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ Imported step ${step.order}`);
        stats.steps.inserted++;
      }
    } catch (error) {
      console.error(`   ❌ Error importing step ${step.order}:`, error);
      stats.steps.errors++;
    }
  }
}

/**
 * Print import summary
 */
function printSummary(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  
  const categories = [
    { name: 'Brands', stats: stats.brands },
    { name: 'Models', stats: stats.models },
    { name: 'Fault Codes', stats: stats.faultCodes },
    { name: 'Resolution Steps', stats: stats.steps },
  ];
  
  for (const category of categories) {
    const total = category.stats.inserted + category.stats.skipped + category.stats.errors;
    console.log(`\n${category.name}:`);
    console.log(`  ✅ Inserted: ${category.stats.inserted}`);
    console.log(`  ⏭️  Skipped:  ${category.stats.skipped}`);
    console.log(`  ❌ Errors:   ${category.stats.errors}`);
    console.log(`  📊 Total:    ${total}`);
  }
  
  const totalInserted = Object.values(stats).reduce((sum, s) => sum + s.inserted, 0);
  const totalSkipped = Object.values(stats).reduce((sum, s) => sum + s.skipped, 0);
  const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);
  
  console.log('\n' + '='.repeat(60));
  console.log(`OVERALL: ${totalInserted} inserted, ${totalSkipped} skipped, ${totalErrors} errors`);
  console.log('='.repeat(60));
  
  if (totalErrors > 0) {
    console.log('\n⚠️  Some items failed to import. Check error messages above.');
    process.exit(1);
  } else if (totalInserted === 0) {
    console.log('\n✅ No new data to import (all items already exist)');
  } else {
    console.log('\n✅ Import completed successfully!');
  }
}

/**
 * Main import function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting mock data import to Supabase...');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  
  try {
    // Test connection
    const { error } = await supabase.from('brands').select('id').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found, which is fine
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    console.log('✅ Connected to Supabase');
    
    // Import in order (respecting foreign key dependencies)
    await importBrands();
    await importModels();
    await importFaultCodes();
    await importSteps();
    
    // Print summary
    printSummary();
  } catch (error) {
    console.error('\n❌ Fatal error during import:', error);
    process.exit(1);
  }
}

// Run the import
main();

