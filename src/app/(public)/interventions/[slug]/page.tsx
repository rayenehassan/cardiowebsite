export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPublishedInterventionBySlug } from "@/lib/interventions";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import VideoEmbed from "@/components/ui/VideoEmbed";
import NextImage from "next/image";
import {
  Type,
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

function sectionIcon(type: Section["type"]) {
  switch (type) {
    case "text": return Type;
    case "list": return List;
    case "video": return Video;
    case "image": return ImageIcon;
    case "document": return FileText;
    case "faqs": return HelpCircle;
  }
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

function renderPublicSection(
  section: Section,
  index: number
): React.ReactNode {
  if (!sectionHasContent(section)) return null;
  const anchor = sectionAnchor(section, index);
  const icon = sectionIcon(section.type);

  switch (section.type) {
    case "text":
      return (
        <section key={section.id}>
          <SectionHeading icon={icon} title={section.title} id={anchor} />
          <p className="text-muted leading-relaxed">{section.body}</p>
        </section>
      );

    case "list": {
      const items = (section.items || []).filter((i) => i.trim());
      const Tag = section.ordered !== false ? "ol" : "ul";
      return (
        <section key={section.id}>
          <SectionHeading icon={icon} title={section.title} id={anchor} />
          <Tag className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                {section.ordered !== false ? (
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                ) : (
                  <span className="text-primary mt-1.5 shrink-0">&#9679;</span>
                )}
                <span className="text-muted leading-relaxed">{item}</span>
              </li>
            ))}
          </Tag>
        </section>
      );
    }

    case "video":
      return (
        <section key={section.id}>
          <SectionHeading icon={icon} title={section.title} id={anchor} />
          <VideoEmbed
            video={{
              id: section.id,
              title: section.title,
              url: section.videoUrl!,
              type: section.videoType || "youtube",
            }}
          />
        </section>
      );

    case "image":
      return (
        <section key={section.id}>
          <SectionHeading icon={icon} title={section.title} id={anchor} />
          <div className="rounded-lg border border-border overflow-hidden bg-surface">
            <div className="relative aspect-video bg-surface-alt">
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
              <p className="p-3 text-sm text-muted">{section.imageAlt}</p>
            )}
          </div>
        </section>
      );

    case "document":
      return section.isPublic !== false ? (
        <section key={section.id}>
          <SectionHeading icon={icon} title={section.title} id={anchor} />
          <a
            href={section.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-surface-alt transition-colors group"
          >
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <span className="flex-1 text-foreground text-sm font-medium">
              {section.title}
            </span>
            <Download className="w-4 h-4 text-muted group-hover:text-primary transition-colors shrink-0" />
          </a>
        </section>
      ) : null;

    case "faqs": {
      const faqs = (section.faqs || []).filter((f) => f.question.trim());
      if (!faqs.length) return null;
      return (
        <section key={section.id}>
          <SectionHeading icon={icon} title={section.title} id={anchor} />
          <Accordion items={faqs} />
        </section>
      );
    }

    default:
      return null;
  }
}

function buildNavItems(
  sections: Section[]
): Array<{ id: string; label: string }> {
  return sections
    .map((section, index) => {
      if (!sectionHasContent(section)) return null;
      // Documents with isPublic === false are hidden
      if (section.type === "document" && section.isPublic === false) return null;
      return { id: sectionAnchor(section, index), label: section.title };
    })
    .filter((item): item is { id: string; label: string } => item !== null);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-primary hover:text-primary-dark text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à toutes les procédures
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {intervention.title}
        </h1>
        {intervention.subtitle?.trim() && (
          <p className="text-lg text-muted">{intervention.subtitle}</p>
        )}
      </div>

      {navItems.length > 0 && (
        <nav className="bg-surface rounded-xl p-5 mb-10 border border-border">
          <h2 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">
            Sur cette page
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-primary hover:text-primary-dark transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="space-y-12">
        {intervention.sections.map((section, index) =>
          renderPublicSection(section, index)
        )}
      </div>

      <div className="mt-12 bg-surface rounded-xl p-6 border border-border text-center">
        <p className="text-muted text-sm leading-relaxed">
          Ces informations sont fournies à titre général. Elles ne remplacent
          pas les conseils personnalisés de votre cardiologue. En cas de
          question ou d&apos;inquiétude, contactez votre équipe médicale.
        </p>
      </div>
    </div>
  );
}
