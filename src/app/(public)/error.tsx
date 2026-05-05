"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-3">
        Les fiches ne sont pas disponibles
      </h1>
      <p className="text-muted leading-relaxed mb-6">
        La connexion à la base de données est momentanément indisponible.
        Veuillez réessayer dans quelques instants.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface transition-colors"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
