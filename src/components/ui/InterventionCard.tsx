import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Intervention } from "@/types/intervention";

interface Props {
  intervention: Intervention;
}

export default function InterventionCard({ intervention }: Props) {
  return (
    <Link
      href={`/interventions/${intervention.slug}`}
      className="group block bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary-light transition-all duration-200"
    >
      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
        {intervention.title}
      </h3>
      <p className="text-muted text-sm mb-4 leading-relaxed">
        {intervention.subtitle}
      </p>
      <div className="flex items-center text-primary text-sm font-medium">
        <span>En savoir plus</span>
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
