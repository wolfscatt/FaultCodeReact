-- FaultCode App - Supabase Database Schema
-- Bilingual support using JSONB columns
-- Run this script in your Supabase SQL editor
-- Generated: 2025-10-16

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Severity levels for fault codes
CREATE TYPE severity_level AS ENUM ('info', 'warning', 'critical');

-- Plan types
CREATE TYPE plan_type AS ENUM ('free', 'pro');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Brands Table
-- Stores boiler/combi manufacturer information
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL, -- {"en": "Vaillant", "tr": "Vaillant"}
  aliases TEXT[], -- Alternative brand names (e.g., ["Beko"] for Arçelik)
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT brands_name_check CHECK (jsonb_typeof(name) = 'object'),
  CONSTRAINT brands_name_has_en CHECK (name ? 'en'),
  CONSTRAINT brands_name_has_tr CHECK (name ? 'tr')
);

-- Boiler Models Table
-- Stores specific boiler/combi models per brand
CREATE TABLE boiler_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL, -- Model names typically don't need translation
  year_start INTEGER,
  year_end INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT boiler_models_year_check CHECK (year_end IS NULL OR year_end >= year_start)
);

-- Fault Codes Table
-- Stores fault/error codes with bilingual descriptions
CREATE TABLE fault_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- e.g., "F28", "E03"
  title JSONB NOT NULL, -- {"en": "Ignition failure", "tr": "Ateşleme hatası"}
  severity severity_level NOT NULL DEFAULT 'info',
  summary JSONB NOT NULL, -- {"en": "Description...", "tr": "Açıklama..."}
  causes JSONB NOT NULL, -- {"en": ["Cause 1", "Cause 2"], "tr": ["Sebep 1", "Sebep 2"]}
  safety_notice JSONB, -- {"en": "Warning text", "tr": "Uyarı metni"} (nullable)
  last_verified_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT fault_codes_title_check CHECK (jsonb_typeof(title) = 'object'),
  CONSTRAINT fault_codes_title_has_en CHECK (title ? 'en'),
  CONSTRAINT fault_codes_title_has_tr CHECK (title ? 'tr'),
  CONSTRAINT fault_codes_summary_check CHECK (jsonb_typeof(summary) = 'object'),
  CONSTRAINT fault_codes_summary_has_en CHECK (summary ? 'en'),
  CONSTRAINT fault_codes_summary_has_tr CHECK (summary ? 'tr'),
  CONSTRAINT fault_codes_causes_check CHECK (jsonb_typeof(causes) = 'object'),
  CONSTRAINT fault_codes_causes_has_en CHECK (causes ? 'en'),
  CONSTRAINT fault_codes_causes_has_tr CHECK (causes ? 'tr'),
  CONSTRAINT fault_codes_safety_notice_check CHECK (
    safety_notice IS NULL OR (
      jsonb_typeof(safety_notice) = 'object' 
      AND safety_notice ? 'en' 
      AND safety_notice ? 'tr'
    )
  ),
  
  -- Unique constraint: same code can't appear twice for same brand
  CONSTRAINT fault_codes_brand_code_unique UNIQUE (brand_id, code)
);

-- Resolution Steps Table
-- Stores step-by-step instructions for resolving faults
CREATE TABLE resolution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fault_code_id UUID NOT NULL REFERENCES fault_codes(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL, -- Step order (1, 2, 3, ...)
  text JSONB NOT NULL, -- {"en": "Check the gas supply...", "tr": "Gaz beslemesini kontrol edin..."}
  estimated_time_min INTEGER, -- Estimated time in minutes
  requires_pro BOOLEAN DEFAULT false, -- Whether this step requires Pro plan
  tools JSONB, -- {"en": ["Screwdriver", "Multimeter"], "tr": ["Tornavida", "Multimetre"]}
  image_url TEXT, -- URL to step image/diagram
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT resolution_steps_text_check CHECK (jsonb_typeof(text) = 'object'),
  CONSTRAINT resolution_steps_text_has_en CHECK (text ? 'en'),
  CONSTRAINT resolution_steps_text_has_tr CHECK (text ? 'tr'),
  CONSTRAINT resolution_steps_tools_check CHECK (
    tools IS NULL OR (
      jsonb_typeof(tools) = 'object' 
      AND tools ? 'en' 
      AND tools ? 'tr'
    )
  ),
  CONSTRAINT resolution_steps_order_positive CHECK (order_number > 0),
  CONSTRAINT resolution_steps_time_positive CHECK (estimated_time_min IS NULL OR estimated_time_min > 0),
  
  -- Unique constraint: can't have duplicate order numbers for same fault
  CONSTRAINT resolution_steps_fault_order_unique UNIQUE (fault_code_id, order_number)
);

