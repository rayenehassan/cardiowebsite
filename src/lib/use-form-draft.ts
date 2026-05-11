"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

interface Draft<T> {
  value: T;
  savedAt: number;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * Brouillon localStorage auto-sauvegardé toutes les `debounceMs`.
 * - Sur reload / session expirée / refresh accidentel, le brouillon survit.
 * - Sur enregistrement réussi, appeler `clear()` pour purger.
 * - `existingDraft` est null après `dismiss()` ou `clear()`.
 *
 * Le hook ne réapplique JAMAIS automatiquement le brouillon : c'est au form
 * de proposer un bandeau "Restaurer / Ignorer" et de hydrater son state.
 */
export function useFormDraft<T>(
  key: string,
  currentValue: T,
  debounceMs = 1000
) {
  const [dismissed, setDismissed] = useState(false);

  // Lecture SSR-safe du brouillon existant.
  const draftJSON = useSyncExternalStore(
    subscribe,
    () => (typeof window === "undefined" ? null : localStorage.getItem(key)),
    () => null
  );

  const existingDraft = useMemo<Draft<T> | null>(() => {
    if (!draftJSON || dismissed) return null;
    try {
      return JSON.parse(draftJSON) as Draft<T>;
    } catch {
      return null;
    }
  }, [draftJSON, dismissed]);

  // Timer ref pour pouvoir annuler le persist en cours depuis `clear()`,
  // sinon un debounce déjà programmé peut firer après submit et réécrire.
  const timerRef = useRef<number | null>(null);

  // Persist debounced à chaque changement de `currentValue`.
  useEffect(() => {
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
        // Quota dépassé ou mode privé : ignorer silencieusement.
      }
    }, debounceMs);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [key, currentValue, debounceMs]);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignorer.
    }
  }, [key]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    clear();
  }, [clear]);

  return { existingDraft, clear, dismiss };
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
 * Formatte un timestamp en "il y a X min/h" (FR).
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
