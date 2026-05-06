export const dynamic = "force-dynamic";

import InterventionForm from "@/components/admin/InterventionForm";

export default function NewInterventionPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        Nouvelle intervention
      </h1>
      <InterventionForm mode="create" />
    </div>
  );
}
