export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicSiteContent } from "@/lib/site-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent();
  return {
    title: `${content.legalNotice.title} - ${content.brand.name}`,
    description: "Mentions légales du site CardioInfo.",
  };
}

export default async function MentionsLegalesPage() {
  const content = await getPublicSiteContent();
  const { legalNotice } = content;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base text-muted hover:text-foreground transition-colors mb-8 py-2"
          style={{ fontFamily: "var(--font-heading)", minHeight: "44px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <h1
          className="text-3xl sm:text-4xl font-bold text-foreground mb-8 tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {legalNotice.title}
        </h1>

        <div
          className="text-base leading-relaxed whitespace-pre-line"
          style={{ color: "#334155" }}
        >
          {legalNotice.body}
        </div>
      </div>
    </div>
  );
}
