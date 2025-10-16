# Data Repositories

This directory contains the data access layer for the FaultCode app with **automatic Supabase integration** and **graceful fallback to mock data**.

## 🏗️ Architecture

```
src/data/repo/
├── brandRepo.ts           # Main entry point (auto-switches between Supabase/Mock)
├── faultRepo.ts           # Main entry point (auto-switches between Supabase/Mock)
├── brandRepo.mock.ts      # Pure mock implementation
├── faultRepo.mock.ts      # Pure mock implementation
└── supabase/              # Supabase implementations
    ├── brandRepo.supabase.ts
    ├── faultRepo.supabase.ts
    └── index.ts
```

## 🔄 How It Works

### Automatic Data Source Selection

The repositories automatically choose between Supabase and mock data based on environment configuration:

```typescript
// In your components/screens, just import normally:
import { searchFaults, getFaultById } from '@data/repo/faultRepo';
import { getAllBrands, searchBrands } from '@data/repo/brandRepo';

// The repository automatically:
// 1. Uses Supabase if SUPABASE_URL and SUPABASE_ANON_KEY are set
// 2. Falls back to mock data if Supabase fails or returns no data
// 3. Uses mock data directly if no Supabase credentials are configured
```

### Environment-Based Routing

**With Supabase credentials (.env):**
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
```
→ Uses `supabase/brandRepo.supabase.ts` (with fallback to mock)

**Without credentials:**
→ Uses `brandRepo.mock.ts` directly

## 🌍 Bilingual Support

Supabase repositories handle bilingual JSONB data automatically:

### How It Works

1. **Supabase stores data as JSONB:**
   ```json
   {
     "title": {
       "en": "Ignition failure",
       "tr": "Ateşleme hatası"
     }
   }
   ```

2. **Repository extracts correct language:**
   ```typescript
   const language = usePrefsStore.getState().language; // 'en' or 'tr'
   const title = fault.title[language]; // Automatic translation!
   ```

3. **Returns standard app types:**
   ```typescript
   // Same FaultCode type regardless of source
   {
     id: "fault_001",
     title: "Ignition failure", // or "Ateşleme hatası" if language is 'tr'
     // ...
   }
   ```

## 📊 Repository API

### Brand Repository

```typescript
// Search brands by name or alias
const brands = await searchBrands("vaillant");

// Get single brand by ID
const brand = await getBrandById("brand_001");

// Get all brands
const allBrands = await getAllBrands();
```

### Fault Code Repository

```typescript
// Search with filters
const faults = await searchFaults({
  q: "F28",
  brandId: "brand_001",
});

// Get fault detail with steps
const detail = await getFaultById("fault_001");
// Returns: { fault: FaultCode, steps: ResolutionStep[] }

// Get recent faults
const recent = await getRecentFaults(10);
```

## 🛡️ Fallback Strategy

The Supabase repositories implement a **triple-layer fallback**:

### Layer 1: Supabase Success
```typescript
const { data, error } = await supabase.from('brands').select('*');
if (!error && data.length > 0) {
  return convertSupabaseBrands(data); // ✅ Success
}
```

### Layer 2: Empty Data Fallback
```typescript
if (!data || data.length === 0) {
  console.warn('No data in Supabase, using mock');
  return mockBrandRepo.getAllBrands(); // ⚠️ Fallback
}
```

### Layer 3: Error Fallback
```typescript
catch (error) {
  console.warn('Supabase failed, using mock:', error);
  return mockBrandRepo.getAllBrands(); // ❌ Error fallback
}
```

## 🧪 Testing

### Force Mock Data (for tests)

```typescript
// Import mock repository directly
import { searchFaults } from '@data/repo/faultRepo.mock';
import { getAllBrands } from '@data/repo/brandRepo.mock';

// These ALWAYS use mock data, ignoring Supabase
```

### Test Supabase Integration

```typescript
// Import Supabase repository directly
import { searchFaults } from '@data/repo/supabase/faultRepo.supabase';

// These ALWAYS try Supabase first, then fallback
```

### Test Normal Flow

```typescript
// Import main repository (auto-routing)
import { searchFaults } from '@data/repo/faultRepo';

// Behavior depends on environment variables
```

## 🔧 Development

### Add a New Repository Method

1. **Add to mock implementation:**
   ```typescript
   // brandRepo.mock.ts
   export async function getPopularBrands(): Promise<Brand[]> {
     // Mock logic
   }
   ```

2. **Add to Supabase implementation:**
   ```typescript
   // supabase/brandRepo.supabase.ts
   export async function getPopularBrands(): Promise<Brand[]> {
     try {
       const { data } = await supabase.from('brands')...
       // Supabase logic with fallback
     } catch {
       return mockBrandRepo.getPopularBrands();
     }
   }
   ```

3. **Export from main file:**
   ```typescript
   // brandRepo.ts
   export const getPopularBrands = brandRepo.getPopularBrands;
   ```

## 📝 Type Conversions

### Supabase → App Types

**Brand:**
```typescript
// Supabase: name is JSONB { en, tr }
// App: name is string

convertSupabaseBrand(supabaseBrand, language) → Brand
```

**Fault Code:**
```typescript
// Supabase: title, summary, causes are JSONB
// App: title, summary, causes are strings/arrays

convertSupabaseFault(supabaseFault, language) → FaultCode
```

**Resolution Step:**
```typescript
// Supabase: text, tools are JSONB
// App: text is string, tools is string[]

convertSupabaseStep(supabaseStep, language) → ResolutionStep
```

## 🚀 Migration Checklist

When moving from mock to Supabase:

- [ ] Run database schema: `scripts/setupSupabaseTables.sql`
- [ ] Import data: `yarn db:import`
- [ ] Add credentials to `.env`:
  ```bash
  SUPABASE_URL=...
  SUPABASE_ANON_KEY=...
  ```
- [ ] Restart Metro bundler: `yarn start --reset-cache`
- [ ] Test app - it should now use Supabase!
- [ ] Check console logs for fallback warnings
- [ ] Verify language switching works (EN ↔ TR)

## 🔍 Debugging

### Check which data source is being used:

```typescript
// Look for console logs:
console.warn('No brands found in Supabase, falling back to mock data');
console.warn('Supabase brand search failed, using mock data:', error);
```

### Force mock data temporarily:

```typescript
// In brandRepo.ts or faultRepo.ts
const USE_SUPABASE = false; // Override to always use mock
```

### Inspect Supabase queries:

```typescript
// In supabase/*.ts files, add logging:
console.log('Supabase query:', query);
console.log('Supabase response:', data);
```

---

**Summary:** The repository layer provides a seamless abstraction over Supabase and mock data, with automatic bilingual support and graceful degradation. Your app works offline with mock data and automatically upgrades to Supabase when configured! 🎉

