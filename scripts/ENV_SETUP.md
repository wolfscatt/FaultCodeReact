# Environment Variables Setup

## 🔑 Required Keys for Migration

To run the migration script (`yarn db:import`), you need **TWO** Supabase API keys:

### 1. SUPABASE_URL
Your Supabase project URL

**Where to find it:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Project Settings** → **API**
4. Copy the **Project URL**

Example: `https://xxxxxxxxxxxxx.supabase.co`

### 2. SUPABASE_ANON_KEY (for app usage)
Public anonymous key - safe to use in your React Native app

**Where to find it:**
1. Same location: **Project Settings** → **API**
2. Copy the **anon/public** key under "Project API keys"

This key is used by your app and respects Row Level Security (RLS) policies.

### 3. SUPABASE_SERVICE_ROLE_KEY (for migration script)
⚠️ **SECRET KEY** - Admin access, bypasses all RLS policies

**Where to find it:**
1. Same location: **Project Settings** → **API**
2. Scroll down to **service_role** key
3. Click "👁️ Reveal" to show the secret key
4. Copy the **service_role** key

**⚠️ SECURITY WARNING:**
- **NEVER** commit this key to git
- **NEVER** use this key in your React Native app
- **ONLY** use for server-side scripts and migrations
- Keep it in `.env` file (which is gitignored)

## 📝 Setting Up .env File

Create a `.env` file in your project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZG9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZG9...
```

## 🚨 Common Mistakes

### ❌ Using ANON key for migration
```bash
# This will fail with RLS policy error:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...(anon key)
```

### ✅ Correct setup
```bash
# Use the service_role key (starts with eyJ... but is MUCH longer):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...(service_role key)
```

## 🔍 How to Verify You Have the Right Keys

### Anon Key
- Length: ~300-400 characters
- Label in Supabase: "anon" or "public"
- Safe to expose in client apps

### Service Role Key  
- Length: ~600-800 characters (much longer!)
- Label in Supabase: "service_role" (marked as secret)
- Has full admin access

## ✅ Test Your Setup

After setting up your `.env` file:

```bash
# This should now work without RLS errors:
yarn db:import
```

Expected output:
```
🚀 Starting mock data import to Supabase...
📍 Supabase URL: https://xxxxx.supabase.co
✅ Connected to Supabase

📦 Importing brands...
   ✅ Imported: Vaillant
   ✅ Imported: Worcester Bosch
   ...
```

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore` (already done)
- [ ] Service role key is NOT in `.env.example`
- [ ] Service role key is NOT in any committed files
- [ ] Service role key is ONLY used in server-side scripts
- [ ] Anon key is used in React Native app (`src/lib/supabase.ts`)

---

**Ready to import?** Run `yarn db:import` 🚀

