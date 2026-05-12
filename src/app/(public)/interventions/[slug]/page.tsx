export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPublishedInterventionBySlug } from "@/lib/interventions";
import Accordion from "@/components/ui/Accordion";
import VideoEmbed from "@/components/ui/VideoEmbed";
import InterventionSidebarNav from "@/components/ui/InterventionSidebarNav";
import GlossaryText from "@/components/ui/GlossaryText";
import NextImage from "next/image";
import { Download, ArrowLeft, FileText, Clock, Syringe, BedDouble, CalendarCheck, Phone } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { Section } from "@/types/intervention";

interface Props {
  params: Promise<{ slug: string }>;
}

function sectionAnchor(section: Section, index: number): string {
  return `s-${index}-${section.id.slice(0, 6)}`;
}

function quickFactIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("durée") || l.includes("duree")) return <Clock className="w-5 h-5" style={{ color: "#0369A1" }} />;
  if (l.includes("anesth")) return <Syringe className="w-5 h-5" style={{ color: "#0369A1" }} />;
  if (l.includes("hospital")) return <BedDouble className="w-5 h-5" style={{ color: "#0369A1" }} />;
  if (l.includes("reprise") || l.includes("retour")) return <CalendarCheck className="w-5 h-5" style={{ color: "#0369A1" }} />;
  return null;
}

function sectionHasContent(section: Section): boolean {
  switch (section.type) {
    case "text": return Boolean(section.body?.trim());
    case "list": return (section.items || []).some((i) => i.trim());
    case "video": return Boolean(section.videoUrl?.trim());
    case "image": return Boolean(section.imageUrl?.trim());
    case "document": return Boolean(section.documentUrl?.trim());
    case "faqs": return (section.faqs || []).some((f) => f.question.trim());
  }
}

