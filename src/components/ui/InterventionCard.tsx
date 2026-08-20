import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Intervention } from "@/types/intervention";
import { frenchTypography } from "@/lib/text";

interface Props {
  intervention: Intervention;
  index?: number;
  href?: string;
  actionLabel?: string;
}

/**
 * Carte de fiche — utilisée par le tableau de bord admin. Le site public
 * rend une liste à filets à la place (voir app/(public)/page.tsx) : une
 * grille de cartes se lit comme un tableau de bord, pas comme un sommaire
 * médical.
 */
export default function InterventionCard({
  intervention,
  href,
  actionLabel = "Voir la fiche",
}: Props) {
  return (
    <Link
      href={href || `/interventions/${intervention.slug}`}
      className="intervention-card flex flex-col h-full w-full p-5"
    >
      <h3 className="card-title text-lg font-bold text-foreground mb-2">
        {frenchTypography(intervention.title)}
      </h3>

      <p className="text-base text-muted flex-1 mb-4">
        {frenchTypography(intervention.subtitle)}
      </p>

      <span className="flex items-center gap-2 text-base font-semibold text-primary">
        {actionLabel}
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
