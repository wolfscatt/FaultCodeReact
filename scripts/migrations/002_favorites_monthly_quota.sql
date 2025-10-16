-- Migration: Add Favorites table and switch to Monthly Quota
-- Date: 2025-10-16
-- Description: Adds premium-only favorites system and changes quota from daily to monthly

-- ============================================================================
-- 1. CREATE FAVORITES TABLE
-- ============================================================================

-- Favorites Table
-- Stores user's saved fault codes (premium-only feature)
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    fault_code_id uuid NOT NULL REFERENCES public.fault_codes(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, fault_code_id) -- Prevent duplicate favorites
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_fault_code_id ON public.favorites (fault_code_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON public.favorites (created_at DESC);

-- RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can only view and manage their own favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 2. UPDATE USERS TABLE FOR MONTHLY QUOTA
-- ============================================================================

-- Add monthly quota columns
ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS monthly_quota_used integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS quota_reset_date date DEFAULT (CURRENT_DATE + INTERVAL '1 month');

-- Add constraint for non-negative quota
ALTER TABLE public.users 
    ADD CONSTRAINT IF NOT EXISTS chk_monthly_quota_used_non_negative 
    CHECK (monthly_quota_used >= 0);

-- Migrate existing daily quota data to monthly (if any users exist)
-- This assumes we want to preserve existing usage for the current month
UPDATE public.users
SET 
    monthly_quota_used = COALESCE(daily_quota_used, 0),
    quota_reset_date = (CURRENT_DATE + INTERVAL '1 month')
WHERE monthly_quota_used IS NULL;

-- Remove old daily quota columns (optional - keep for backwards compatibility)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS daily_quota_used;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS last_quota_reset_date;

COMMENT ON COLUMN public.users.monthly_quota_used IS 'Number of fault details viewed this month (free plan only)';
COMMENT ON COLUMN public.users.quota_reset_date IS 'Date when monthly quota will reset';

-- ============================================================================
-- 3. UPDATE QUOTA FUNCTION FOR MONTHLY LOGIC
-- ============================================================================

-- Drop old daily quota function
DROP FUNCTION IF EXISTS increment_user_quota(UUID);

-- Create new monthly quota increment function
CREATE OR REPLACE FUNCTION increment_monthly_quota(user_id UUID)
RETURNS VOID AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  reset_date DATE;
BEGIN
  -- Get the quota reset date
  SELECT quota_reset_date INTO reset_date
  FROM users
  WHERE id = user_id;

  -- If reset date has passed, reset the quota
  IF reset_date IS NULL OR reset_date <= current_date THEN
    UPDATE users
    SET monthly_quota_used = 1,
        quota_reset_date = (current_date + INTERVAL '1 month')
    WHERE id = user_id;
  ELSE
    -- Increment the quota
    UPDATE users
    SET monthly_quota_used = monthly_quota_used + 1
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_monthly_quota IS 'Increments user monthly quota, resetting if new month';

-- ============================================================================
-- 4. CREATE HELPER FUNCTION TO CHECK QUOTA AVAILABILITY
-- ============================================================================

CREATE OR REPLACE FUNCTION can_access_fault_detail(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan plan_name;
  quota_used integer;
  quota_limit integer;
  reset_date DATE;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Get user data
  SELECT 
    p.name, 
    u.monthly_quota_used,
    p.daily_quota_limit,
    u.quota_reset_date
  INTO user_plan, quota_used, quota_limit, reset_date
  FROM users u
  JOIN plans p ON u.plan_id = p.id
  WHERE u.id = user_id;

  -- Pro users have unlimited access
  IF user_plan = 'pro' THEN
    RETURN TRUE;
  END IF;

  -- If reset date has passed, user gets a fresh quota
  IF reset_date IS NULL OR reset_date <= current_date THEN
    RETURN TRUE;
  END IF;

  -- Free users: check if they're within limit
  -- Note: daily_quota_limit from plans table is repurposed for monthly limit (10)
  RETURN quota_used < COALESCE(quota_limit, 10);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_access_fault_detail IS 'Checks if user can view fault details based on plan and quota';

-- ============================================================================
-- 5. UPDATE DEFAULT PLANS FOR MONTHLY QUOTA
-- ============================================================================

-- Update plans to reflect monthly quota in features
UPDATE public.plans
SET 
    features = '{"en": ["10 fault details/month", "Basic search", "Community support"], "tr": ["Ayda 10 arıza detayı", "Temel arama", "Topluluk desteği"]}'
WHERE name = 'free';

UPDATE public.plans
SET 
    features = '{"en": ["Unlimited fault details", "Save favorites", "Advanced search", "Priority support", "Offline access", "Image guides"], "tr": ["Sınırsız arıza detayı", "Favorilere kaydet", "Gelişmiş arama", "Öncelikli destek", "Çevrimdışı erişim", "Görsel rehberler"]}'
WHERE name = 'pro';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Favorites and Monthly Quota migration completed!';
  RAISE NOTICE '📊 New table: favorites (premium-only feature)';
  RAISE NOTICE '📈 Updated: users table with monthly quota columns';
  RAISE NOTICE '🔧 New functions: increment_monthly_quota, can_access_fault_detail';
  RAISE NOTICE '🎯 Free plan: 10 fault details per month';
  RAISE NOTICE '💎 Pro plan: Unlimited + Favorites';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Run this migration in Supabase SQL Editor';
  RAISE NOTICE '   2. Update app code to use monthly quota';
  RAISE NOTICE '   3. Implement FavoritesScreen';
  RAISE NOTICE '   4. Test quota reset logic';
END $$;

