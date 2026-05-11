export const dynamic = "force-dynamic";

import DoctorForm from "@/components/admin/DoctorForm";

export default function NewDoctorPage() {
  return (
    <div>
      <h1
        className="text-2xl font-bold text-foreground mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Nouveau cardiologue
      </h1>
      <DoctorForm mode="create" />
    </div>
  );
}
