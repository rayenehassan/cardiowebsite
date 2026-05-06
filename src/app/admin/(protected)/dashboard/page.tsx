export const dynamic = "force-dynamic";

import { getAllInterventions } from "@/lib/interventions";
import InterventionCard from "@/components/ui/InterventionCard";
import { Eye, EyeOff, FileText, PlusCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const interventions = await getAllInterventions();
  const published = interventions.filter((i) => i.status === "published");
  const drafts = interventions.filter((i) => i.status === "draft");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
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

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Vos interventions
            </h2>
            <p className="text-muted text-base mt-2 max-w-xl">
              Retrouvez les fiches comme elles sont présentées aux patients, puis ouvrez-les pour les modifier.
            </p>
          </div>
          <Link
            href="/admin/interventions/new"
            className="inline-flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-85 shrink-0"
            style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
          >
            <PlusCircle className="w-4 h-4" />
            Ajouter une intervention
          </Link>
        </div>

        {interventions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {interventions.map((intervention, i) => (
              <InterventionCard
                key={intervention.id}
                intervention={intervention}
                index={i}
                href={`/admin/interventions/${intervention.id}`}
                actionLabel="Modifier la fiche"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-10 text-center border bg-white border-border">
            <PlusCircle className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Aucune intervention enregistrée
            </h3>
            <p className="text-sm text-muted mb-5">
              Créez la première fiche patient depuis le tableau de bord.
            </p>
            <Link
              href="/admin/interventions/new"
              className="inline-flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-85"
              style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
            >
              <PlusCircle className="w-4 h-4" />
              Ajouter une intervention
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
