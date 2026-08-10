-- ── RAG : table documents + recherche vectorielle ───────────────────────────
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Extension pgvector (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Table des chunks de documents
CREATE TABLE IF NOT EXISTS documents (
  id          BIGSERIAL PRIMARY KEY,
  source      TEXT NOT NULL,        -- nom du fichier PDF
  chunk_index INT  NOT NULL,        -- position du chunk dans le doc
  content     TEXT NOT NULL,        -- texte du chunk (~400 mots)
  embedding   vector(1536),         -- text-embedding-3-small
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index cosinus pour la recherche rapide
CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- 4. RLS : pas de lecture publique, accès via service_role uniquement
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 5. Fonction de recherche sémantique (appelée depuis l'API chat)
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_count     INT   DEFAULT 4,
  min_similarity  FLOAT DEFAULT 0.45
)
RETURNS TABLE (
  id         BIGINT,
  source     TEXT,
  content    TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    source,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (embedding <=> query_embedding) > min_similarity
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
