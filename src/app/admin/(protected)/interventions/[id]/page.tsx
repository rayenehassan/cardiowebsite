export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getInterventionById } from "@/lib/interventions";
import InterventionForm from "@/components/admin/InterventionForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditInterventionPage({ params }: Props) {
  const { id } = await params;
  const intervention = await getInterventionById(id);

  if (!intervention) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Modifier : {intervention.title}
      </h1>
      <InterventionForm intervention={intervention} mode="edit" />
    </div>
  );
}
