"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Search, ArrowRight, X, Stethoscope } from "lucide-react";
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
      className="rounded-3xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.95)",
        boxShadow: "0 20px 60px rgba(2,132,199,0.12), 0 4px 20px rgba(0,0,0,0.07)",
      }}
    >
      {/* ── Header gradient ── */}
      <div
        className="px-7 pt-7 pb-6"
        style={{
          background: "linear-gradient(135deg, rgba(238,244,255,0.9) 0%, rgba(248,250,255,0.7) 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(2,132,199,0.12)", border: "1px solid rgba(2,132,199,0.2)" }}
          >
            <Stethoscope className="w-4.5 h-4.5" style={{ color: "#0284C7", width: 18, height: 18 }} />
          </div>
          <div>
            <p
              className="text-base font-bold text-foreground leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Trouvez votre intervention
            </p>
            <p className="text-xs text-muted mt-0.5">
              Tapez le nom indiqué par votre cardiologue
            </p>
          </div>
        </div>
      </div>

      {/* ── Search input ── */}
      <div className="px-7 py-5 border-y" style={{ borderColor: "rgba(2,132,199,0.08)" }}>
        <div className="relative">
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(2,132,199,0.1)" }}
          >
            <Search className="w-4 h-4" style={{ color: "#0284C7" }} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : coronarographie, pacemaker…"
            className="w-full pl-14 pr-10 py-4 rounded-2xl border outline-none transition-all text-sm"
            style={{
              fontFamily: "var(--font-sans)",
              background: "#ffffff",
              borderColor: q ? "rgba(2,132,199,0.5)" : "rgba(0,0,0,0.09)",
              color: "#0F172A",
              boxShadow: q
                ? "0 0 0 4px rgba(2,132,199,0.09), 0 1px 4px rgba(0,0,0,0.05)"
                : "0 1px 4px rgba(0,0,0,0.04)",
              fontSize: "15px",
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
              aria-label="Effacer"
              style={{ color: "#94A3B8" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Résultats ── */}
      {showResults ? (
        <div>
          {results.length > 0 ? (
            <ul className="divide-y divide-black/[0.04] max-h-72 overflow-y-auto">
              {results.map((intervention) => (
                <li key={intervention.id}>
                  <Link
                    href={`/interventions/${intervention.slug}`}
                    className="group flex items-center justify-between px-7 py-4 transition-colors hover:bg-blue-50"
                  >
                    <div className="min-w-0 pr-4">
                      <p
                        className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {intervention.title}
                      </p>
                      {intervention.subtitle && (
                        <p className="text-sm text-muted mt-0.5 truncate">
                          {intervention.subtitle}
                        </p>
                      )}
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                      style={{ background: "rgba(2,132,199,0.08)" }}
                    >
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" style={{ color: "#0284C7" }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-7 py-8 text-center">
              <p className="text-sm font-medium text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                Aucun résultat
              </p>
              <p className="text-sm text-muted mb-4">
                Essayez un autre terme ou parcourez la liste complète.
              </p>
              <Link
                href="/#interventions"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Voir toutes les interventions <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* ── État vide : suggestions rapides ── */
        <div className="px-7 py-6">
          {suggestions.length > 0 && (
            <>
              <p
                className="text-xs font-semibold uppercase tracking-widest text-muted mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Suggestions
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((intervention) => (
                  <Link
                    key={intervention.id}
                    href={`/interventions/${intervention.slug}`}
                    className="group flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:border-blue-200 hover:bg-blue-50"
                    style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(248,250,255,0.6)" }}
                  >
                    <span
                      className="text-sm font-medium text-foreground group-hover:text-primary transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {intervention.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </>
          )}

          <Link
            href="/#interventions"
            className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <ArrowRight className="w-3 h-3" />
            Voir toutes les fiches ({interventions.length})
          </Link>
        </div>
      )}
    </div>
  );
}
