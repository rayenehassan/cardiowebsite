export const dynamic = "force-dynamic";

import { getAllInterventions } from "@/lib/interventions";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import AdminInterventionList from "@/components/admin/AdminInterventionList";

export default async function AdminInterventionsPage() {
  const interventions = await getAllInterventions();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Interventions</h1>
        <Link
          href="/admin/interventions/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvelle intervention
        </Link>
      </div>

      <AdminInterventionList interventions={interventions} />
    </div>
  );
}
