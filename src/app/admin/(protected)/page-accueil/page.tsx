export const dynamic = "force-dynamic";

import { getAdminSiteContent } from "@/lib/site-content";
import SiteContentForm from "@/components/admin/SiteContentForm";

export default async function AdminSiteContentPage() {
  const content = await getAdminSiteContent();

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Page d&apos;accueil
        </h1>
        <p className="text-muted text-sm mt-1 max-w-2xl">
          Modifiez les titres, sous-titres, badges et pied de page du site
          public. Chaque section peut être restaurée à ses valeurs par défaut.
        </p>
      </div>
      <SiteContentForm initial={content} />
    </div>
  );
}
