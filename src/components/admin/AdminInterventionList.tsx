"use client";

import { Intervention } from "@/types/intervention";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, Pencil, ExternalLink } from "lucide-react";

interface Props {
  interventions: Intervention[];
}

export default function AdminInterventionList({ interventions }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer "${title}" ? Cette action est définitive.`)) return;

    setError("");
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/interventions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Suppression impossible.");
        return;
      }

      router.refresh();
    } catch {
      setError("Une erreur est survenue pendant la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {error && (
        <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface text-left">
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
              Titre
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden sm:table-cell">
              Statut
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide hidden md:table-cell">
              Mis à jour
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {interventions.map((intervention) => (
            <tr key={intervention.id} className="hover:bg-surface-alt/50">
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">
                  {intervention.title}
                </p>
                <p className="text-xs text-muted">{intervention.subtitle}</p>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    intervention.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {intervention.status === "published" ? "Publiée" : "Brouillon"}
                </span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-sm text-muted">
                {new Date(intervention.updatedAt).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {intervention.status === "published" && (
                    <Link
                      href={`/interventions/${intervention.slug}`}
                      target="_blank"
                      className="p-2 text-muted hover:text-primary rounded-lg hover:bg-surface-alt transition-colors"
                      title="Voir la page publique"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href={`/admin/interventions/${intervention.id}`}
                    className="p-2 text-muted hover:text-primary rounded-lg hover:bg-surface-alt transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() =>
                      handleDelete(intervention.id, intervention.title)
                    }
                    disabled={deletingId === intervention.id}
                    className="p-2 text-muted hover:text-danger rounded-lg hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {interventions.length === 0 && (
        <div className="p-8 text-center text-muted">
          Aucune intervention pour le moment. Créez la première fiche.
        </div>
      )}
    </div>
  );
}
