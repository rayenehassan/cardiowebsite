export const dynamic = "force-dynamic";

import { ArrowRight, Phone, Mail, UserRound, Heart, Lock, Shield, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import InterventionSearch from "@/components/ui/InterventionSearch";
import { getPublishedInterventions } from "@/lib/interventions";
import { getPublicSiteContent } from "@/lib/site-content";
import { getPublicDoctors } from "@/lib/doctors";
import { frenchTypography } from "@/lib/text";
import { BadgeIcon } from "@/types/site";

const BADGE_ICONS: Record<BadgeIcon, React.ElementType> = {
  heart: Heart,
  lock: Lock,
  shield: Shield,
  book: BookOpen,
  users: Users,
};

// Onde ECG (4 cycles P-QRS-T sur 1200 unités, ligne de base à y=42).
// Tracé à la main : signature graphique du service. Un segment le parcourt
// en boucle comme le balayage d'un moniteur — une seule encre, sans
// dégradé et sans halo flouté, contrairement à la version d'origine.
const ECG_PATH =
  "M0,36 H90 q6,-10 12,0 H130 l6,4 8,-44 8,52 6,-12 H205 q12,-16 24,0 H390 q6,-10 12,0 H430 l6,4 8,-44 8,52 6,-12 H505 q12,-16 24,0 H690 q6,-10 12,0 H730 l6,4 8,-44 8,52 6,-12 H805 q12,-16 24,0 H990 q6,-10 12,0 H1030 l6,4 8,-44 8,52 6,-12 H1105 q12,-16 24,0 H1200";

const DATE_FR = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Colonnes de la grille équipe. Le nombre de colonnes suit le nombre de
 * cardiologues pour qu'une rangée ne se termine jamais sur un emplacement
 * vide — c'est ce trou à droite qui déséquilibrait le bloc. En dessous de
 * trois, la grille est bornée pour que les portraits ne s'étirent pas.
 */
function teamGridClass(count: number): string {
  if (count <= 1) return "grid-cols-1 max-w-[420px]";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-[880px]";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}

/** Date de la fiche modifiée le plus récemment, ou null si aucune. */
function lastUpdate(dates: string[]): string | null {
  const times = dates
    .map((d) => new Date(d).getTime())
    .filter((t) => Number.isFinite(t));
  if (!times.length) return null;
  return DATE_FR.format(new Date(Math.max(...times)));
}

export default async function HomePage() {
  const [interventions, content, doctors] = await Promise.all([
    getPublishedInterventions(),
    getPublicSiteContent(),
    getPublicDoctors(),
  ]);

  const { hero, interventionsSection, teamSection, importantInfo } = content;

  // Preuve de fabrication, calculée sur les données réelles : c'est le seul
  // signal qu'un gabarit générique ne peut pas produire.
  const updated = lastUpdate(interventions.map((i) => i.updatedAt));
  const heroTitle = [hero.titleBefore, hero.titleHighlight, hero.titleAfter]
    .filter((part) => part?.trim())
    .join(" ");

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────
          Hauteur dictée par le contenu. Le patient arrive avec un mot
          précis donné par son cardiologue : il doit atteindre la
          recherche sans défiler. ── */}
      <section id="accueil" className="border-b border-border">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-10 sm:pb-14">
          <p className="text-sm text-muted-soft pb-3 mb-6 border-b border-border">
            {hero.locationLabel}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_500px] gap-10 lg:gap-16 xl:gap-24 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-5">
                {frenchTypography(heroTitle)}
              </h1>

              <p className="text-lg text-muted max-w-2xl mb-7">
                {frenchTypography(hero.subtitle)}
              </p>

              <Link href="#interventions" className="btn-primary">
                {frenchTypography(hero.ctaLabel)}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <div className="lg:hidden mt-9">
                <InterventionSearch interventions={interventions} />
              </div>

              {/* Preuve : chiffres réels, date réelle. */}
              <p className="mt-9 pt-4 border-t border-border text-sm text-muted-soft">
                {interventions.length}{" "}
                {interventions.length > 1 ? "fiches" : "fiche"} publiées
                {doctors.length > 0 && (
                  <>
                    {" · rédigées par "}
                    {doctors.length}{" "}
                    {doctors.length > 1 ? "cardiologues" : "cardiologue"} du
                    service
                  </>
                )}
                {updated && <> · dernière mise à jour le {updated}</>}
              </p>
            </div>

            <div className="hidden lg:block">
              <InterventionSearch interventions={interventions} />
            </div>
          </div>
        </div>

        {/* Signature ECG : la trace complète en rémanence, et un segment
            qui la parcourt en boucle. Les bords sont fondus pour que le
            tracé ne soit pas coupé net. */}
        <div
          className="h-10 sm:h-14 overflow-hidden"
          aria-hidden="true"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <svg
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            className="w-full h-full text-primary"
          >
            <path
              className="ecg-ghost"
              d={ECG_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeOpacity="0.28"
              vectorEffect="non-scaling-stroke"
            />
            <path
              className="ecg-run"
              d={ECG_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
            />
          </svg>
        </div>
      </section>

      {/* ── Interventions ─────────────────────────────────────────────
          Liste à filets plutôt que grille de cartes : cibles plus
          larges, lecture verticale, et une fiche médicale se lit comme
          un sommaire, pas comme un tableau de bord. ── */}
      <section id="interventions" className="scroll-mt-24 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          {interventionsSection.kicker?.trim() && (
            <p className="text-sm text-muted-soft mb-2">
              {frenchTypography(interventionsSection.kicker)}
            </p>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {frenchTypography(interventionsSection.title)}
          </h2>
          <p className="text-lg text-muted max-w-2xl">
            {frenchTypography(interventionsSection.subtitle)}
          </p>

          {interventionsSection.badges.length > 0 && (
            <ul className="mt-5 flex flex-col gap-2 max-w-2xl">
              {interventionsSection.badges.map((badge, i) => {
                const Icon = BADGE_ICONS[badge.icon] ?? Heart;
                return (
                  <li key={i} className="flex items-start gap-2.5 text-base text-muted">
                    <Icon
                      className="w-4 h-4 shrink-0 mt-1.5 text-muted-soft"
                      aria-hidden="true"
                    />
                    {frenchTypography(badge.label)}
                  </li>
                );
              })}
            </ul>
          )}

          {interventions.length > 0 ? (
            <ul className="mt-9 border-t border-border lg:grid lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
              {interventions.map((intervention) => (
                <li key={intervention.id} className="border-b border-border">
                  <Link
                    href={`/interventions/${intervention.slug}`}
                    className="group flex items-baseline gap-5 py-5 transition-colors hover:bg-surface focus-visible:bg-surface -mx-3 px-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold text-foreground group-hover:underline underline-offset-4">
                        {frenchTypography(intervention.title)}
                      </span>
                      {intervention.subtitle && (
                        <span className="block text-base text-muted mt-1">
                          {frenchTypography(intervention.subtitle)}
                        </span>
                      )}
                    </span>
                    <ArrowRight
                      className="w-5 h-5 shrink-0 self-center text-primary"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-9 py-8 border-y border-border text-base text-muted">
              Les fiches apparaîtront ici dès qu&rsquo;une intervention sera
              publiée.
            </p>
          )}
        </div>
      </section>

      {/* ── Environnement ─────────────────────────────────────────── */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 items-start">
            <figure className="m-0">
              <div className="relative aspect-[4/3] overflow-hidden border border-border">
                <Image
                  src="/cath-lab.jpeg"
                  alt="La salle de cathétérisme du service de cardiologie interventionnelle"
                  fill
                  quality={85}
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2.5 text-sm text-muted-soft">
                La salle de cathétérisme du service.
              </figcaption>
            </figure>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Le lieu de votre intervention
              </h2>
              <p className="text-lg text-muted mb-4">
                Cette photo est celle de la salle où se déroulera votre
                intervention. Ce n&rsquo;est pas une image d&rsquo;illustration.
              </p>
              <p className="text-lg text-muted">
                Ce qui s&rsquo;y passe, minute par minute, est décrit dans la
                fiche de votre intervention : la préparation, la durée, ce que
                vous ressentirez, et quand vous rentrez chez vous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Équipe ───────────────────────────────────────────────────
          Les portraits sont de vraies photos des cardiologues du
          service : on leur donne de la place et des angles droits. ── */}
      <section id="equipe" className="scroll-mt-24 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          {teamSection.kicker?.trim() && (
            <p className="text-sm text-muted-soft mb-2">
              {frenchTypography(teamSection.kicker)}
            </p>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {frenchTypography(teamSection.title)}
          </h2>
          <p className="text-lg text-muted max-w-2xl">
            {frenchTypography(teamSection.subtitle)}
          </p>

          {doctors.length > 0 ? (
            <div className={`mt-9 grid gap-8 xl:gap-10 ${teamGridClass(doctors.length)}`}>
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex flex-col">
                  <div className="relative w-full h-72 sm:h-80 lg:h-[360px] bg-surface border border-border flex items-center justify-center">
                    {doctor.photoUrl ? (
                      <Image
                        src={doctor.photoUrl}
                        alt={doctor.name}
                        fill
                        quality={85}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                        className="object-cover"
                        style={{ objectPosition: "50% 25%" }}
                      />
                    ) : (
                      <UserRound
                        className="w-14 h-14 text-muted-soft"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-foreground">
                    {doctor.name}
                  </h3>
                  <p className="text-base text-muted mt-0.5">
                    {frenchTypography(doctor.subtitle)}
                  </p>

                  <div className="mt-3 flex flex-col">
                    {doctor.phone && (
                      <a
                        href={`tel:${doctor.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-2.5 text-base text-primary hover:underline underline-offset-4 py-2 min-h-11"
                      >
                        <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {doctor.phone}
                      </a>
                    )}
                    {doctor.email && (
                      <a
                        href={`mailto:${doctor.email}`}
                        className="flex items-center gap-2.5 text-base text-primary hover:underline underline-offset-4 py-2 min-h-11 break-all"
                      >
                        <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {doctor.email}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-9 py-8 border-y border-border text-base text-muted">
              L&rsquo;équipe médicale sera bientôt présentée ici.
            </p>
          )}
        </div>
      </section>

      {/* ── Information importante ── */}
      <section>
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="max-w-2xl border-l-2 border-warn pl-5">
            <h2 className="text-lg font-bold text-foreground mb-2">
              {frenchTypography(importantInfo.title)}
            </h2>
            <p className="text-base text-muted whitespace-pre-line">
              {frenchTypography(importantInfo.body)}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
