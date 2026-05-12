export const dynamic = "force-dynamic";

import { Users, ArrowRight, Phone, Mail, BookOpen, MapPin, Heart, Lock, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import InterventionCard from "@/components/ui/InterventionCard";
import InterventionSearch from "@/components/ui/InterventionSearch";
import AnimateIn from "@/components/ui/AnimateIn";
import { getPublishedInterventions } from "@/lib/interventions";
import { getPublicSiteContent } from "@/lib/site-content";
import { getPublicDoctors } from "@/lib/doctors";
import { BadgeIcon } from "@/types/site";

const BADGE_ICONS: Record<BadgeIcon, React.ElementType> = {
  heart: Heart,
  lock: Lock,
  shield: Shield,
  book: BookOpen,
  users: Users,
};

export default async function HomePage() {
  const [interventions, content, doctors] = await Promise.all([
    getPublishedInterventions(),
    getPublicSiteContent(),
    getPublicDoctors(),
  ]);

  const { hero, interventionsSection, teamSection, importantInfo } = content;

  return (
    <>
      {/* ── Hero ── */}
      <section id="accueil" className="relative min-h-[85svh] sm:min-h-screen flex items-center mesh-bg overflow-hidden">
        <div className="relative w-full max-w-[1440px] mx-auto px-5 sm:px-8 py-14 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,700px)_460px] gap-10 lg:gap-16 lg:justify-center items-center">

            {/* ── Colonne gauche : texte ── */}
            <div>
              <div className="anim-fade-up mb-5 sm:mb-6">
                <span className="section-label">
                  <MapPin className="w-3.5 h-3.5" />
                  {hero.locationLabel}
                </span>
              </div>
              <h1
                className="anim-fade-up delay-100 text-[2.2rem] sm:text-5xl lg:text-[60px] font-bold leading-[1.1] sm:leading-[1.05] tracking-[-0.02em] mb-5 text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {hero.titleBefore}{" "}
                <span style={{
                  background: "linear-gradient(90deg, #FB7185 0%, #E11D48 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>{hero.titleHighlight}</span>
              </h1>

              <p className="anim-fade-up delay-200 text-lg sm:text-xl text-muted leading-relaxed mb-8 max-w-lg">
                {hero.subtitle}
              </p>

              <div className="anim-fade-up delay-300 flex flex-wrap items-center gap-4">
                <Link href="/#interventions" className="btn-primary glow-btn">
                  {hero.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* ── Recherche mobile ── */}
              <div className="lg:hidden mt-8 anim-fade-up delay-400">
                <InterventionSearch interventions={interventions} />
              </div>
            </div>

            {/* ── Colonne droite : recherche desktop ── */}
            <div className="anim-fade-up delay-400 hidden lg:block">
              <InterventionSearch interventions={interventions} />
            </div>

          </div>
        </div>
      </section>

      {/* ── Interventions ── */}
      <section
        className="py-14 sm:py-24 lg:py-32"
        style={{
          background: "linear-gradient(to bottom, transparent 75%, #ffffff 100%), #F8FAFF",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div id="interventions" className="scroll-mt-24" aria-hidden="true" />
          <AnimateIn className="mb-8 sm:mb-14">
            <span className="section-label mb-4 sm:mb-5 inline-flex">
              <BookOpen className="w-3.5 h-3.5" />
              {interventionsSection.kicker}
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] mb-3 sm:mb-4 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {interventionsSection.title}
            </h2>
            <p className="text-muted text-lg sm:text-xl mt-4">
              {interventionsSection.subtitle}
            </p>
            {interventionsSection.badges.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                {interventionsSection.badges.map((badge, i) => {
                  const Icon = BADGE_ICONS[badge.icon] ?? Heart;
                  return (
                    <span
                      key={i}
                      className="flex items-center gap-2 text-base text-muted"
                    >
                      <Icon className="w-4 h-4 shrink-0" style={{ color: badge.icon === "heart" ? "#F43F5E" : "#0369A1" }} />
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            )}
          </AnimateIn>

          {interventions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {interventions.map((intervention, i) => (
                <AnimateIn key={intervention.id} delay={i * 75} className="h-full">
                  <InterventionCard intervention={intervention} index={i} />
                </AnimateIn>
              ))}
            </div>
          ) : (
            <AnimateIn>
              <div
                className="rounded-2xl p-12 text-center border"
                style={{ background: "#F8FAFF", borderColor: "rgba(2,132,199,0.1)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(2,132,199,0.08)", border: "1px solid rgba(2,132,199,0.15)" }}
                >
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3
                  className="text-lg font-semibold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Aucune fiche publiée pour le moment
                </h3>
                <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Les fiches apparaîtront ici automatiquement dès qu&apos;une intervention sera publiée.
                </p>
              </div>
            </AnimateIn>
          )}
        </div>
      </section>

      {/* ── Équipe ── */}
      <section className="py-14 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div id="equipe" className="scroll-mt-24" aria-hidden="true" />
          <AnimateIn className="mb-8 sm:mb-14">
            <span className="section-label mb-4 sm:mb-5 inline-flex">
              <Users className="w-3.5 h-3.5" />
              {teamSection.kicker}
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] mb-3 sm:mb-4 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {teamSection.title}
            </h2>
            <p className="text-muted text-lg sm:text-xl max-w-lg">
              {teamSection.subtitle}
            </p>
          </AnimateIn>

          {doctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {doctors.map((doctor, i) => (
                <AnimateIn key={doctor.id} delay={i * 100}>
                  <div
                    className="rounded-2xl overflow-hidden border bg-white transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)] h-full flex flex-col"
                    style={{ borderColor: "rgba(15,23,42,0.08)" }}
                  >
                    <div className="relative h-56 sm:h-72 w-full bg-surface flex items-center justify-center">
                      {doctor.photoUrl ? (
                        <Image
                          src={doctor.photoUrl}
                          alt={doctor.name}
                          fill
                          quality={85}
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                          style={{ objectPosition: "50% 25%" }}
                        />
                      ) : (
                        <UserRound className="w-16 h-16 text-muted" aria-hidden="true" />
                      )}
                    </div>
                    <div className="p-5 sm:p-6 flex-1">
                      <h3
                        className="font-semibold text-xl text-foreground mb-1"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {doctor.name}
                      </h3>
                      <p className="text-base text-muted mb-4">{doctor.subtitle}</p>
                      <div className="space-y-1">
                        {doctor.phone && (
                          <a
                            href={`tel:${doctor.phone.replace(/\s/g, "")}`}
                            className="flex items-center gap-2.5 text-base text-foreground hover:text-primary transition-colors py-2"
                            style={{ minHeight: "44px" }}
                          >
                            <Phone className="w-5 h-5 flex-shrink-0" style={{ color: "#0369A1" }} />
                            {doctor.phone}
                          </a>
                        )}
                        {doctor.email && (
                          <a
                            href={`mailto:${doctor.email}`}
                            className="flex items-center gap-2.5 text-base text-foreground hover:text-primary transition-colors py-2 break-all"
                            style={{ minHeight: "44px" }}
                          >
                            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: "#0369A1" }} />
                            {doctor.email}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          ) : (
            <AnimateIn>
              <div
                className="rounded-2xl p-10 text-center border"
                style={{ background: "#F8FAFF", borderColor: "rgba(2,132,199,0.1)" }}
              >
                <p className="text-sm text-muted">
                  L&apos;équipe médicale sera bientôt présentée ici.
                </p>
              </div>
            </AnimateIn>
          )}
        </div>
      </section>


      {/* ── Disclaimer ── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <AnimateIn>
            <div
              className="rounded-2xl p-6 sm:p-8 text-center border"
              style={{ background: "#FFF5F7", borderColor: "rgba(244,63,94,0.12)" }}
            >
              <h2
                className="font-semibold text-lg text-foreground mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {importantInfo.title}
              </h2>
              <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: "#475569" }}>
                {importantInfo.body}
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
