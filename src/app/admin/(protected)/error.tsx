"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <AlertTriangle className="w-8 h-8 text-amber-600 mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Données indisponibles
        </h1>
        <p className="text-sm text-amber-900 leading-relaxed mb-5">
          L’espace admin n’arrive pas à lire ou écrire dans Supabase pour le
          moment. Vérifiez la connexion, les variables d’environnement et le
          schéma de base de données.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
          style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
