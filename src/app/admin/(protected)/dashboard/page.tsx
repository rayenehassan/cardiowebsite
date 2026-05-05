export const dynamic = "force-dynamic";

import { getAllInterventions } from "@/lib/interventions";
import { FileText, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const interventions = await getAllInterventions();
  const published = interventions.filter((i) => i.status === "published");
  const drafts = interventions.filter((i) => i.status === "draft");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Tableau de bord
      </h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted">Total des interventions</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {interventions.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-success" />
            <span className="text-sm text-muted">Publiées</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {published.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-2">
            <EyeOff className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-muted">Brouillons</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {drafts.length}
          </p>
        </div>
      </div>

      {/* Interventions récentes */}
      <div className="bg-white rounded-xl border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">
            Interventions récentes
          </h2>
          <Link
            href="/admin/interventions"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Tout voir
          </Link>
        </div>
        <div className="divide-y divide-border">
          {interventions.length > 0 ? (
            interventions.slice(0, 5).map((intervention) => (
              <div
                key={intervention.id}
                className="p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {intervention.title}
                  </p>
                  <p className="text-sm text-muted">{intervention.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      intervention.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {intervention.status === "published"
                      ? "Publiée"
                      : "Brouillon"}
                  </span>
                  <Link
                    href={`/admin/interventions/${intervention.id}`}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-sm text-muted">
              Aucune intervention enregistrée dans Supabase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
