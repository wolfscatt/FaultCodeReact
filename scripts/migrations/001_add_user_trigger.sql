-- Migration: Add automatic user profile creation trigger
-- Date: 2025-10-16
-- Purpose: Automatically create user profiles when auth users are created
--          This fixes the issue where email verification prevents user profile creation

-- ============================================================================
-- ADD TRIGGER FUNCTION
-- ============================================================================

-- Function to automatically create user record when auth user is created
-- This runs after a new user signs up, before email verification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id
  FROM public.plans
  WHERE name = 'free'
  LIMIT 1;

  -- Create user record with default free plan
  INSERT INTO public.users (id, plan_id, daily_quota_used, last_quota_reset_date, preferences)
  VALUES (
    NEW.id,
    free_plan_id,
    0,
    CURRENT_DATE,
    jsonb_build_object('language', 'en', 'theme', 'light')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user IS 'Automatically creates user profile when auth user is created';

-- ============================================================================
-- CREATE TRIGGER
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to run after new auth user is inserted
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Creates user profile automatically when new auth user is created';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '📌 Added trigger: on_auth_user_created';
  RAISE NOTICE '📌 Added function: handle_new_user()';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 What this does:';
  RAISE NOTICE '   - Automatically creates user profile when someone registers';
  RAISE NOTICE '   - Works even before email verification';
  RAISE NOTICE '   - Assigns free plan by default';
  RAISE NOTICE '   - Sets default preferences (language: en, theme: light)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ You can now test registration without "Failed to create user profile" errors!';
END $$;

