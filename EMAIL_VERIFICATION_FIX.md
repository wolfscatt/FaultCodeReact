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
Implemented an automatic database trigger that creates the user profile **immediately** when the auth user is created, **before** email verification.

---

## 🚀 How to Apply the Fix

### Step 1: Update Your Supabase Database

Run the migration script in your Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of `scripts/migrations/001_add_user_trigger.sql`
5. Click **Run**

**What this does:**
- Creates a `handle_new_user()` function that automatically creates user profiles
- Adds a trigger `on_auth_user_created` that runs whenever a new auth user is created
- The trigger runs with `SECURITY DEFINER`, bypassing RLS policies

---

### Step 2: Verify the Migration

Run this SQL query to check if the trigger was created:

```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

You should see:
```
trigger_name         | event_manipulation | action_statement
---------------------|--------------------|-----------------
on_auth_user_created | INSERT            | EXECUTE FUNCTION public.handle_new_user()
```

---

### Step 3: Test Registration Flow

1. **Clear any pending/unverified users** (optional):
   ```sql
   -- View unverified users
   SELECT id, email, email_confirmed_at FROM auth.users WHERE email_confirmed_at IS NULL;
   
   -- Delete test users (if needed)
   DELETE FROM auth.users WHERE email = 'test@example.com';
   ```

2. **Test new registration:**
   - Open the app
   - Go to Register screen
   - Enter email and password
   - Click "Create Account"
   
3. **Expected behavior:**
   - ✅ Success message: "Registration Successful - We've sent a verification link to your email..."
   - ✅ Redirected to Login screen
   - ✅ Check Supabase dashboard → Authentication → Users: User should exist
   - ✅ Check Supabase dashboard → Database → users table: User profile should be created automatically
   
4. **Verify your email:**
   - Check your email inbox (including spam folder)
   - Click the verification link
   - You should see "Email confirmed" page
   
5. **Log in:**
   - Return to app
   - Enter email and password on Login screen
   - ✅ Should successfully log in

---

## 🔧 What Changed in the Code

### 1. Database Trigger (New)
**File:** `scripts/setupSupabaseTables.sql` & `scripts/migrations/001_add_user_trigger.sql`

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get free plan ID
  SELECT id INTO free_plan_id FROM public.plans WHERE name = 'free';
  
  -- Create user profile automatically
  INSERT INTO public.users (id, plan_id, daily_quota_used, preferences)
  VALUES (NEW.id, free_plan_id, 0, '{"language": "en", "theme": "light"}')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 2. Registration Flow (Updated)
**File:** `src/state/useUserStore.ts`

```typescript
// Check if email verification is required
if (!session) {
  return {
    success: true,
    requiresVerification: true,
    message: 'Please check your email to verify your account',
  };
}
```

**File:** `src/app/screens/RegisterScreen.tsx`

```typescript
if (result.requiresVerification) {
  Alert.alert(
    '✅ Registration Successful',
    'We\'ve sent a verification link to your email...',
    [{text: 'Go to Login', onPress: () => navigation.navigate('Login')}]
  );
}
```

---

## 📝 Email Verification Configuration (Optional)

### Customize Email Templates

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Customize the **Confirm signup** template:

**Example:**
```html
<h2>Welcome to FaultCode!</h2>
<p>Thanks for signing up. Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>Or copy and paste this URL: {{ .ConfirmationURL }}</p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

### Disable Email Verification (Not Recommended)

If you want to disable email verification for testing:

1. Go to **Supabase Dashboard** → **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle **Enable email confirmations** to OFF
4. Click **Save**

⚠️ **Warning:** This is NOT recommended for production as it allows anyone to register with any email address.

---

## 🧪 Testing Checklist

- [ ] Database trigger created successfully
- [ ] Registration shows success message
- [ ] User redirected to Login screen (not logged in automatically)
- [ ] User profile exists in `users` table (even before email verification)
- [ ] Email verification link received
- [ ] After clicking verification link, email is confirmed
- [ ] Login works after email verification
- [ ] New users get free plan by default
- [ ] Daily quota is set to 0 for new users
- [ ] Default preferences are set (language: en, theme: light)

---

## 🆘 Troubleshooting

### Issue: No email received
**Solutions:**
1. Check spam folder
2. Check Supabase logs: **Supabase Dashboard** → **Logs** → **Auth Logs**
3. Verify SMTP settings: **Dashboard** → **Project Settings** → **Auth** → **SMTP Settings**
4. For development, use Supabase's built-in email service (mailtrap)

### Issue: Trigger not firing
**Check:**
```sql
-- Verify trigger exists
SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';

-- Verify function exists
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

### Issue: User profile not created
**Debug:**
```sql
-- Check if free plan exists
SELECT * FROM plans WHERE name = 'free';

-- Check RLS policies on users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Manually test the function
SELECT handle_new_user();
```

### Issue: RLS policy blocking user creation
**Solution:** The trigger uses `SECURITY DEFINER`, which bypasses RLS. If it's still blocked:

```sql
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON public.users TO postgres;
```

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Summary

**Before:**
- ❌ "Failed to create user profile" error
- ❌ User stuck at registration
- ❌ Manual intervention required

**After:**
- ✅ Smooth registration flow
- ✅ Automatic user profile creation
- ✅ Email verification prompt
- ✅ Professional UX

---

**Last Updated:** 2025-10-16  
**Migration Script:** `scripts/migrations/001_add_user_trigger.sql`

