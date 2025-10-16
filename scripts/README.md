# Database Scripts

This directory contains SQL scripts for setting up and managing the FaultCode database.

## Files

### `setupSupabaseTables.sql`

Complete database schema for FaultCode app with **bilingual support** (English/Turkish).

#### Features

- ✅ **7 Core Tables**: brands, boiler_models, fault_codes, resolution_steps, plans, users, analytics_events
- 🌍 **Bilingual JSONB**: All user-facing text stored as `{"en": "...", "tr": "..."}`
- 🔗 **Foreign Keys**: Proper relationships between all entities
- 📊 **Indexes**: Optimized for search performance (including GIN indexes for JSONB)
- 🔒 **Row Level Security**: Pre-configured RLS policies
- ⚡ **Auto-triggers**: Updated timestamps and daily quota reset
- 📈 **Views**: Helper views for common queries

#### JSONB Structure Examples

**Simple bilingual text:**
```json
{
  "en": "Ignition failure",
  "tr": "Ateşleme hatası"
}
```

**Bilingual arrays (causes, tools):**
```json
{
  "en": ["Gas supply issue", "Faulty electrode"],
  "tr": ["Gaz besleme sorunu", "Arızalı elektrot"]
}
```

#### How to Use

1. **Create a Supabase project** at https://app.supabase.com

2. **Open SQL Editor** in Supabase dashboard

3. **Copy and paste** the entire `setupSupabaseTables.sql` file

4. **Execute** the script - it will:
   - Create all tables with constraints
   - Add indexes for performance
   - Set up triggers for auto-updates
   - Enable Row Level Security
   - Insert default plans (free & pro)

5. **Verify** the setup:
   ```sql
   -- Check tables
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Check default plans
   SELECT * FROM plans;
   ```

#### Migration from Mock Data

After running the schema, you can migrate your mock JSON data:

```javascript
// Example: Migrate brands
import { supabase } from '@lib/supabase';
import brandsData from '@data/mock/brands.json';

const migrateBrands = async () => {
  const billingualBrands = brandsData.map(brand => ({
    name: {
      en: brand.name,
      tr: brand.name // Update with actual Turkish translations
    },
    aliases: brand.aliases,
    country: brand.country
  }));
  
  const { data, error } = await supabase
    .from('brands')
    .insert(billingualBrands);
  
  if (error) console.error('Migration error:', error);
  else console.log('Migrated brands:', data);
};
```

#### Schema Diagram

```
┌─────────────┐
│   brands    │
│ (bilingual) │
└──────┬──────┘
       │
       ├──────┐
       │      │
       ▼      ▼
┌─────────────┐  ┌──────────────┐
│boiler_models│  │ fault_codes  │
└─────────────┘  │  (bilingual) │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────────┐
                 │resolution_steps  │
                 │   (bilingual)    │
                 └──────────────────┘

┌─────────┐      ┌────────┐
│  plans  │◄─────│ users  │
│(billing)│      │        │
└─────────┘      └────┬───┘
                      │
                      ▼
                 ┌────────────────┐
                 │analytics_events│
                 └────────────────┘
```

#### RLS Policies Summary

- **Public read**: brands, models, fault_codes, resolution_steps, active plans
- **User read/update**: Own user record only
- **Analytics**: Users can log their own events

#### Performance Indexes

- Brand/code lookups: `idx_fault_codes_brand_code`
- Text search: `idx_fault_codes_title_gin`, `idx_fault_codes_summary_gin`
- Analytics queries: `idx_analytics_events_timestamp`
- Quota tracking: `idx_users_last_quota_reset`

#### Next Steps

1. Run this script in Supabase SQL Editor
2. Configure authentication (if needed)
3. Migrate mock data to Supabase
4. Update repository implementations in `/src/data/repo/`
5. Test with real data!

---

**Note**: The schema includes auto-reset for daily quotas via trigger. When a user record is updated and the `last_quota_reset_date` is older than today, the quota automatically resets.

