/**
 * Limiteur de tentatives en mémoire (fenêtre glissante), pour freiner le
 * bruteforce du login admin (compte unique). bcrypt ralentit chaque essai ;
 * ce limiteur ajoute un verrouillage après N échecs sur une fenêtre donnée.
 *
 * Portée : la mémoire est propre à l'instance serveur. Pour un site mono-cabinet
 * à faible trafic (une seule instance chaude la plupart du temps), c'est adapté.
 * À l'échelle multi-instances, déplacer ce compteur vers un store partagé
 * (Supabase, Upstash/Redis) — l'interface ci-dessous reste identique.
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

const failures = new Map<string, number[]>(); // clé → timestamps des échecs

function recentFailures(key: string, now: number): number[] {
  const arr = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length === 0) failures.delete(key);
  else failures.set(key, arr);
  return arr;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

/** Vérifie si la clé (IP) peut tenter une connexion. Ne modifie pas le compteur. */
export function checkLoginRate(key: string): RateLimitResult {
  const now = Date.now();
  const arr = recentFailures(key, now);
  if (arr.length >= MAX_FAILURES) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - arr[0])) / 1000)
    );
    return { allowed: false, retryAfterSec };
  }
  return { allowed: true, retryAfterSec: 0 };
}

/** Enregistre un échec d'authentification pour la clé. */
export function recordLoginFailure(key: string): void {
  const now = Date.now();
  const arr = recentFailures(key, now);
  arr.push(now);
  failures.set(key, arr);
}

/** Réinitialise le compteur (connexion réussie). */
export function clearLoginFailures(key: string): void {
  failures.delete(key);
}

/** Clé de limitation à partir des en-têtes de la requête (IP réelle derrière proxy). */
export function clientKeyFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
