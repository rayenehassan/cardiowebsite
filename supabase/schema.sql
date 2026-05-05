-- CardioInfo — Supabase schema
-- Run this once in: Supabase Dashboard > SQL Editor > New query

CREATE TABLE IF NOT EXISTS interventions (
  id               TEXT        PRIMARY KEY,
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  subtitle         TEXT        NOT NULL DEFAULT '',
  status           TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'published')),
  sections         JSONB       NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration (existing table — run once if upgrading from old schema):
-- ALTER TABLE interventions ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]';
-- Old columns (overview, why_performed, preparation, …) can be dropped after migration:
-- ALTER TABLE interventions
--   DROP COLUMN IF EXISTS overview,
--   DROP COLUMN IF EXISTS why_performed,
--   DROP COLUMN IF EXISTS preparation,
--   DROP COLUMN IF EXISTS during_procedure,
--   DROP COLUMN IF EXISTS after_procedure,
--   DROP COLUMN IF EXISTS risks,
--   DROP COLUMN IF EXISTS practical_info,
--   DROP COLUMN IF EXISTS videos,
--   DROP COLUMN IF EXISTS images,
--   DROP COLUMN IF EXISTS documents,
--   DROP COLUMN IF EXISTS faqs,
--   DROP COLUMN IF EXISTS section_order;

-- Auto-update updated_at on every row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS interventions_updated_at ON interventions;
CREATE TRIGGER interventions_updated_at
  BEFORE UPDATE ON interventions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row Level Security
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS interventions_status_created_at_idx
  ON interventions (status, created_at);

CREATE INDEX IF NOT EXISTS interventions_slug_status_idx
  ON interventions (slug, status);

-- Public: read published only (patients)
DROP POLICY IF EXISTS "public_read_published" ON interventions;
CREATE POLICY "public_read_published" ON interventions
  FOR SELECT TO anon
  USING (status = 'published');

-- Service role bypasses RLS automatically — no additional policy needed for admin
