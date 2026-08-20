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
  const body = legalNotice.body || "";
  const isHtml = body.trimStart().startsWith("<");

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 min-h-11 text-base text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <h1
          className="text-3xl font-bold text-foreground mb-8"
        >
          {legalNotice.title}
        </h1>

        {isHtml ? (
          <div
            className="rich-text text-base text-muted"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <div
            className="text-base text-muted whitespace-pre-line"
          >
            {body}
          </div>
        )}
      </div>
    </div>
  );
}
