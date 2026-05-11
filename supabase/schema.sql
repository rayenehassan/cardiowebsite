-- CardioInfo — Supabase schema
-- Run this once in: Supabase Dashboard > SQL Editor > New query

CREATE TABLE IF NOT EXISTS interventions (
  id               TEXT        PRIMARY KEY,
  slug             TEXT        UNIQUE NOT NULL,
  title            TEXT        NOT NULL,
  subtitle         TEXT        NOT NULL DEFAULT '',
  status           TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'published', 'archived')),
  sections         JSONB       NOT NULL DEFAULT '[]',
  quick_facts      JSONB       NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration : ajout de la colonne quick_facts — run once if upgrading:
-- ALTER TABLE interventions ADD COLUMN IF NOT EXISTS quick_facts JSONB NOT NULL DEFAULT '[]';

-- Migration : ajout du statut 'archived' (soft delete) — run once:
-- ALTER TABLE interventions DROP CONSTRAINT IF EXISTS interventions_status_check;
-- ALTER TABLE interventions ADD CONSTRAINT interventions_status_check
--   CHECK (status IN ('draft', 'published', 'archived'));

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


-- ============================================================================
-- CardioInfo — contenu éditable de la page d'accueil (singleton JSONB)
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_content (
  id          TEXT        PRIMARY KEY DEFAULT 'singleton',
  data        JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT site_content_singleton CHECK (id = 'singleton')
);

DROP TRIGGER IF EXISTS site_content_updated_at ON site_content;
CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public : lecture libre (contenu d'accueil non sensible)
DROP POLICY IF EXISTS "public_read_site_content" ON site_content;
CREATE POLICY "public_read_site_content" ON site_content
  FOR SELECT TO anon
  USING (true);

-- Initialisation singleton vide (les valeurs par défaut sont injectées par l'app
-- depuis src/lib/site-defaults.ts si la ligne n'existe pas).
INSERT INTO site_content (id, data)
VALUES ('singleton', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- CardioInfo — équipe médicale (cardiologues)
-- ============================================================================

CREATE TABLE IF NOT EXISTS doctors (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  display_order  INT         NOT NULL DEFAULT 0,
  name           TEXT        NOT NULL,
  subtitle       TEXT        NOT NULL DEFAULT 'Cardiologie interventionnelle',
  phone          TEXT        NOT NULL DEFAULT '',
  email          TEXT        NOT NULL DEFAULT '',
  photo_url      TEXT        NOT NULL DEFAULT '',
  status         TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'archived')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS doctors_status_order_idx
  ON doctors (status, display_order);

DROP TRIGGER IF EXISTS doctors_updated_at ON doctors;
CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Public : lecture libre des cardiologues actifs uniquement
DROP POLICY IF EXISTS "public_read_doctors_active" ON doctors;
CREATE POLICY "public_read_doctors_active" ON doctors
  FOR SELECT TO anon
  USING (status = 'active');

-- Seed initial : 3 cardiologues actuels (photos locales /public).
-- Ne s'exécute que si la table doctors est vide → safe à re-runner.
INSERT INTO doctors (display_order, name, subtitle, phone, email, photo_url)
SELECT * FROM (VALUES
  (0, 'Dr Mustapha HASSAN', 'Cardiologie interventionnelle', '04 78 22 91 12', 'moustapha@gmail.com', '/Mustapha%20Hassan.jpg'),
  (1, 'Dr Antoine GERBAY',  'Cardiologie interventionnelle', '04 72 81 93 12', 'jeremy@gmail.com',    '/Antoine%20Gerbay.jpg'),
  (2, 'Dr Jeremy TERREAUX', 'Cardiologie interventionnelle', '04 71 88 82 22', 'antoine@gmail.com',   '/Jeremy%20Terreaux.jpg')
) AS seed(display_order, name, subtitle, phone, email, photo_url)
WHERE NOT EXISTS (SELECT 1 FROM doctors);
