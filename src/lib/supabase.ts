import { createClient } from "@supabase/supabase-js";

function requireSupabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variables Supabase manquantes. Vérifiez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return {
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey,
    url,
  };
}

function createServerClient(url: string, key: string) {
  return createClient(url, key, {
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
export function getSupabaseAdmin() {
  const { serviceRoleKey, url } = requireSupabaseEnv();
  return createServerClient(url, serviceRoleKey);
}

/**
 * Client utilisé par les lectures publiques.
 * Si SUPABASE_ANON_KEY est fournie, les policies RLS Supabase filtrent aussi
 * les données publiées au niveau base. Sinon, les requêtes serveur gardent le
 * filtre explicite status = published.
 */
export function getSupabasePublic() {
  const { anonKey, serviceRoleKey, url } = requireSupabaseEnv();
  return createServerClient(url, anonKey || serviceRoleKey);
}
