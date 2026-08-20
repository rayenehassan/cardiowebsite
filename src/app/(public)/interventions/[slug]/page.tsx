export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPublishedInterventionBySlug } from "@/lib/interventions";
import { getPublicDoctors } from "@/lib/doctors";
import Accordion from "@/components/ui/Accordion";
import VideoEmbed from "@/components/ui/VideoEmbed";
import InterventionSidebarNav from "@/components/ui/InterventionSidebarNav";
import GlossaryText from "@/components/ui/GlossaryText";
import PrintButton from "@/components/ui/PrintButton";
import NextImage from "next/image";
import { Download, ArrowLeft, FileText, Phone, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { Section, SubSection } from "@/types/intervention";
import { frenchTypography } from "@/lib/text";

interface Props {
  params: Promise<{ slug: string }>;
}

const DATE_FR = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

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

/**
 * Sous-section : un seul niveau de repli, sous le contenu principal.
 * Marquée par un filet vertical plutôt que par une carte colorée.
 */
function renderSubSection(sub: SubSection): React.ReactNode {
  if (!sub.title?.trim()) return null;
  const items = sub.type === "list" ? (sub.items || []).filter((i) => i.trim()) : [];
  const hasContent = sub.type === "text" ? Boolean(sub.body?.trim()) : items.length > 0;
  if (!hasContent) return null;

  return (
    <details className="group/sub mt-7 border-l-2 border-border pl-5">
      <summary className="flex items-baseline gap-2.5 cursor-pointer list-none select-none min-h-11 py-1">
        <ChevronDown
          className="print:hidden w-4 h-4 shrink-0 self-center text-primary transition-transform group-open/sub:rotate-180"
          aria-hidden="true"
        />
        <span className="text-lg font-bold text-foreground">
          {frenchTypography(sub.title)}
        </span>
      </summary>

      <div className="mt-3">
        {sub.type === "text" && sub.body && (
          <div
            className="rich-text text-base text-muted"
            dangerouslySetInnerHTML={{ __html: sub.body }}
          />
        )}
        {sub.type === "list" && (
          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-baseline gap-3 text-base text-muted">
                <span className="shrink-0 text-muted-soft tabular-nums">
                  {sub.ordered !== false ? `${i + 1}.` : "—"}
                </span>
                {item.includes("<") ? (
                  <span
                    className="rich-text"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ) : (
                  <span><GlossaryText text={item} /></span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

/**
 * Enveloppe de section — un bloc de document, pas une carte.
 * Le numéro indique la position dans le document (celle du sommaire) :
 * il permet au patient de dire « je suis au point 3 », et il s'imprime.
 */
function SectionBlock({
  id, number, title, collapsible, appendix, className, children,
}: {
  id: string; number: number; title: string;
  collapsible?: boolean; appendix?: React.ReactNode;
  className?: string; children: React.ReactNode;
}) {
  const heading = (
    <>
      <span className="shrink-0 text-base text-muted-soft tabular-nums pt-1.5 w-7">
        {number}
      </span>
      <h2 className="flex-1 text-xl sm:text-2xl font-bold text-foreground">
        {frenchTypography(title)}
      </h2>
      {collapsible && (
        <span className="print:hidden flex items-center gap-2 shrink-0 self-center text-base text-primary">
          <span className="hidden sm:inline group-open:hidden">Afficher</span>
          <span className="hidden sm:group-open:inline">Masquer</span>
          <ChevronDown
            className="w-5 h-5 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </span>
      )}
    </>
  );

  const body = <div className="mt-4 pl-0 sm:pl-7">{children}{appendix}</div>;
  const outer = `scroll-mt-32 border-t border-border pt-8 sm:pt-10${className ? ` ${className}` : ""}`;

  if (collapsible) {
    return (
      <details id={id} className={`group ${outer}`}>
        <summary className="flex items-start gap-3 cursor-pointer list-none min-h-11">
          {heading}
        </summary>
        {body}
      </details>
    );
  }

  return (
    <section id={id} className={outer}>
      <div className="flex items-start gap-3">{heading}</div>
      {body}
    </section>
  );
}

function renderSection(section: Section, index: number, number: number): React.ReactNode {
  if (!sectionHasContent(section)) return null;
  const anchor = sectionAnchor(section, index);
  const appendix = section.subsection ? renderSubSection(section.subsection) : undefined;
  const props = {
    id: anchor,
    number,
    title: section.title,
    collapsible: section.collapsible,
    appendix,
  };

  switch (section.type) {
    case "text": {
      const isHtml = (section.body || "").trimStart().startsWith("<");
      return (
        <SectionBlock key={section.id} {...props}>
          {isHtml ? (
            <div
              className="rich-text text-base text-muted max-w-prose"
              dangerouslySetInnerHTML={{ __html: section.body || "" }}
            />
          ) : (
            <p className="text-base text-muted max-w-prose">
              <GlossaryText text={section.body || ""} />
            </p>
          )}
        </SectionBlock>
      );
    }

    case "list": {
      const items = (section.items || []).filter((i) => i.trim());
      return (
        <SectionBlock key={section.id} {...props}>
          <ul className="flex flex-col gap-3 max-w-prose">
            {items.map((item, i) => (
              <li key={i} className="flex items-baseline gap-3 text-base text-muted">
                <span className="shrink-0 text-muted-soft tabular-nums">
                  {section.ordered !== false ? `${i + 1}.` : "—"}
                </span>
                {item.includes("<") ? (
                  <span
                    className="rich-text"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ) : (
                  <span><GlossaryText text={item} /></span>
                )}
              </li>
            ))}
          </ul>
        </SectionBlock>
      );
    }

    case "video":
      // Une vidéo ne s'imprime pas : la section entière est masquée sur papier.
      return (
        <SectionBlock key={section.id} {...props} className="print:hidden">
          <VideoEmbed
            video={{
              id: section.id,
              title: section.title,
              url: section.videoUrl!,
              type: section.videoType || "youtube",
            }}
          />
        </SectionBlock>
      );

    case "image":
      return (
        <SectionBlock key={section.id} {...props}>
          <figure className="m-0 max-w-2xl">
            <div className="border border-border bg-surface">
              <NextImage
                src={section.imageUrl!}
                alt={section.imageAlt || section.title}
                width={0}
                height={0}
                sizes="(min-width: 640px) 672px, 100vw"
                className="w-full h-auto block"
                unoptimized
              />
            </div>
            {section.imageAlt && (
              <figcaption className="mt-2 text-sm text-muted-soft">
                {frenchTypography(section.imageAlt)}
              </figcaption>
            )}
          </figure>
        </SectionBlock>
      );

    case "document":
      return section.isPublic !== false ? (
        <SectionBlock key={section.id} {...props}>
          <a
            href={section.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 min-h-14 border border-border px-4 py-3 text-base text-foreground transition-colors hover:border-primary hover:bg-surface"
          >
            <FileText className="w-5 h-5 shrink-0 text-muted-soft" aria-hidden="true" />
            <span className="flex-1">{frenchTypography(section.title)}</span>
            <span className="flex items-center gap-1.5 font-semibold text-primary shrink-0">
              <Download className="w-4 h-4" aria-hidden="true" />
              Télécharger
            </span>
          </a>
        </SectionBlock>
      ) : null;

    case "faqs": {
      const faqs = (section.faqs || []).filter((f) => f.question.trim());
      if (!faqs.length) return null;
      return (
        <SectionBlock key={section.id} {...props}>
          <Accordion items={faqs} />
        </SectionBlock>
      );
    }

    default:
      return null;
  }
}

function buildNavItems(
  sections: Section[]
): Array<{ id: string; label: string; number: number; type: Section["type"] }> {
  let n = 0;
  return sections
    .map((section, index) => {
      if (!sectionHasContent(section)) return null;
      if (section.type === "document" && section.isPublic === false) return null;
      n += 1;
      return {
        id: sectionAnchor(section, index),
        label: section.title,
        number: n,
        type: section.type,
      };
    })
    .filter((item): item is { id: string; label: string; number: number; type: Section["type"] } => item !== null);
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
  const [intervention, doctors] = await Promise.all([
    getPublishedInterventionBySlug(slug),
    getPublicDoctors(),
  ]);
  if (!intervention) notFound();

  const navItems = buildNavItems(intervention.sections);
  const numberOf = new Map(navItems.map((item) => [item.id, item.number]));
  const updated = Number.isFinite(new Date(intervention.updatedAt).getTime())
    ? DATE_FR.format(new Date(intervention.updatedAt))
    : null;
  const reviewers = doctors.map((d) => d.name).filter(Boolean);

  return (
    <div className="light-content min-h-screen smooth-scroll">
      {/* ── Barre de retour, collée sous l'en-tête global ── */}
      <div className="print:hidden sticky top-16 z-40 border-b border-border bg-background">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-2 flex items-center justify-between gap-3">
          <Link
            href="/#interventions"
            className="inline-flex items-center gap-2 min-h-11 text-base text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Toutes les fiches
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* ── En-tête de fiche ── */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 sm:pt-12 pb-8 sm:pb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {frenchTypography(intervention.title)}
          </h1>
          {intervention.subtitle?.trim() && (
            <p className="text-lg text-muted max-w-2xl">
              {frenchTypography(intervention.subtitle)}
            </p>
          )}

          {/* Informations clés : tableau à filets, lisible et imprimable.
              Plus de flou d'arrière-plan, plus d'icône par libellé — la
              pictogramme ne faisait que répéter le mot. */}
          {intervention.quickFacts.length > 0 && (
            <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-border">
              {intervention.quickFacts.map((fact, i) => (
                <div key={i} className="border-b border-r border-border px-4 py-3.5">
                  <dt className="text-sm text-muted-soft">
                    {frenchTypography(fact.label)}
                  </dt>
                  <dd className="text-lg font-bold text-foreground mt-0.5">
                    {frenchTypography(fact.value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* ── Sommaire + contenu ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-8 lg:gap-12 items-start">
          <aside className="hidden lg:block print:hidden sticky top-32">
            <InterventionSidebarNav items={navItems} />
          </aside>

          <main className="min-w-0">
            {navItems.length > 0 && (
              <div className="mb-8 lg:hidden print:hidden">
                <InterventionSidebarNav items={navItems} collapsible />
              </div>
            )}

            <div className="flex flex-col gap-8 sm:gap-10">
              {intervention.sections.map((section, index) => {
                const number = numberOf.get(sectionAnchor(section, index));
                if (!number) return null;
                return renderSection(section, index, number);
              })}
            </div>

            {/* ── Pied de fiche : avertissement, urgence, provenance ── */}
            <div className="mt-14 border-t border-border pt-8">
              <div className="border-l-2 border-warn pl-5 max-w-prose">
                <p className="text-base text-muted">
                  Ces informations sont générales. Elles ne remplacent pas les
                  explications que votre cardiologue vous donnera pour votre
                  situation. En cas de doute, appelez le service.
                </p>
              </div>

              <a
                href="tel:15"
                className="mt-6 inline-flex items-center gap-3 min-h-12 border border-danger px-4 py-3 text-base font-semibold text-danger transition-colors hover:bg-surface"
              >
                <Phone className="w-5 h-5 shrink-0" aria-hidden="true" />
                Urgence : composez le 15
              </a>

              {/* Provenance — la seule chose qu'un gabarit ne peut pas
                  fabriquer : une date réelle et des noms réels. */}
              <p className="mt-8 pt-4 border-t border-border text-sm text-muted-soft">
                {updated && <>Fiche mise à jour le {updated}.</>}
                {reviewers.length > 0 && (
                  <>
                    {" "}Rédigée et relue par{" "}
                    {reviewers.length > 1
                      ? `${reviewers.slice(0, -1).join(", ")} et ${reviewers[reviewers.length - 1]}`
                      : reviewers[0]}
                    , cardiologue
                    {reviewers.length > 1 ? "s" : ""} du service.
                  </>
                )}
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
