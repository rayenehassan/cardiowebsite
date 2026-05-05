import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Intervention } from "@/types/intervention";

interface Props {
  intervention: Intervention;
  index?: number;
}

const PALETTES = [
  {
    bg: "linear-gradient(145deg, #EDF4FF 0%, #D6E8FF 100%)",
    border: "rgba(99,158,230,0.3)",
    cta: "rgba(59,130,246,0.09)",
    ctaBorder: "rgba(59,130,246,0.2)",
    ctaText: "#2563EB",
    shadow: "rgba(59,130,246,0.1)",
  },
  {
    bg: "linear-gradient(145deg, #EEF2FF 0%, #DDE5FF 100%)",
    border: "rgba(129,140,248,0.3)",
    cta: "rgba(99,102,241,0.09)",
    ctaBorder: "rgba(99,102,241,0.2)",
    ctaText: "#4F46E5",
    shadow: "rgba(99,102,241,0.1)",
  },
  {
    bg: "linear-gradient(145deg, #ECFAFB 0%, #D5F2F5 100%)",
    border: "rgba(94,205,218,0.3)",
    cta: "rgba(14,165,233,0.09)",
    ctaBorder: "rgba(14,165,233,0.2)",
    ctaText: "#0284C7",
    shadow: "rgba(14,165,233,0.1)",
  },
  {
    bg: "linear-gradient(145deg, #EDFBF4 0%, #D5F2E4 100%)",
    border: "rgba(110,200,155,0.3)",
    cta: "rgba(16,185,129,0.09)",
    ctaBorder: "rgba(16,185,129,0.2)",
    ctaText: "#059669",
    shadow: "rgba(16,185,129,0.1)",
  },
  {
    bg: "linear-gradient(145deg, #F5F0FF 0%, #EAE0FF 100%)",
    border: "rgba(167,139,250,0.3)",
    cta: "rgba(139,92,246,0.09)",
    ctaBorder: "rgba(139,92,246,0.2)",
    ctaText: "#7C3AED",
    shadow: "rgba(139,92,246,0.1)",
  },
  {
    bg: "linear-gradient(145deg, #FFF5ED 0%, #FFE8D5 100%)",
    border: "rgba(251,165,100,0.3)",
    cta: "rgba(249,115,22,0.09)",
    ctaBorder: "rgba(249,115,22,0.2)",
    ctaText: "#EA580C",
    shadow: "rgba(249,115,22,0.1)",
  },
];

export default function InterventionCard({ intervention, index = 0 }: Props) {
  const p = PALETTES[index % PALETTES.length];

  return (
    <Link
      href={`/interventions/${intervention.slug}`}
      className="intervention-card group flex flex-col rounded-2xl overflow-hidden h-full"
      style={{
        background: p.bg,
        borderColor: p.border,
        "--card-accent-border": p.border,
        "--card-accent-shadow": `0 8px 32px ${p.shadow}`,
      } as React.CSSProperties}
    >
      <div className="flex flex-col flex-1 p-7">
        {/* Titre */}
        <h3
          className="text-[19px] font-bold leading-snug mb-3"
          style={{ fontFamily: "var(--font-heading)", color: "#0F172A", letterSpacing: "-0.01em" }}
        >
          {intervention.title}
        </h3>

        {/* Sous-titre */}
        <p className="text-[15px] leading-relaxed flex-1 mb-6" style={{ color: "#475569" }}>
          {intervention.subtitle}
        </p>

        {/* CTA */}
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{
            background: p.cta,
            border: `1px solid ${p.ctaBorder}`,
          }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: p.ctaText, fontFamily: "var(--font-heading)" }}
          >
            Voir la fiche
          </span>
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            style={{ color: p.ctaText }}
          />
        </div>
      </div>
    </Link>
  );
}
