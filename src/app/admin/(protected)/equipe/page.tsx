export const dynamic = "force-dynamic";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getActiveDoctors, getArchivedDoctors } from "@/lib/doctors";
import DoctorList from "@/components/admin/DoctorList";

export default async function AdminDoctorsPage() {
  const [doctors, archived] = await Promise.all([
    getActiveDoctors(),
    getArchivedDoctors(),
  ]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Équipe médicale
          </h1>
          <p className="text-muted text-sm mt-1 max-w-xl">
            Ajoutez, modifiez ou réordonnez les cardiologues affichés sur la
            page d&apos;accueil.
          </p>
        </div>
        <Link
          href="/admin/equipe/nouveau"
          className="inline-flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-85 shrink-0"
          style={{ background: "#0F172A", fontFamily: "var(--font-heading)" }}
        >
          <PlusCircle className="w-4 h-4" />
          Ajouter un cardiologue
        </Link>
      </div>

      <DoctorList doctors={doctors} archived={archived} />
    </div>
  );
}
