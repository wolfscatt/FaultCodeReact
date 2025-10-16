# Mock Data Migration Guide

This guide explains how to migrate your mock JSON data to Supabase with automatic bilingual translation.

## 🚀 Quick Start

### Prerequisites

1. **Supabase Project Setup**
   ```bash
   # 1. Create project at https://app.supabase.com
   # 2. Run the schema: scripts/setupSupabaseTables.sql
   # 3. Get your credentials from Project Settings → API
   ```

2. **Configure Environment**
   ```bash
   # Add to .env file:
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   
   **Important:** 
   - Get both keys from: Supabase Dashboard → Project Settings → API
   - `SUPABASE_ANON_KEY` - For app usage (public, read-only via RLS)
   - `SUPABASE_SERVICE_ROLE_KEY` - For migration script (bypasses RLS)
   - ⚠️ **Never commit or expose the service_role key!**

3. **Run Migration**
   ```bash
   yarn db:import
   ```

## 📦 What Gets Imported

The script migrates all mock data with automatic bilingual translation:

### Data Flow

```
/src/data/mock/
├── brands.json          → brands table
├── models.json          → boiler_models table
├── fault_codes.json     → fault_codes table (with translations)
└── steps.json           → resolution_steps table (with translations)
```

### Translation Examples

**Fault Code Title:**
```
English: "Ignition failure - boiler fails to ignite"
Turkish: "Ateşleme hatası - kazan ateşlenemiyor"

Stored as JSONB:
{
  "en": "Ignition failure - boiler fails to ignite",
  "tr": "Ateşleme hatası - kazan ateşlenemiyor"
}
```

**Causes Array:**
```
English: ["Gas supply issue", "Faulty electrode"]
Turkish: ["Gaz besleme sorunu", "Arızalı elektrot"]

Stored as JSONB:
{
  "en": ["Gas supply issue", "Faulty electrode"],
  "tr": ["Gaz besleme sorunu", "Arızalı elektrot"]
}
```

## 🔧 Translation System

### Current: Dictionary-Based Translation

The script uses `scripts/translations.ts` which contains:
- **180+ technical term translations**
- Rule-based text replacement
- Automatic bilingual JSONB creation

**Supported Terms:**
- Fault types: "Ignition failure", "Low water pressure", "Overheating"
- Components: "Gas valve", "Fan", "Pump", "Temperature sensor"
- Actions: "Check", "Replace", "Clean", "Reset"
- Tools: "Screwdriver", "Multimeter", "Pressure gauge"
- Safety: "Gas Safe registered engineer", "immediately"

### Future: AI Translation (Optional)

To enable AI-powered translation:

1. **Install OpenAI SDK**
   ```bash
   yarn add openai
   ```

2. **Add API Key to .env**
   ```bash
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Uncomment AI Functions**
   Edit `scripts/translations.ts` and uncomment the `aiTranslate` function.

4. **Update Import Script**
   Replace `simpleTranslate()` calls with `await aiTranslate()`.

## 📊 Import Process

### Step-by-Step Execution

1. **Connect to Supabase**
   - Validates credentials
   - Tests database connection

2. **Import Brands** (11 brands)
   - Brand names kept as-is (proper nouns)
   - Creates bilingual name objects

3. **Import Models** (15 models)
   - Links to imported brands
   - Parses year ranges

4. **Import Fault Codes** (50+ codes)
   - Translates title, summary, causes
   - Translates safety notices
   - Links to brands

5. **Import Resolution Steps** (200+ steps)
   - Translates step text
   - Translates tool lists
   - Links to fault codes

### Duplicate Handling

The script **automatically skips duplicates**:
- Brands: Checks by name
- Models: Checks by brand + model name
- Fault Codes: Checks by brand + code (e.g., "Vaillant" + "F28")
- Steps: Checks by fault code + order number

### Output Example

