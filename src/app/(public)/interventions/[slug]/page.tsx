export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPublishedInterventionBySlug } from "@/lib/interventions";
import Accordion from "@/components/ui/Accordion";
import VideoEmbed from "@/components/ui/VideoEmbed";
import InterventionSidebarNav from "@/components/ui/InterventionSidebarNav";
import NextImage from "next/image";
import {
  List,
  Video,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  Download,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { Section } from "@/types/intervention";

interface Props {
  params: Promise<{ slug: string }>;
}

function sectionAnchor(section: Section, index: number): string {
  return `s-${index}-${section.id.slice(0, 6)}`;
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
    case "text":
      return (
        <div key={section.id} id={anchor} className="scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          <p className="text-gray-600 leading-[1.85] text-[17px]">{section.body}</p>
        </div>
      );

    case "list": {
      const items = (section.items || []).filter((i) => i.trim());
      return (
        <div key={section.id} id={anchor} className="scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          <ul className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                {section.ordered !== false ? (
                  <span
                    className="text-sm font-bold shrink-0 w-6 pt-[3px] text-right"
                    style={{ color: "#0284C7", fontFamily: "var(--font-heading)" }}
                  >
                    {i + 1}.
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[10px]" style={{ background: "#0284C7" }} />
                )}
                <span className="text-gray-600 leading-relaxed text-[17px]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    case "video":
      return (
        <div key={section.id} id={anchor} className="scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
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
        <div key={section.id} id={anchor} className="scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
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
              <p className="p-3 text-sm text-gray-500 text-center">{section.imageAlt}</p>
            )}
          </div>
        </div>
      );

    case "document":
      return section.isPublic !== false ? (
        <div key={section.id} id={anchor} className="scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          <a
            href={section.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <span className="flex-1 text-gray-800 text-sm font-medium">{section.title}</span>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
          </a>
        </div>
      ) : null;

    case "faqs": {
      const faqs = (section.faqs || []).filter((f) => f.question.trim());
      if (!faqs.length) return null;
      return (
        <div key={section.id} id={anchor} className="scroll-mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100" style={{ fontFamily: "var(--font-heading)" }}>
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

function sectionTypeIcon(type: Section["type"]) {
  switch (type) {
    case "text": return null;
    case "list": return <List className="w-3.5 h-3.5 shrink-0" />;
    case "video": return <Video className="w-3.5 h-3.5 shrink-0" />;
    case "image": return <ImageIcon className="w-3.5 h-3.5 shrink-0" />;
    case "document": return <FileText className="w-3.5 h-3.5 shrink-0" />;
    case "faqs": return <HelpCircle className="w-3.5 h-3.5 shrink-0" />;
  }
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
    <div className="light-content min-h-screen">

      {/* Top bar — sticky below global header */}
      <div className="sticky top-[60px] z-40 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Toutes les procédures
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12 items-start">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block sticky top-[112px]">
            <InterventionSidebarNav items={navItems} />
          </aside>

          {/* ── Main content ── */}
          <main className="min-w-0">
            <div className="mb-10 pb-8 border-b border-gray-100">
              <h1
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-[-0.02em] leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {intervention.title}
              </h1>
              {intervention.subtitle?.trim() && (
                <p className="text-lg text-gray-500 leading-relaxed">{intervention.subtitle}</p>
              )}
            </div>

            {/* Mobile nav */}
            {navItems.length > 0 && (
              <nav className="lg:hidden mb-8 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                  Sur cette page
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-blue-600 hover:underline"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {sectionTypeIcon(item.type)}
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="space-y-12">
              {intervention.sections.map((section, index) =>
                renderSection(section, index)
              )}
            </div>

            <div className="mt-14 p-6 rounded-2xl bg-blue-50 border border-blue-100 text-center">
              <p className="text-sm text-blue-700 leading-relaxed">
                Ces informations sont fournies à titre général. Elles ne remplacent pas
                les conseils personnalisés de votre cardiologue. En cas de question ou
                d&apos;inquiétude, contactez votre équipe médicale.
              </p>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
