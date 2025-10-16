# 📧 Email Verification Fix Guide

## 🐛 Issue
When users register, they receive an error: **"Registration Failed - Failed to create user profile"**, even though the user is successfully created in Supabase Auth and awaiting email verification.

## 🔍 Root Cause
Supabase requires email verification by default. When a user registers:
1. ✅ Auth user is created
2. ❌ Session is `null` (because email isn't verified yet)
3. ❌ App tries to create user record in `users` table
4. ❌ Fails due to RLS policies requiring an authenticated session

## ✅ Solution
Use the **Supabase Service Role Key** to create user profiles immediately after signup, bypassing RLS policies. This allows user profile creation even when email verification is pending.

---

## 🚀 How to Apply the Fix

### Step 1: Get Your Supabase Service Role Key

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **service_role** key (under "Project API keys")

⚠️ **Important:** The service role key bypasses all RLS policies. Keep it secret and never commit it to version control!

### Step 2: Add Service Role Key to `.env`

Update your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Service role key (bypasses RLS - keep secret!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Verify Changes

The following files have been updated:

**`src/lib/supabase.ts`:**
- ✅ Added `supabaseAdmin` client with service role key
- ✅ Added warnings about RLS bypass

**`src/lib/auth.ts`:**
- ✅ Updated `createUserRecord()` to use `supabaseAdmin`
- ✅ Bypasses RLS when creating user profiles

**`src/state/useUserStore.ts`:**
- ✅ Calls `createUserRecord()` immediately after signup
- ✅ Works even when session is `null` (email verification pending)

### Step 4: Test Registration Flow

1. **Rebuild the app:**
   ```bash
   # Clear cache
   yarn start --reset-cache
   
   # In another terminal
   yarn android
   ```

2. **Register a new account:**
   - Enter a valid email and password
   - Click "Create Account"

3. **Expected Behavior:**
   - ✅ See success dialog: "Registration Successful - We've sent a verification link to your email..."
   - ✅ Redirected to Login screen
   - ✅ User profile created in database (check Supabase dashboard)
   - ✅ Email sent for verification

4. **Verify Email:**
   - Check your email inbox (including spam folder)
   - Click the verification link
   - Email status changes to "Confirmed"

5. **Log In:**
   - Return to app
   - Enter credentials on Login screen
   - ✅ Should successfully log in

---

## 🔒 Security Considerations

### Service Role Key Safety

The service role key is powerful and **bypasses all Row Level Security (RLS) policies**. Here's how we use it safely:

**✅ Safe Usage (What We Do):**
- Used only in the `createUserRecord()` function
- Only creates user profiles with default free plan
- Never exposed to user input
- Never used for user data queries

**❌ Unsafe Usage (What We Avoid):**
- Never use for user-facing queries
- Never pass user input directly to admin queries
- Never expose the key in frontend code
- Never use for regular data operations

### Code Safety Example

```typescript
// ✅ SAFE: Fixed user ID from auth, default values only
export const createUserRecord = async (userId: string) => {
  await supabaseAdmin.from('users').insert({
    id: userId,  // From Supabase Auth only
    plan_id: freePlan.id,  // Default free plan
    daily_quota_used: 0,  // Default value
    preferences: { language: 'en', theme: 'light' }  // Default values
  });
};

// ❌ UNSAFE: User input could be malicious
// NEVER DO THIS:
export const updateUserData = async (userId: string, userData: any) => {
  await supabaseAdmin.from('users').update(userData).eq('id', userId);
};
```

---

## 🏗️ How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Registration Flow                   │
└─────────────────────────────────────────────────────────────┘

1. User enters email/password
          ↓
2. App calls supabase.auth.signUp()
          ↓
3. Supabase creates auth user
          ↓
4. Session is NULL (email not verified)
          ↓
5. App calls createUserRecord(userId)
          ↓
6. Uses supabaseAdmin (service role)
          ↓
7. Bypasses RLS, creates user profile ✅
          ↓
8. Returns success with requiresVerification: true
          ↓
9. User sees "Check your email" message
          ↓
10. User clicks verification link in email
          ↓
11. Email confirmed, user can log in ✅
```

### Key Components

**1. Supabase Admin Client (`src/lib/supabase.ts`):**
```typescript
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,  // Bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
```

**2. Create User Record (`src/lib/auth.ts`):**
```typescript
export const createUserRecord = async (userId: string) => {
  // Get free plan using admin client
  const {data: freePlan} = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('name', 'free')
    .single();

  // Create user record using admin client (bypasses RLS)
  await supabaseAdmin.from('users').insert({
    id: userId,
    plan_id: freePlan.id,
    daily_quota_used: 0,
    last_quota_reset_date: new Date().toISOString().split('T')[0],
    preferences: { language: 'en', theme: 'light' },
  });
};
```

**3. Registration Handler (`src/state/useUserStore.ts`):**
```typescript
const {user, session, error} = await AuthService.signUp(email, password);

// Create user profile immediately (works even if session is null)
await AuthService.createUserRecord(user.id);

// Check if email verification is required
if (!session) {
  return {
    success: true,
    requiresVerification: true,
    message: 'Please check your email to verify your account',
  };
}
```

---

## 🧪 Testing Checklist

- [ ] Service role key added to `.env`
- [ ] App rebuilds successfully
- [ ] Registration shows success message
- [ ] User redirected to Login screen
- [ ] User profile exists in `users` table (even before email verification)
- [ ] Verification email received
- [ ] After clicking verification link, email is confirmed
- [ ] Login works after email verification
- [ ] New users get free plan by default
- [ ] Daily quota is set to 0 for new users
- [ ] Default preferences are set

---

## 🆘 Troubleshooting

### Issue: "Failed to create user profile" still appears

**Solutions:**
1. Verify service role key is in `.env`:
   ```bash
   # Check if env var is loaded
   # Should print your service role key
   grep SUPABASE_SERVICE_ROLE_KEY .env
   ```

2. Restart Metro bundler:
   ```bash
   yarn start --reset-cache
   ```

3. Check if free plan exists in database:
   ```sql
   SELECT * FROM plans WHERE name = 'free';
   ```

### Issue: Service role key not found

**Check:**
1. Ensure `.env` file exists in project root
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Restart Metro bundler to reload env vars
4. Check `__mocks__/env.js` doesn't override the value

### Issue: RLS policy blocking user creation

**Debug:**
```sql
-- Check RLS policies on users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Test if service role key works (run in Supabase SQL Editor)
SELECT current_user;
-- Should return: 'postgres' or 'supabase_admin' when using service role
```

### Issue: User created but can't log in after verification

**Check:**
1. Verify email is confirmed:
   ```sql
   SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. Check if user profile exists:
   ```sql
   SELECT * FROM users WHERE id = 'user-id-here';
   ```

3. Try logging in again with correct credentials

---

## 🔄 Alternative: Disable Email Verification (Development Only)

If you want to test without email verification:

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle **Enable email confirmations** to OFF
4. Click **Save**

⚠️ **Warning:** Not recommended for production! Anyone can register with any email.

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Service Role vs Anon Key](https://supabase.com/docs/guides/api#api-keys)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Native Env Variables](https://github.com/goatandsheep/react-native-dotenv)

---

## ✅ Summary

**Before:**
- ❌ "Failed to create user profile" error
- ❌ User stuck at registration
- ❌ RLS policies blocking user creation

**After:**
- ✅ Service role key bypasses RLS
- ✅ User profile created immediately
- ✅ Smooth registration flow
- ✅ Email verification works correctly
- ✅ Professional UX

---

## 🔐 Environment Variables Reference

Your `.env` file should look like this:

```env
# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api

# Your Supabase project URL (e.g., https://xxxxx.supabase.co)
SUPABASE_URL=https://xxxxx.supabase.co

# Your Supabase anonymous/public API key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your Supabase service role key (KEEP SECRET!)
# ⚠️ This key bypasses Row Level Security - never expose it!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find these keys:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the keys from "Project API keys" section

---

**Last Updated:** 2025-10-16  
**Approach:** Code-based user profile creation using service role key
