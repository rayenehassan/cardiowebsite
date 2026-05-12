"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface Draft<T> {
  value: T;
  savedAt: number;
}

/**
 * Brouillon localStorage auto-sauvegardé pendant l'édition.
 *
 * Principe :
 * - Le brouillon stocké est lu UNE SEULE FOIS au montage (pas d'observation
 *   en continu) → nos propres écritures ne déclenchent pas le bandeau.
 * - Pendant la session, on persiste l'état actuel toutes les `debounceMs`.
 * - À la fermeture / refresh, on flush synchronement la valeur la plus récente.
 * - Le brouillon n'est exposé via `existingDraft` que s'il diffère réellement
 *   de la valeur initiale du form (sinon aucun intérêt).
 * - Après que l'utilisateur a cliqué Restaurer ou Ignorer (ou après un save
 *   réussi), `clear()` masque le bandeau et purge le localStorage.
 */
export function useFormDraft<T>(
  key: string,
  currentValue: T,
  initialValue: T,
  debounceMs = 1000
) {
  // Lecture unique du brouillon existant. `didRead` est passé à `true` lors
  // de la première render client : c'est ce qui permet de schedule un setState
  // pendant le rendu sans boucler (pattern React-endorsé d'ajustement d'état).
  const [rawDraft, setRawDraft] = useState<Draft<T> | null>(null);
  const [didRead, setDidRead] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!didRead && typeof window !== "undefined") {
    setDidRead(true);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Draft<T>;
        if (parsed && typeof parsed === "object" && "value" in parsed) {
          setRawDraft(parsed);
        }
      }
    } catch {
      // localStorage indisponible / contenu corrompu : ignorer.
    }
  }

  // Le brouillon n'est "significatif" que s'il diffère de l'état initial du form.
  // Sans ça, ouvrir une fiche, ne rien toucher, attendre 1s, puis revenir
  // afficherait un bandeau pour rien (l'état initial a été persisté).
  const existingDraft = useMemo<Draft<T> | null>(() => {
    if (!rawDraft || acknowledged) return null;
    try {
      if (JSON.stringify(rawDraft.value) === JSON.stringify(initialValue)) {
        return null;
      }
    } catch {
      return null;
    }
    return rawDraft;
  }, [rawDraft, initialValue, acknowledged]);

  // Persist debounced à chaque changement de currentValue.
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!didRead) return; // pas d'écriture tant qu'on n'a pas lu l'existant
    if (typeof window === "undefined") return;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      try {
        const payload: Draft<T> = {
          value: currentValue,
          savedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        // Quota dépassé / mode privé strict : silencieux.
      }
    }, debounceMs);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [key, currentValue, debounceMs, didRead]);

  // Flush synchrone à la fermeture / refresh / navigation : couvre le cas
  // où l'utilisateur quitte avant que le debounce ait fini.
  useEffect(() => {
    if (!didRead) return;
    if (typeof window === "undefined") return;
    function flush() {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ value: currentValue, savedAt: Date.now() })
        );
      } catch {}
    }
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [key, currentValue, didRead]);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      localStorage.removeItem(key);
    } catch {}
    setRawDraft(null);
    setAcknowledged(true);
  }, [key]);

  return { existingDraft, clear };
}

/**
 * Affiche le popup natif du navigateur si l'utilisateur essaie de quitter
 * la page alors que `dirty` est vrai.
 */
export function useBeforeUnload(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

/**
 * Formatte un timestamp en "à l'instant" / "il y a X min/h/j" (FR).
 */
export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "à l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `il y a ${diffHr} h`;
  const diffDay = Math.floor(diffHr / 24);
  return `il y a ${diffDay} j`;
}