-- Plans Table
-- Stores subscription plan information
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name plan_type NOT NULL UNIQUE,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0, -- Price in USD
  daily_quota_limit INTEGER, -- NULL means unlimited
  features JSONB NOT NULL, -- {"en": ["Feature 1", "Feature 2"], "tr": ["Özellik 1", "Özellik 2"]}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT plans_price_non_negative CHECK (price >= 0),
  CONSTRAINT plans_quota_positive CHECK (daily_quota_limit IS NULL OR daily_quota_limit > 0)
);

-- Users Table
-- Extends Supabase auth.users with app-specific data
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  daily_quota_used INTEGER DEFAULT 0,
  last_quota_reset_date DATE DEFAULT CURRENT_DATE,
  preferences JSONB DEFAULT '{"language": "en", "theme": "light"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT users_quota_non_negative CHECK (daily_quota_used >= 0),
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Analytics Events Table
-- Stores user interaction events for analytics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous events
  event_name TEXT NOT NULL,
  event_props JSONB, -- Event-specific properties
  session_id TEXT, -- Optional session tracking
  ip_address INET, -- User IP (optional, for analytics)
  user_agent TEXT, -- User agent string
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT analytics_events_name_not_empty CHECK (length(event_name) > 0)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Brands
CREATE INDEX idx_brands_created_at ON brands(created_at);

-- Boiler Models
CREATE INDEX idx_boiler_models_brand_id ON boiler_models(brand_id);
CREATE INDEX idx_boiler_models_model_name ON boiler_models(model_name);

-- Fault Codes
CREATE INDEX idx_fault_codes_brand_id ON fault_codes(brand_id);
CREATE INDEX idx_fault_codes_code ON fault_codes(code);
CREATE INDEX idx_fault_codes_severity ON fault_codes(severity);
CREATE INDEX idx_fault_codes_brand_code ON fault_codes(brand_id, code);
-- GIN index for full-text search on JSONB fields
CREATE INDEX idx_fault_codes_title_gin ON fault_codes USING GIN (title);
CREATE INDEX idx_fault_codes_summary_gin ON fault_codes USING GIN (summary);

-- Resolution Steps
CREATE INDEX idx_resolution_steps_fault_code_id ON resolution_steps(fault_code_id);
CREATE INDEX idx_resolution_steps_order ON resolution_steps(fault_code_id, order_number);

-- Users
CREATE INDEX idx_users_plan_id ON users(plan_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_quota_reset ON users(last_quota_reset_date);

-- Analytics Events
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id) WHERE session_id IS NOT NULL;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boiler_models_updated_at BEFORE UPDATE ON boiler_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fault_codes_updated_at BEFORE UPDATE ON fault_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resolution_steps_updated_at BEFORE UPDATE ON resolution_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-reset daily quota if date has changed
CREATE OR REPLACE FUNCTION check_and_reset_daily_quota()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_quota_reset_date < CURRENT_DATE THEN
    NEW.daily_quota_used = 0;
    NEW.last_quota_reset_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_reset_daily_quota BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION check_and_reset_daily_quota();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE boiler_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read access for reference data (brands, models, codes, steps, plans)
CREATE POLICY "Public read access for brands" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Public read access for boiler_models" ON boiler_models
  FOR SELECT USING (true);

CREATE POLICY "Public read access for fault_codes" ON fault_codes
  FOR SELECT USING (true);

CREATE POLICY "Public read access for resolution_steps" ON resolution_steps
  FOR SELECT USING (true);

CREATE POLICY "Public read access for plans" ON plans
  FOR SELECT USING (is_active = true);

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own analytics events
CREATE POLICY "Users can insert own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Users can read their own analytics events
CREATE POLICY "Users can read own analytics events" ON analytics_events
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

-- ============================================================================
-- SEED DATA - DEFAULT PLANS
-- ============================================================================

