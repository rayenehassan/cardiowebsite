import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Intervention } from "@/types/intervention";

interface Props {
  intervention: Intervention;
  index?: number;
  href?: string;
  actionLabel?: string;
}

export default function InterventionCard({
  intervention,
  href,
  actionLabel = "Voir la fiche",
}: Props) {
  return (
    <Link
      href={href || `/interventions/${intervention.slug}`}
      className="intervention-card group flex flex-col rounded-2xl overflow-hidden h-full w-full"
      style={{
        background: "#EEF4FF",
        borderColor: "rgba(2, 132, 199, 0.22)",
        "--card-accent-border": "rgba(2, 132, 199, 0.4)",
        "--card-accent-shadow": "0 8px 28px rgba(2, 132, 199, 0.12)",
      } as React.CSSProperties}
    >
      <div className="flex flex-col flex-1 p-6 sm:p-7">
        <h3
          className="text-[20px] font-bold leading-snug mb-3 text-foreground"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.01em" }}
        >
          {intervention.title}
        </h3>

        <p
          className="text-base leading-relaxed flex-1 mb-6"
          style={{ color: "#475569" }}
        >
          {intervention.subtitle}
        </p>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-3.5"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(2, 132, 199, 0.22)",
            minHeight: "48px",
          }}
        >
          <span
            className="text-base font-semibold"
            style={{ color: "#0369A1", fontFamily: "var(--font-heading)" }}
          >
            {actionLabel}
          </span>
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            style={{ color: "#0369A1" }}
          />
        </div>
      </div>
    </Link>
  );
}
