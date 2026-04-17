-- Migration 013: Admin dashboard support tables
-- site_settings, announcements, and pricing_defaults column on region_config

-- ============================================================
-- 1. Site settings (key-value global config)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Seed defaults
INSERT INTO public.site_settings (key, value, description) VALUES
  ('support_email', '"support@cohomed.com.au"'::jsonb, 'Support email address shown in the app'),
  ('support_phone', '""'::jsonb, 'Support phone number (optional)'),
  ('app_version_min', '"1.0.0"'::jsonb, 'Minimum app version — users below this are forced to update'),
  ('feature_flags', '{"boost_to_buy": true, "broker_referrals": true, "payto_payments": false, "stripe_payments": true, "referrals": true}'::jsonb, 'Feature toggles'),
  ('marketing_banner_enabled', 'false'::jsonb, 'Show the promo banner on the marketing site'),
  ('new_signups_allowed', 'true'::jsonb, 'Whether new users can sign up'),
  ('platform_fee_percent', '0'::jsonb, 'Additional platform fee on top of tier rates (0 = off)'),
  ('referral_bonus', '50'::jsonb, 'Referral bonus amount (credit to both referrer and referee)')
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read site settings" ON site_settings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND app_role IN ('global_admin', 'regional_admin')));
-- Writes via service role only

-- ============================================================
-- 2. Announcements (banners shown in app)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT DEFAULT '📢',
  style TEXT DEFAULT 'info' CHECK (style IN ('info', 'success', 'warning', 'danger')),
  audience TEXT DEFAULT 'all' CHECK (audience IN ('all', 'region')),
  region_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_dismissible BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, expires_at);

-- RLS — anyone can read active announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active announcements" ON announcements FOR SELECT TO authenticated
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Dismissals tracker
CREATE TABLE IF NOT EXISTS public.announcement_dismissals (
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

ALTER TABLE public.announcement_dismissals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dismissals" ON announcement_dismissals FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 3. pricing_defaults column on region_config
-- ============================================================
ALTER TABLE public.region_config
  ADD COLUMN IF NOT EXISTS pricing_defaults JSONB DEFAULT '{
    "setupFees": {"starter": 99, "standard": 259, "premium": 499},
    "transactionRates": {"starter": 0.03, "standard": 0.015, "premium": 0.005},
    "transactionCaps": {"starter": 40, "standard": 25, "premium": 15}
  }'::jsonb;

COMMENT ON TABLE site_settings IS 'Global site settings and feature flags, editable from the admin dashboard';
COMMENT ON TABLE announcements IS 'In-app banner announcements, scoped to all users or specific regions';
COMMENT ON COLUMN region_config.pricing_defaults IS 'Default pricing tiers (setup fees, transaction rates, caps) for this region';