-- Insert default plans
INSERT INTO plans (name, price, daily_quota_limit, features) VALUES
  (
    'free',
    0,
    10,
    '{
      "en": ["10 fault lookups/day", "Basic fault codes", "Community support", "Ads included"],
      "tr": ["Günde 10 hata sorgusu", "Temel hata kodları", "Topluluk desteği", "Reklamlar dahil"]
    }'::jsonb
  ),
  (
    'pro',
    4.99,
    NULL, -- Unlimited
    '{
      "en": ["Unlimited fault lookups", "All fault codes & steps", "Priority support", "Ad-free experience", "Export to PDF", "Offline access"],
      "tr": ["Sınırsız hata sorgusu", "Tüm hata kodları ve çözümler", "Öncelikli destek", "Reklamsız deneyim", "PDF aktarımı", "Çevrimdışı erişim"]
    }'::jsonb
  );

-- ============================================================================
-- HELPER VIEWS (Optional)
-- ============================================================================

-- View to get fault codes with step counts
CREATE VIEW fault_codes_with_stats AS
SELECT 
  fc.*,
  b.name AS brand_name,
  COUNT(rs.id) AS step_count
FROM fault_codes fc
LEFT JOIN brands b ON fc.brand_id = b.id
LEFT JOIN resolution_steps rs ON fc.id = rs.fault_code_id
GROUP BY fc.id, b.name;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE brands IS 'Boiler/combi manufacturer brands';
COMMENT ON TABLE boiler_models IS 'Specific boiler/combi models per brand';
COMMENT ON TABLE fault_codes IS 'Fault/error codes with bilingual descriptions';
COMMENT ON TABLE resolution_steps IS 'Step-by-step resolution instructions';
COMMENT ON TABLE plans IS 'Subscription plans (free/pro)';
COMMENT ON TABLE users IS 'User accounts with subscription and quota tracking';
COMMENT ON TABLE analytics_events IS 'User interaction events for analytics';

COMMENT ON COLUMN fault_codes.title IS 'Bilingual fault title: {"en": "...", "tr": "..."}';
COMMENT ON COLUMN fault_codes.summary IS 'Bilingual fault summary: {"en": "...", "tr": "..."}';
COMMENT ON COLUMN fault_codes.causes IS 'Bilingual causes array: {"en": ["..."], "tr": ["..."]}';
COMMENT ON COLUMN fault_codes.safety_notice IS 'Optional bilingual safety warning: {"en": "...", "tr": "..."}';
COMMENT ON COLUMN resolution_steps.text IS 'Bilingual step instruction: {"en": "...", "tr": "..."}';
COMMENT ON COLUMN resolution_steps.tools IS 'Bilingual tools array: {"en": ["..."], "tr": ["..."]}';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to increment user quota
-- Called when a user views a fault detail
CREATE OR REPLACE FUNCTION increment_user_quota(user_id UUID)
RETURNS VOID AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  last_reset DATE;
BEGIN
  -- Get the last reset date
  SELECT last_quota_reset_date INTO last_reset
  FROM users
  WHERE id = user_id;
  
  -- If it's a new day, reset the quota
  IF last_reset IS NULL OR last_reset < current_date THEN
    UPDATE users
    SET daily_quota_used = 1,
        last_quota_reset_date = current_date
    WHERE id = user_id;
  ELSE
    -- Increment the quota
    UPDATE users
    SET daily_quota_used = daily_quota_used + 1
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_user_quota IS 'Increments user daily quota, resetting if new day';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ FaultCode database schema created successfully!';
  RAISE NOTICE '📊 Tables: brands, boiler_models, fault_codes, resolution_steps, plans, users, analytics_events';
  RAISE NOTICE '🌍 Bilingual support: JSONB columns with en/tr keys';
  RAISE NOTICE '🔒 Row Level Security: Enabled on all tables';
  RAISE NOTICE '🔧 Functions: increment_user_quota';
  RAISE NOTICE '📈 Next steps:';
  RAISE NOTICE '   1. Enable Supabase Auth in dashboard (Settings > Authentication)';
  RAISE NOTICE '   2. Add SUPABASE_SERVICE_ROLE_KEY to .env (required for user creation)';
  RAISE NOTICE '   3. Configure email templates (optional)';
  RAISE NOTICE '   4. Migrate mock data to Supabase (yarn db:import)';
  RAISE NOTICE '   5. Test registration and email verification flow';
  RAISE NOTICE '';
  RAISE NOTICE 'ℹ️ User profiles are created in code using service role key (bypasses RLS)';
END $$;

