-- CardioInfo — tables pour le chatbot patient
-- Exécuter dans : Supabase Dashboard > SQL Editor

-- ── 1. Tous les échanges chatbot (analytics) ───────────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question     TEXT        NOT NULL,
  answer       TEXT        NOT NULL,
  bot_answered BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_logs_created_at_idx ON chat_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS chat_logs_bot_answered_idx ON chat_logs (bot_answered);

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
-- Toutes les insertions passent côté serveur via service_role → pas de policy publique nécessaire

-- ── 2. Questions hors-sujet + réponses personnalisées du médecin ───────────
CREATE TABLE IF NOT EXISTS chat_custom_answers (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question       TEXT        NOT NULL,
  doctor_answer  TEXT,
  status         TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'answered', 'dismissed')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_custom_answers_status_idx ON chat_custom_answers (status);
CREATE INDEX IF NOT EXISTS chat_custom_answers_created_at_idx ON chat_custom_answers (created_at DESC);

DROP TRIGGER IF EXISTS chat_custom_answers_updated_at ON chat_custom_answers;
CREATE TRIGGER chat_custom_answers_updated_at
  BEFORE UPDATE ON chat_custom_answers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE chat_custom_answers ENABLE ROW LEVEL SECURITY;