```
🚀 Starting mock data import to Supabase...
📍 Supabase URL: https://your-project.supabase.co
✅ Connected to Supabase

📦 Importing brands...
   ✅ Imported: Vaillant
   ✅ Imported: Worcester Bosch
   ✅ Imported: Baxi
   ... (11 total)

📦 Importing boiler models...
   ✅ Imported: ecoTEC Plus
   ✅ Imported: ecoTEC Pro
   ... (15 total)

📦 Importing fault codes...
   ✅ Imported: F28 - Ignition failure - boiler fails to ignite...
   ✅ Imported: F22 - Low water pressure...
   ... (50+ total)

📦 Importing resolution steps...
   ✅ Imported step 1
   ✅ Imported step 2
   ... (200+ total)

============================================================
📊 IMPORT SUMMARY
============================================================

Brands:
  ✅ Inserted: 11
  ⏭️  Skipped:  0
  ❌ Errors:   0
  📊 Total:    11

Models:
  ✅ Inserted: 15
  ⏭️  Skipped:  0
  ❌ Errors:   0
  📊 Total:    15

Fault Codes:
  ✅ Inserted: 50
  ⏭️  Skipped:  0
  ❌ Errors:   0
  📊 Total:    50

Resolution Steps:
  ✅ Inserted: 200
  ⏭️  Skipped:  0
  ❌ Errors:   0
  📊 Total:    200

============================================================
OVERALL: 276 inserted, 0 skipped, 0 errors
============================================================

✅ Import completed successfully!
```

## 🔍 Verification

After import, verify in Supabase:

```sql
-- Check brands
SELECT 
  name->>'en' as name_en,
  name->>'tr' as name_tr,
  country
FROM brands;

-- Check fault codes with translation
SELECT 
  code,
  title->>'en' as title_en,
  title->>'tr' as title_tr,
  severity
FROM fault_codes
LIMIT 5;

-- Check resolution steps
SELECT 
  fc.code,
  rs.order_number,
  rs.text->>'en' as step_en,
  rs.text->>'tr' as step_tr
FROM resolution_steps rs
JOIN fault_codes fc ON rs.fault_code_id = fc.id
ORDER BY fc.code, rs.order_number
LIMIT 10;
```

## 🛠️ Troubleshooting

### Error: "Supabase connection failed"
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Check internet connection

### Error: "row violates row-level security policy"
- You're using `SUPABASE_ANON_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`
- Get service_role key from: Dashboard → Project Settings → API → service_role (secret)
- Update `.env` with `SUPABASE_SERVICE_ROLE_KEY=...`
- The service_role key bypasses RLS policies for admin operations

### Error: "Insert failed"
- Ensure schema is created (run `setupSupabaseTables.sql`)
- Check Row Level Security policies
- Verify foreign key relationships

### Some items skipped
- Normal if re-running the script
- Script skips existing data to prevent duplicates
- Check error messages for actual failures

### Translation quality issues
- Edit `scripts/translations.ts` to add/fix terms
- Consider enabling AI translation for better quality
- Manually update translations in Supabase after import

## 📝 Adding Custom Translations

Edit `scripts/translations.ts`:

```typescript
export const technicalTerms: Record<string, string> = {
  // Add your custom translations here
  'Your English term': 'Türkçe karşılığı',
  'Another term': 'Başka bir terim',
  
  // Existing terms...
  'Ignition failure': 'Ateşleme hatası',
  // ...
};
```

## 🔄 Re-running the Import

Safe to run multiple times:
- Existing records are skipped
- Only new data is inserted
- No duplicates created
- Idempotent operation

## 📚 Next Steps

After successful import:

1. **Update Repository Layer**
   - Modify `src/data/repo/*.ts` to use Supabase
   - Replace mock data with real queries
   - Test with UI

2. **Enable Authentication**
   - Set up Supabase Auth
   - Link users to user table

3. **Test in App**
   - Search for fault codes
   - View fault details
   - Switch languages (EN ↔ TR)

---

**Need Help?**
- Check `scripts/README.md` for database schema details
- See `README.md` for overall project documentation
- Review Supabase docs: https://supabase.com/docs

