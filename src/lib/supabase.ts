import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Variables Supabase manquantes. Vérifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local"
  );
}

const supabaseUrl = url;
const supabaseServiceRoleKey = serviceRoleKey;

function createServerClient(key: string) {
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Client admin côté serveur uniquement.
 * Utilise la clé service_role — ne jamais exposer côté client.
 */
export const supabaseAdmin = createServerClient(supabaseServiceRoleKey);

/**
 * Client utilisé par les lectures publiques.
 * Si SUPABASE_ANON_KEY est fournie, les policies RLS Supabase filtrent aussi
 * les données publiées au niveau base. Sinon, les requêtes serveur gardent le
 * filtre explicite status = published.
 */
export const supabasePublic = createServerClient(
  anonKey || supabaseServiceRoleKey
);
