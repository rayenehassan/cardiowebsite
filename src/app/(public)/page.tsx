export const dynamic = "force-dynamic";

import { Heart, Lock, Users, ArrowRight, Phone, Mail, BookOpen, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import InterventionCard from "@/components/ui/InterventionCard";
import InterventionSearch from "@/components/ui/InterventionSearch";
import AnimateIn from "@/components/ui/AnimateIn";
import { getPublishedInterventions } from "@/lib/interventions";

export default async function HomePage() {
  const interventions = await getPublishedInterventions();

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center mesh-bg overflow-hidden">
        <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,700px)_460px] gap-10 lg:gap-16 lg:justify-center items-center">

            {/* ── Colonne gauche : texte ── */}
            <div>
              <div className="anim-fade-up mb-6">
                <span className="section-label">
                  <MapPin className="w-3 h-3" />
                  Hôpital Privé de la Loire, Saint-Étienne
                </span>
              </div>
              <h1
                className="anim-fade-up delay-100 text-5xl sm:text-6xl lg:text-[64px] font-bold leading-[1.05] tracking-[-0.03em] mb-5 text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Comprendre votre{" "}
                <span className="text-gradient">intervention&nbsp;cardiaque</span>
              </h1>

              <p className="anim-fade-up delay-200 text-lg text-muted leading-relaxed mb-8 max-w-lg">
                Votre cardiologue vous a proposé un geste interventionnel. Trouvez ici
                toutes les informations pour vous préparer sereinement.
              </p>

              <div className="anim-fade-up delay-300 flex flex-wrap items-center gap-4">
                <Link href="/#interventions" className="btn-primary glow-btn">
                  Voir les interventions
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* ── Colonne droite : recherche ── */}
            <div className="anim-fade-up delay-400 hidden lg:block">
              <InterventionSearch interventions={interventions} />
            </div>

          </div>
        </div>
      </section>

      {/* ── Interventions ── */}
      <section id="interventions" className="py-24 sm:py-32 scroll-mt-16" style={{ background: "#F8FAFF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateIn className="mb-14">
            <span className="section-label mb-5 inline-flex">
              <BookOpen className="w-3 h-3" />
              Votre intervention
            </span>
            <h2
              className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] mb-4 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Quelle est votre intervention ?
            </h2>
            <p className="text-muted text-lg max-w-lg">
              Trouvez la fiche correspondant à l&apos;intervention que vous allez avoir.
            </p>
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
      <section id="equipe" className="py-24 sm:py-32 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateIn className="mb-14">
            <span className="section-label mb-5 inline-flex">
              <Users className="w-3 h-3" />
              Votre équipe médicale
            </span>
            <h2
              className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] mb-4 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Vos cardiologues
            </h2>
            <p className="text-muted text-lg max-w-lg">
              Des spécialistes en cardiologie interventionnelle à votre écoute à l&apos;Hôpital privé de la Loire.
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { name: "Dr Mustapha HASSAN", photo: "/Mustapha%20Hassan.jpg", email: "moustapha@gmail.com", tel: "04 78 22 91 12" },
              { name: "Dr Antoine GERBAY",  photo: "/Antoine%20Gerbay.jpg",  email: "jeremy@gmail.com",    tel: "04 72 81 93 12" },
              { name: "Dr Jeremy TERREAUX", photo: "/Jeremy%20Terreaux.jpg", email: "antoine@gmail.com",   tel: "04 71 88 82 22" },
            ].map(({ name, photo, email, tel }, i) => (
              <AnimateIn key={name} delay={i * 100}>
                <div className="glass glass-hover rounded-2xl overflow-hidden">
                  <div className="relative h-72 w-full">
                    <Image
                      src={photo}
                      alt={name}
                      fill
                      quality={85}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                      style={{ objectPosition: "50% 25%" }}
                    />
                  </div>
                  <div className="p-6">
                    <h3
                      className="font-semibold text-lg text-foreground mb-0.5"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {name}
                    </h3>
                    <p className="text-sm text-muted mb-4">Cardiologie interventionnelle</p>
                    <div className="space-y-2">
                      <a
                        href={`tel:${tel.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        style={{ color: "rgba(15,23,42,0.6)" }}
                      >
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#0284C7" }} />
                        {tel}
                      </a>
                      <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        style={{ color: "rgba(15,23,42,0.6)" }}
                      >
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#0284C7" }} />
                        {email}
                      </a>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 sm:py-32" style={{ background: "#F8FAFF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimateIn className="mb-16">
            <span className="section-label mb-5 inline-flex">
              <ShieldCheck className="w-3 h-3" />
              Information validée médicalement
            </span>
            <h2
              className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] mb-4 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Rédigé par des cardiologues,{" "}<span className="text-gradient">pour vous</span>
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Lock,
                title: "Aucune donnée collectée",
                desc: "Ni compte, ni cookie, ni tracking. Votre visite est strictement anonyme.",
                delay: 0,
                accentBg: "rgba(2,132,199,0.07)",
                accentBorder: "rgba(2,132,199,0.15)",
                iconColor: "#0284C7",
              },
              {
                icon: Heart,
                title: "Validé par des cardiologues",
                desc: "Chaque fiche est rédigée et vérifiée par des spécialistes en cardiologie interventionnelle.",
                delay: 100,
                accentBg: "rgba(99,102,241,0.07)",
                accentBorder: "rgba(99,102,241,0.15)",
                iconColor: "#6366F1",
              },
              {
                icon: Users,
                title: "Pensé pour les patients",
                desc: "Un langage clair, accessible, pour arriver serein le jour J.",
                delay: 200,
                accentBg: "rgba(5,150,105,0.07)",
                accentBorder: "rgba(5,150,105,0.14)",
                iconColor: "#059669",
              },
            ].map(({ icon: Icon, title, desc, delay, accentBg, accentBorder, iconColor }) => (
              <AnimateIn key={title} delay={delay}>
                <div className="glass glass-hover rounded-2xl p-8 h-full">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                  </div>
                  <h3
                    className="font-semibold text-lg text-foreground mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <AnimateIn>
            <div
              className="rounded-2xl p-8 text-center border"
              style={{ background: "#F0F6FF", borderColor: "rgba(2,132,199,0.12)" }}
            >
              <h2
                className="font-semibold text-base text-foreground mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Information importante
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                Ce site fournit des informations générales sur les procédures de cardiologie
                interventionnelle. Il ne remplace pas les explications personnalisées de votre
                cardiologue. Pour toute question concernant votre situation, contactez
                directement votre équipe médicale.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
