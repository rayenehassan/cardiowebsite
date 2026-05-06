export const dynamic = "force-dynamic";

import { getAllInterventions, getArchivedInterventions } from "@/lib/interventions";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import AdminInterventionList from "@/components/admin/AdminInterventionList";

export default async function AdminInterventionsPage() {
  const [interventions, archived] = await Promise.all([
    getAllInterventions(),
    getArchivedInterventions(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>Interventions</h1>
        <Link
          href="/admin/interventions/new"
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-85"
          style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
        >
          <PlusCircle className="w-4 h-4" />
          Nouvelle intervention
        </Link>
      </div>

      <AdminInterventionList interventions={interventions} archived={archived} />
    </div>
  );
}