function renderSection(section: Section, index: number): React.ReactNode {
  if (!sectionHasContent(section)) return null;
  const anchor = sectionAnchor(section, index);

  switch (section.type) {
    case "text": {
      const isHtml = (section.body || "").trimStart().startsWith("<");
      return (
        <div key={section.id} id={anchor} className="scroll-mt-36">
          <h2
            className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {section.title}
          </h2>
          {isHtml ? (
            <div
              className="rich-text leading-[1.8] text-[18px]"
              style={{ color: "#334155" }}
              dangerouslySetInnerHTML={{ __html: section.body || "" }}
            />
          ) : (
            <p className="leading-[1.8] text-[18px]" style={{ color: "#334155" }}>
              <GlossaryText text={section.body || ""} />
            </p>
          )}
        </div>
      );
    }

    case "list": {
      const items = (section.items || []).filter((i) => i.trim());
      return (
        <div key={section.id} id={anchor} className="scroll-mt-36">
          <h2
            className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {section.title}
          </h2>
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                {section.ordered !== false ? (
                  <span
                    className="text-base font-bold shrink-0 w-7 pt-[2px] text-right"
                    style={{ color: "#0369A1", fontFamily: "var(--font-heading)" }}
                  >
                    {i + 1}.
                  </span>
                ) : (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-[12px]"
                    style={{ background: "#0369A1" }}
                  />
                )}
                {item.includes("<") ? (
                  <span
                    className="rich-text leading-relaxed text-[18px]"
                    style={{ color: "#334155" }}
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ) : (
                  <span className="leading-relaxed text-[18px]" style={{ color: "#334155" }}>
                    <GlossaryText text={item} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "video":
      return (
        <div key={section.id} id={anchor} className="scroll-mt-36">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          <VideoEmbed
            video={{
              id: section.id,
              title: section.title,
              url: section.videoUrl!,
              type: section.videoType || "youtube",
            }}
          />
        </div>
      );

    case "image":
      return (
        <div key={section.id} id={anchor} className="scroll-mt-36">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="relative aspect-video bg-gray-50">
              <NextImage
                src={section.imageUrl!}
                alt={section.imageAlt || section.title}
                fill
                sizes="(min-width: 640px) 672px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
            {section.imageAlt && (
              <p className="p-4 text-base text-center" style={{ color: "#475569" }}>
                {section.imageAlt}
              </p>
            )}
          </div>
        </div>
      );

    case "document":
      return section.isPublic !== false ? (
        <div key={section.id} id={anchor} className="scroll-mt-36">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          <a
            href={section.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 p-5 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
            style={{ minHeight: "48px" }}
          >
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" style={{ color: "#0369A1" }} />
            </div>
            <span className="flex-1 text-foreground text-base font-medium">{section.title}</span>
            <Download className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
          </a>
        </div>
      ) : null;

    case "faqs": {
      const faqs = (section.faqs || []).filter((f) => f.question.trim());
      if (!faqs.length) return null;
      return (
        <div key={section.id} id={anchor} className="scroll-mt-36">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          <Accordion items={faqs} />
        </div>
      );
    }

    default:
      return null;
  }
}

function buildNavItems(sections: Section[]): Array<{ id: string; label: string; type: Section["type"] }> {
  return sections
    .map((section, index) => {
      if (!sectionHasContent(section)) return null;
      if (section.type === "document" && section.isPublic === false) return null;
      return { id: sectionAnchor(section, index), label: section.title, type: section.type };
    })
    .filter((item): item is { id: string; label: string; type: Section["type"] } => item !== null);
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const intervention = await getPublishedInterventionBySlug(slug);
  if (!intervention) return { title: "Procédure introuvable" };
  return {
    title: `${intervention.title} - CardioInfo`,
    description: intervention.subtitle,
  };
}

export default async function InterventionPage({ params }: Props) {
  const { slug } = await params;
  const intervention = await getPublishedInterventionBySlug(slug);
  if (!intervention) notFound();

  const navItems = buildNavItems(intervention.sections);

  return (
    <div className="light-content min-h-screen smooth-scroll">

      {/* Top bar — sticky below global header */}
      <div className="sticky top-[64px] z-40 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/#interventions"
            className="inline-flex items-center gap-2 text-base text-foreground hover:text-primary transition-colors py-2"
            style={{ fontFamily: "var(--font-heading)", minHeight: "44px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Toutes les procédures
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12 items-start">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block sticky top-[144px]">
            <InterventionSidebarNav items={navItems} />
          </aside>

          {/* ── Main content ── */}
          <main className="min-w-0">
            <div className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-gray-100">
              <h1
                className="text-[28px] sm:text-4xl lg:text-[44px] font-bold text-gray-900 mb-3 tracking-[-0.02em] leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {intervention.title}
              </h1>
              {intervention.subtitle?.trim() && (
                <p className="text-lg sm:text-xl leading-relaxed" style={{ color: "#475569" }}>
                  {intervention.subtitle}
                </p>
              )}
            </div>

            {/* Quick facts strip — top-of-page reassurance */}
            {intervention.quickFacts.length > 0 && (
              <div className="mb-10 pb-10 border-b border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                  {intervention.quickFacts.map((fact, i) => {
                    const icon = quickFactIcon(fact.label);
                    return (
                      <div key={i} className="bg-white p-5 flex items-start gap-3.5">
                        {icon && (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: "rgba(2,132,199,0.08)", border: "1px solid rgba(2,132,199,0.18)" }}
                          >
                            {icon}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p
                            className="text-[13px] font-semibold tracking-wider uppercase"
                            style={{ fontFamily: "var(--font-heading)", color: "#475569" }}
                          >
                            {fact.label}
                          </p>
                          <p
                            className="text-lg font-semibold text-gray-900 mt-1"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {fact.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile nav — collapsible, collapsed by default */}
            {navItems.length > 0 && (
              <div className="lg:hidden mb-8">
                <InterventionSidebarNav items={navItems} collapsible />
              </div>
            )}

            <div className="space-y-8 sm:space-y-12">
              {intervention.sections.map((section, index) =>
                renderSection(section, index)
              )}
            </div>

            <div className="mt-14 p-6 sm:p-7 rounded-2xl border" style={{ background: "#F0F6FF", borderColor: "rgba(2,132,199,0.16)" }}>
              <p className="text-base leading-relaxed mb-4" style={{ color: "#1E3A8A" }}>
                Ces informations sont fournies à titre général. Elles ne remplacent pas
                les conseils personnalisés de votre cardiologue. En cas de question ou
                d&apos;inquiétude, contactez votre équipe médicale.
              </p>
              <a
                href="tel:15"
                className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-white border transition-colors hover:border-red-300"
                style={{ borderColor: "rgba(220,38,38,0.2)", minHeight: "48px" }}
              >
                <Phone className="w-5 h-5" style={{ color: "#B91C1C" }} />
                <span className="text-base font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                  Urgence : composez le 15
                </span>
              </a>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
