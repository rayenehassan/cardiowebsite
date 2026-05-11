export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getDoctorById } from "@/lib/doctors";
import DoctorForm from "@/components/admin/DoctorForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDoctorPage({ params }: Props) {
  const { id } = await params;
  const doctor = await getDoctorById(id);

  if (!doctor) notFound();

  return (
    <div>
      <h1
        className="text-2xl font-bold text-foreground mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Modifier : {doctor.name}
      </h1>
      <DoctorForm doctor={doctor} mode="edit" />
    </div>
  );
}
