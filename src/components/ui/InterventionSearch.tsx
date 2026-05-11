"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Search, ArrowRight, X } from "lucide-react";
import type { Intervention } from "@/types/intervention";

interface Props {
  interventions: Intervention[];
}

export default function InterventionSearch({ interventions }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const results = q.length > 0
    ? interventions.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle?.toLowerCase().includes(q)
      )
    : [];

  const suggestions = interventions.slice(0, 4);
  const showResults = q.length > 0;

  return (
    <div
      className="rounded-2xl overflow-hidden border bg-white"
      style={{
        borderColor: "rgba(15, 23, 42, 0.08)",
        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Header */}
      <div className="px-6 sm:px-7 pt-6 pb-5 border-b" style={{ borderColor: "rgba(15, 23, 42, 0.06)" }}>
        <p
          className="text-lg font-semibold text-foreground leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Trouvez votre intervention
        </p>
        <p className="text-base mt-1" style={{ color: "#475569" }}>
          Tapez le nom indiqué par votre cardiologue
        </p>
      </div>

      {/* Search input */}
      <div className="px-6 sm:px-7 py-5">
        <div className="relative">
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(2,132,199,0.1)" }}
            aria-hidden="true"
          >
            <Search className="w-5 h-5" style={{ color: "#0369A1" }} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : coronarographie, pacemaker…"
            aria-label="Rechercher une intervention"
            className="w-full pl-16 pr-14 py-4 rounded-xl border outline-none transition-all"
            style={{
              fontFamily: "var(--font-sans)",
              background: "#ffffff",
              borderColor: q ? "rgba(2,132,199,0.5)" : "rgba(15,23,42,0.12)",
              color: "#0F172A",
              boxShadow: q
                ? "0 0 0 4px rgba(2,132,199,0.08), 0 1px 4px rgba(0,0,0,0.04)"
                : "0 1px 4px rgba(0,0,0,0.03)",
              fontSize: "16px",
              minHeight: "56px",
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 focus-visible:bg-gray-100"
              aria-label="Effacer la recherche"
              style={{ color: "#475569" }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results / Suggestions — fixed height to prevent box jumping */}
      <div className="h-80 overflow-y-auto border-t" style={{ borderColor: "rgba(15, 23, 42, 0.06)" }}>
        {showResults ? (
          <>
            {results.length > 0 ? (
              <ul className="divide-y" style={{ borderColor: "rgba(15, 23, 42, 0.05)" }}>
                {results.map((intervention) => (
                  <li key={intervention.id}>
                    <Link
                      href={`/interventions/${intervention.slug}`}
                      className="group flex items-center justify-between px-6 sm:px-7 py-4 transition-colors hover:bg-blue-50 focus-visible:bg-blue-50"
                      style={{ minHeight: "60px" }}
                    >
                      <div className="min-w-0 pr-4">
                        <p
                          className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {intervention.title}
                        </p>
                        {intervention.subtitle && (
                          <p className="text-base mt-1 truncate" style={{ color: "#475569" }}>
                            {intervention.subtitle}
                          </p>
                        )}
                      </div>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ background: "rgba(2,132,199,0.08)" }}
                      >
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "#0369A1" }} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-7 text-center">
                <p
                  className="text-base font-semibold text-foreground mb-1"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Aucun résultat
                </p>
                <p className="text-base mb-4" style={{ color: "#475569" }}>
                  Essayez un autre terme ou parcourez la liste complète.
                </p>
                <Link
                  href="/#interventions"
                  className="inline-flex items-center gap-2 text-base font-medium text-primary hover:underline py-2"
                  style={{ fontFamily: "var(--font-heading)", minHeight: "44px" }}
                >
                  Voir toutes les interventions <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="px-6 sm:px-7 py-6">
            {suggestions.length > 0 && (
              <>
                <p
                  className="text-[13px] font-semibold uppercase tracking-wider mb-3"
                  style={{ fontFamily: "var(--font-heading)", color: "#475569" }}
                >
                  Suggestions
                </p>
                <div className="flex flex-col gap-2">
                  {suggestions.map((intervention) => (
                    <Link
                      key={intervention.id}
                      href={`/interventions/${intervention.slug}`}
                      className="group flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:border-blue-200 hover:bg-blue-50 focus-visible:bg-blue-50"
                      style={{
                        borderColor: "rgba(15,23,42,0.08)",
                        background: "rgba(248,250,255,0.6)",
                        minHeight: "48px",
                      }}
                    >
                      <span
                        className="text-base font-medium text-foreground group-hover:text-primary transition-colors"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {intervention.title}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all flex-shrink-0" style={{ color: "#475569" }} />
                    </Link>
                  ))}
                </div>
              </>
            )}
            <Link
              href="/#interventions"
              className="mt-5 flex items-center justify-center gap-2 text-sm hover:text-primary transition-colors py-2"
              style={{ fontFamily: "var(--font-heading)", color: "#475569", minHeight: "44px" }}
            >
              Voir toutes les fiches ({interventions.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
