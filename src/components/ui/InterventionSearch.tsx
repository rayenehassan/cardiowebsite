"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { Intervention } from "@/types/intervention";
import { normalizeForSearch, frenchTypography } from "@/lib/text";

interface Props {
  interventions: Intervention[];
}

export default function InterventionSearch({ interventions }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const q = normalizeForSearch(query);
  const results =
    q.length > 0
      ? interventions.filter(
          (i) =>
            normalizeForSearch(i.title).includes(q) ||
            (i.subtitle ? normalizeForSearch(i.subtitle).includes(q) : false)
        )
      : [];

  const suggestions = interventions.slice(0, 5);
  const showResults = q.length > 0;
  const list = showResults ? results : suggestions;

  return (
    <div className="border border-border bg-background">
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <p className="text-lg font-bold text-foreground">
          Trouvez votre intervention
        </p>
        <p className="text-base text-muted mt-0.5">
          Tapez le nom que votre cardiologue vous a indiqué.
        </p>
      </div>

      <div className="px-5 py-4">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-soft pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : coronarographie, pacemaker…"
            aria-label="Rechercher une intervention"
            className="w-full min-h-14 pl-11 pr-11 py-3 text-base bg-background text-foreground border border-border-strong outline-none transition-colors focus:border-primary"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Hauteur fixe : la boîte ne saute pas quand la liste change. */}
      <div className="h-72 overflow-y-auto border-t border-border">
        {list.length > 0 ? (
          <>
            {!showResults && (
              <p className="px-5 pt-4 pb-1 text-sm text-muted-soft">
                Les plus consultées
              </p>
            )}
            <ul>
              {list.map((intervention) => (
                <li key={intervention.id} className="border-b border-border last:border-b-0">
                  <Link
                    href={`/interventions/${intervention.slug}`}
                    className="block px-5 py-3.5 min-h-14 transition-colors hover:bg-surface focus-visible:bg-surface"
                  >
                    <span className="block text-base font-semibold text-foreground">
                      {frenchTypography(intervention.title)}
                    </span>
                    {intervention.subtitle && (
                      <span className="block text-sm text-muted mt-0.5 truncate">
                        {frenchTypography(intervention.subtitle)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="px-5 py-6">
            <p className="text-base font-semibold text-foreground mb-1">
              Aucun résultat
            </p>
            <p className="text-base text-muted">
              Essayez un autre terme, ou parcourez la liste complète plus bas
              dans la page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
