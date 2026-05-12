"use client";

import { Save, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/use-form-draft";

interface Props {
  savedAt: number;
  onRestore: () => void;
  onIgnore: () => void;
}

export default function DraftBanner({ savedAt, onRestore, onIgnore }: Props) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
      role="alert"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-900">
          Modifications non enregistrées retrouvées
        </p>
        <p className="text-xs text-amber-800 mt-0.5">
          Vous aviez commencé à modifier cette fiche {formatRelativeTime(savedAt)} sans sauvegarder. Vous pouvez reprendre où vous en étiez ou repartir de la version actuelle.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onIgnore}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-amber-900 hover:bg-amber-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Repartir à zéro
        </button>
        <button
          type="button"
          onClick={onRestore}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Reprendre mes modifications
        </button>
      </div>
    </div>
  );
}
