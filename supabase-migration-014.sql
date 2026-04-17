-- Migration 014: Voucher Rules (templates for bulk code generation)
-- Adds voucher_rules table, links vouchers to rules, and adds campaign tracking

-- ============================================================
-- 1. voucher_rules — templates that define the shape of codes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.voucher_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,

  -- Discount config
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,

  -- Code generation config
  code_length INTEGER NOT NULL DEFAULT 6 CHECK (code_length BETWEEN 4 AND 20),
  code_prefix TEXT DEFAULT '',            -- e.g. "LAUNCH-" produces "LAUNCH-A4K9T2"
  code_charset TEXT NOT NULL DEFAULT 'alphanumeric' CHECK (code_charset IN ('alphanumeric', 'letters', 'numbers')),

  -- Usage limits per generated code
  max_redemptions_per_code INTEGER NOT NULL DEFAULT 1,  -- single use by default
  default_expires_days INTEGER,              -- codes generated from this rule expire N days after creation; NULL = no expiry

  -- Targeting
  region_code TEXT,                           -- NULL = all regions
  applies_to TEXT NOT NULL DEFAULT 'setup_fee' CHECK (applies_to IN ('setup_fee', 'transaction_fee', 'both')),
  min_group_size INTEGER,
  max_group_size INTEGER,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_voucher_rules_active ON voucher_rules(is_active);

-- ============================================================
-- 2. Extend vouchers table — link to rules + campaign tracking
-- ============================================================
ALTER TABLE public.vouchers
  ADD COLUMN IF NOT EXISTS rule_id UUID REFERENCES public.voucher_rules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS campaign_name TEXT,
  ADD COLUMN IF NOT EXISTS generated_in_batch UUID,  -- groups codes generated together
  ADD COLUMN IF NOT EXISTS applies_to TEXT DEFAULT 'setup_fee' CHECK (applies_to IN ('setup_fee', 'transaction_fee', 'both')),
  ADD COLUMN IF NOT EXISTS region_code TEXT,
  ADD COLUMN IF NOT EXISTS min_group_size INTEGER,
  ADD COLUMN IF NOT EXISTS max_group_size INTEGER,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_vouchers_rule ON vouchers(rule_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_batch ON vouchers(generated_in_batch);

-- ============================================================
-- 3. Helper function: generate random codes from a rule
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_voucher_codes(
  p_rule_id UUID,
  p_quantity INTEGER,
  p_campaign_name TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_rule RECORD;
  v_batch_id UUID := uuid_generate_v4();
  v_code TEXT;
  v_charset TEXT;
  v_i INTEGER;
  v_j INTEGER;
  v_attempts INTEGER;
  v_expires TIMESTAMPTZ;
  v_generated INTEGER := 0;
  v_role TEXT;
BEGIN
  -- Admin check
  SELECT app_role INTO v_role FROM profiles WHERE id = auth.uid();
  IF v_role NOT IN ('global_admin', 'regional_admin') THEN
    RETURN jsonb_build_object('error', 'Admin role required');
  END IF;

  IF p_quantity <= 0 OR p_quantity > 10000 THEN
    RETURN jsonb_build_object('error', 'Quantity must be between 1 and 10000');
  END IF;

  -- Load rule
  SELECT * INTO v_rule FROM voucher_rules WHERE id = p_rule_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Rule not found');
  END IF;

  -- Choose charset (confusing chars removed: 0/O, 1/I/L)
  v_charset := CASE v_rule.code_charset
    WHEN 'letters' THEN 'ABCDEFGHJKMNPQRSTUVWXYZ'
    WHEN 'numbers' THEN '23456789'
    ELSE 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  END;

  -- Expiry: explicit param overrides rule default
  IF p_expires_at IS NOT NULL THEN
    v_expires := p_expires_at;
  ELSIF v_rule.default_expires_days IS NOT NULL THEN
    v_expires := NOW() + (v_rule.default_expires_days * INTERVAL '1 day');
  ELSE
    v_expires := NULL;
  END IF;

  FOR v_i IN 1..p_quantity LOOP
    -- Try up to 10 times to generate a unique code
    v_attempts := 0;
    LOOP
      v_code := COALESCE(v_rule.code_prefix, '');
      FOR v_j IN 1..v_rule.code_length LOOP
        v_code := v_code || substr(v_charset, 1 + floor(random() * length(v_charset))::INTEGER, 1);
      END LOOP;

      BEGIN
        INSERT INTO vouchers (
          code, description, discount_type, discount_value,
          max_redemptions, expires_at, is_active,
          rule_id, campaign_name, generated_in_batch,
          applies_to, region_code, min_group_size, max_group_size
        ) VALUES (
          v_code,
          v_rule.description,
          v_rule.discount_type,
          v_rule.discount_value,
          v_rule.max_redemptions_per_code,
          v_expires,
          TRUE,
          v_rule.id,
          COALESCE(p_campaign_name, v_rule.name),
          v_batch_id,
          v_rule.applies_to,
          v_rule.region_code,
          v_rule.min_group_size,
          v_rule.max_group_size
        );
        v_generated := v_generated + 1;
        EXIT;  -- success, move to next code
      EXCEPTION WHEN unique_violation THEN
        v_attempts := v_attempts + 1;
        IF v_attempts >= 10 THEN
          RETURN jsonb_build_object(
            'error', 'Code collision after 10 attempts — increase code length',
            'generated', v_generated
          );
        END IF;
      END;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'batch_id', v_batch_id,
    'rule_id', v_rule.id,
    'generated', v_generated,
    'campaign', COALESCE(p_campaign_name, v_rule.name)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. RLS
-- ============================================================
ALTER TABLE public.voucher_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage voucher rules" ON voucher_rules FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND app_role IN ('global_admin', 'regional_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND app_role IN ('global_admin', 'regional_admin')));

COMMENT ON TABLE voucher_rules IS 'Reusable templates for bulk generating voucher codes. Each rule defines the discount, code shape, and constraints. Codes generated from a rule share its properties.';
COMMENT ON FUNCTION generate_voucher_codes IS 'Admin-only function to bulk generate unique voucher codes from a rule. Collision-safe up to code_length=6 at reasonable quantities.';
