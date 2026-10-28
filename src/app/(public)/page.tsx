export const dynamic = "force-dynamic";

import { Users, ArrowRight, Phone, Mail, BookOpen, MapPin, Heart, Lock, Shield, UserRound, ClipboardList, FileText, Download, Apple, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import InterventionCard from "@/components/ui/InterventionCard";
import InterventionSearch from "@/components/ui/InterventionSearch";
import AnimateIn from "@/components/ui/AnimateIn";
import CardiacRehabSection from "@/components/ui/CardiacRehabSection";
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

const PATIENT_DOCUMENTS = [
  {
    heading: "Fiches d'information",
    items: [
      { title: "Coronarographie", file: "GACI-Info-Coronarographie.pdf" },
      { title: "Dilatation coronaire", file: "GACI-Info-Dilatation-coronaire.pdf" },
      { title: "Alcoolisation septale", file: "GACI-Info-Alcoolisation-septale.pdf" },
      { title: "Fermeture du foramen ovale perméable (FOP)", file: "FCPC-Info-Patient-FOP-2502.pdf" },
      { title: "Fermeture de la communication interauriculaire (CIA)", file: "FCPC-Info-Patient-CIA-version-2502.pdf" },
    ],
  },
  {
    heading: "Formulaires de consentement",
    items: [
      { title: "Valve aortique", file: "consentement-valve-aortique.pdf" },
      { title: "Dilatation aortique", file: "consentement-dilatation-aortique.pdf" },
      { title: "Clip mitral", file: "consentement-clip-mitral.pdf" },
    ],
  },
];

const FOOD_ESSENTIALS = [
  "Plus de légumes, de fruits, de légumineuses, de céréales complètes et de noix.",
  "Moins de viande, de charcuterie, de sel, de sucre et d'alcool.",
  "Des matières grasses de meilleure qualité : huile d'olive ou de colza plutôt que beurre et crème.",
];

const FOOD_PLATE = [
  { favor: "Légumes et fruits, frais ou surgelés nature, à chaque repas", limit: "Plats préparés, soupes et conserves salées" },
  { favor: "Céréales complètes : pain complet, riz complet, pâtes complètes, flocons d'avoine", limit: "Pain blanc, pâtisseries, viennoiseries, biscuits" },
  { favor: "Légumineuses : lentilles, pois chiches, haricots secs", limit: "Viande rouge en excès" },
  { favor: "Poisson, surtout gras : saumon, sardine, maquereau, hareng", limit: "Charcuterie : jambon, saucisson, saucisses, lardons" },
  { favor: "Noix et autres fruits à coque, non salés", limit: "Beurre, crème, fritures, fromages gras" },
  { favor: "Huile d'olive ou de colza pour cuisiner et assaisonner", limit: "Produits industriels contenant des graisses trans (huiles hydrogénées)" },
  { favor: "Eau ; café filtré (3 à 4 tasses par jour au plus)", limit: "Sodas, jus de fruits, boissons sucrées, alcool" },
];

const FOOD_BENCHMARKS = [
  { food: "Légumes", target: "Au moins 200 g par jour", practice: "2 à 3 portions" },
  { food: "Fruits", target: "Au moins 200 g par jour", practice: "2 à 3 fruits" },
  { food: "Fibres", target: "30 à 45 g par jour", practice: "Céréales complètes, légumineuses, fruits et légumes" },
  { food: "Noix", target: "30 g par jour", practice: "Une petite poignée, non salées" },
  { food: "Poisson", target: "1 à 2 fois par semaine", practice: "Au moins une fois du poisson gras" },
  { food: "Viande rouge", target: "350 à 500 g par semaine au maximum", practice: "Environ 3 à 4 portions de 120 g" },
  { food: "Charcuterie", target: "Le moins possible", practice: "Une exception, pas une habitude" },
  { food: "Sel", target: "Moins de 5 g par jour", practice: "Environ une cuillère à café rase, pain, fromage et plats préparés compris" },
  { food: "Sucres ajoutés", target: "Moins de 10 % des calories", practice: "Pas de boissons sucrées, jus de fruits compris" },
  { food: "Alcool", target: "100 g d'alcool pur par semaine au maximum", practice: "Environ 7 à 12 verres, et moins vaut mieux" },
];

const FOOD_TIPS = [
  { label: "Aux courses", text: "remplissez d'abord le panier de légumes, fruits, légumineuses, poisson et céréales complètes. Lisez les étiquettes pour le sel et le sucre." },
  { label: "Moins de sel", text: "cuisinez davantage « maison », peu d'aliments transformés, et assaisonnez avec des herbes, des épices, de l'ail ou du citron plutôt qu'avec du sel." },
  { label: "Moins de viande", text: "remplacez-la par des légumineuses, des noix ou du soja, ce qui améliore aussi le taux de mauvais cholestérol." },
  { label: "Au quotidien", text: "une poignée de noix ou un fruit comme collation, de l'eau à table, du poisson une ou deux fois par semaine." },
  { label: "Au restaurant", text: "choisissez poisson ou légumes, sauce à part, et partagez le dessert." },
];

const FOOD_GOOD_TO_KNOW = [
  { label: "Poids", text: "si vous êtes en surpoids, perdre 5 à 10 % de votre poids améliore la tension, le cholestérol et la glycémie. Gardez ensuite une alimentation saine dans la durée plutôt qu'un régime strict de courte durée." },
  { label: "Compléments", text: "les vitamines et les capsules d'huile de poisson n'ont pas montré de bénéfice pour le cœur, et la levure de riz rouge est déconseillée. Parlez-en à votre médecin avant d'en prendre." },
  { label: "Traitement", text: "l'alimentation complète vos médicaments, elle ne les remplace pas. Ne les arrêtez pas sans avis médical." },
  { label: "Cas particuliers", text: "si vous avez du diabète, une maladie des reins ou un régime spécifique, demandez à votre médecin ou à un diététicien d'adapter ces conseils." },
];

export default async function HomePage() {
  const [interventions, content, doctors] = await Promise.all([
    getPublishedInterventions(),
    getPublicSiteContent(),
    getPublicDoctors(),
  ]);

  const { hero, interventionsSection, teamSection, preparationSection, importantInfo } = content;

  return (
    <>
      {/* ── Hero ── */}
      <section id="accueil" className="relative min-h-[60svh] flex items-center mesh-bg overflow-hidden">
<div className="relative w-full max-w-[1440px] mx-auto px-5 sm:px-8 py-8 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,700px)_460px] gap-10 lg:gap-16 lg:justify-center items-center">

            {/* ── Colonne gauche : texte ── */}
            <div>
              <div className="anim-fade-up mb-5 sm:mb-6">
                <span className="section-label" title={hero.locationLabel}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="section-label-text">{hero.locationLabel}</span>
                </span>
              </div>
              <h1
                className="anim-fade-up delay-100 text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] sm:leading-[1.05] tracking-[-0.02em] mb-5 text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {hero.titleBefore}{hero.titleBefore ? " " : ""}
                <span style={{
                  background: hero.highlightGradient
                    ? `linear-gradient(90deg, ${hero.highlightColor1} 0%, ${hero.highlightColor2} 100%)`
                    : hero.highlightColor1,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>{hero.titleHighlight}</span>
                {hero.titleAfter ? " " + hero.titleAfter : ""}
              </h1>

              <p className="anim-fade-up delay-200 text-base sm:text-lg text-muted leading-relaxed mb-6 max-w-lg">
                {hero.subtitle}
              </p>

              <div className="anim-fade-up delay-300 flex flex-wrap items-center gap-4">
                <Link href="/#interventions" className="btn-primary glow-btn">
                  {hero.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* ── Recherche mobile ── */}
              <div className="lg:hidden mt-6 anim-fade-up delay-400">
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
      <section className="py-8 sm:py-12 lg:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div id="interventions" className="scroll-mt-24" aria-hidden="true" />
          <AnimateIn className="mb-5 sm:mb-8">
            <span className="section-label mb-4 sm:mb-5 inline-flex" title={interventionsSection.kicker}>
              <BookOpen className="w-3.5 h-3.5" />
              <span className="section-label-text">{interventionsSection.kicker}</span>
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-2 sm:mb-3 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {interventionsSection.title}
            </h2>
            <p className="text-muted text-base sm:text-lg mt-4 max-w-2xl">
              {interventionsSection.subtitle}
            </p>
            {interventionsSection.badges.length > 0 && (
              <div className="flex flex-col gap-2 mt-4 max-w-2xl">
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
            <details className="group rounded-2xl border bg-white" style={{ borderColor: "rgba(15,23,42,0.08)" }}>
              <summary
                className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 sm:p-5 text-base sm:text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden"
                style={{ background: "#F8FAFF", minHeight: "44px" }}
              >
                <span className="flex-1 group-open:hidden">Voir les examens</span>
                <span className="hidden flex-1 group-open:inline">Masquer les examens</span>
                <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" style={{ color: "#0369A1" }} aria-hidden="true" />
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6">
                {interventions.map((intervention, i) => (
                  <AnimateIn key={intervention.id} delay={i * 75} className="h-full">
                    <InterventionCard intervention={intervention} index={i} />
                  </AnimateIn>
                ))}
              </div>
            </details>
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

      {/* ── Préparation à l'examen ── */}
      {preparationSection.steps.length > 0 && (
      <section className="py-8 sm:py-12 lg:py-14" style={{ background: "#F8FAFF" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div id="preparation" className="scroll-mt-24" aria-hidden="true" />
          <AnimateIn className="mb-5 sm:mb-8">
            <span className="section-label mb-4 sm:mb-5 inline-flex">
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="section-label-text">{preparationSection.kicker}</span>
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-2 sm:mb-3 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {preparationSection.title}
            </h2>
          </AnimateIn>
          <details className="group rounded-2xl border bg-white" style={{ borderColor: "rgba(15,23,42,0.08)" }}>
            <summary
              className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 sm:p-5 text-base sm:text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden"
              style={{ background: "#F8FAFF", minHeight: "44px" }}
            >
              <span className="flex-1 group-open:hidden">Voir les étapes</span>
              <span className="hidden flex-1 group-open:inline">Masquer les étapes</span>
              <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" style={{ color: "#0369A1" }} aria-hidden="true" />
            </summary>
          <ol className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            {preparationSection.steps.map((step, i) => (
              <AnimateIn key={i} delay={i * 50}>
                <li
                  className="flex items-start gap-4 rounded-2xl border bg-white p-4 sm:p-5"
                  style={{ borderColor: "rgba(15,23,42,0.08)" }}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                    style={{ background: "#0369A1", fontFamily: "var(--font-heading)" }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <p className="text-base sm:text-lg leading-relaxed text-foreground pt-1">
                    {step.text}
                    {step.optional && <span className="text-muted"> (non obligatoire)</span>}
                  </p>
                </li>
              </AnimateIn>
            ))}
          </ol>
          </details>
        </div>
      </section>
      )}

      {/* ── Conseils Alimentation ── */}
      <section className="py-8 sm:py-12 lg:py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div id="alimentation" className="scroll-mt-24" aria-hidden="true" />
          <AnimateIn className="mb-5 sm:mb-8">
            <span className="section-label mb-4 sm:mb-5 inline-flex">
              <Apple className="w-3.5 h-3.5" />
              <span className="section-label-text">Fiche patient</span>
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-2 sm:mb-3 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Conseils Alimentation
            </h2>
            <p className="text-muted text-base sm:text-lg mt-4">
              Bien manger pour protéger mon cœur et mes artères
            </p>
          </AnimateIn>

          <details className="group rounded-2xl border bg-white" style={{ borderColor: "rgba(15,23,42,0.08)" }}>
            <summary
              className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 sm:p-5 text-base sm:text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden"
              style={{ background: "#F8FAFF", minHeight: "44px" }}
            >
              <span className="flex-1 group-open:hidden">Lire la fiche</span>
              <span className="hidden flex-1 group-open:inline">Masquer la fiche</span>
              <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" style={{ color: "#0369A1" }} aria-hidden="true" />
            </summary>
            <div className="space-y-10 p-4 sm:p-6">
            <AnimateIn>
              <h3 className="text-xl font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                L&apos;essentiel
              </h3>
              <p className="text-base sm:text-lg leading-relaxed text-foreground mb-4">
                Une alimentation saine est l&apos;un des piliers de la protection de vos artères, en plus de votre traitement. Le modèle recommandé est l&apos;alimentation de type méditerranéen : beaucoup de végétaux, du poisson, de l&apos;huile d&apos;olive, peu de viande et peu d&apos;aliments transformés.
              </p>
              <ul className="space-y-2 mb-4">
                {FOOD_ESSENTIALS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base sm:text-lg leading-relaxed text-foreground">
                    <Check className="w-5 h-5 mt-1 shrink-0" style={{ color: "#0369A1" }} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-base sm:text-lg leading-relaxed text-muted">
                Il ne s&apos;agit pas d&apos;un régime strict, mais d&apos;habitudes à prendre peu à peu et à garder.
              </p>
            </AnimateIn>

            <AnimateIn>
              <h3 className="text-xl font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Dans mon assiette
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border p-4 sm:p-5" style={{ background: "#F0FDF4", borderColor: "rgba(22,101,52,0.15)" }}>
                  <p className="font-bold text-foreground mb-3">Je privilégie</p>
                  <ul className="space-y-2">
                    {FOOD_PLATE.map((row) => (
                      <li key={row.favor} className="text-base leading-relaxed text-foreground">{row.favor}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border p-4 sm:p-5" style={{ background: "#FFF5F7", borderColor: "rgba(244,63,94,0.15)" }}>
                  <p className="font-bold text-foreground mb-3">Je limite ou j&apos;évite</p>
                  <ul className="space-y-2">
                    {FOOD_PLATE.map((row) => (
                      <li key={row.limit} className="text-base leading-relaxed text-foreground">{row.limit}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-sm sm:text-base text-muted mt-3">
                Le café non filtré (bouilli, « à la turque », certains expressos) élève le mauvais cholestérol.
              </p>
            </AnimateIn>

            <AnimateIn>
              <h3 className="text-xl font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Mes repères
              </h3>
              <div className="space-y-3">
                {FOOD_BENCHMARKS.map((row) => (
                  <div
                    key={row.food}
                    className="rounded-2xl border p-4 sm:p-5"
                    style={{ background: "#F8FAFF", borderColor: "rgba(15,23,42,0.08)" }}
                  >
                    <p className="text-base sm:text-lg text-foreground">
                      <span className="font-bold">{row.food}</span> : {row.target}
                    </p>
                    <p className="text-base text-muted mt-1">{row.practice}</p>
                  </div>
                ))}
              </div>
              <p className="text-base leading-relaxed text-foreground mt-3">
                Pour l&apos;alcool, aucune quantité n&apos;est bénéfique pour le cœur : les risques les plus bas s&apos;observent chez les personnes qui n&apos;en boivent pas.
              </p>
            </AnimateIn>

            <AnimateIn>
              <h3 className="text-xl font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Pour y arriver
              </h3>
              <ul className="space-y-3">
                {FOOD_TIPS.map((tip) => (
                  <li key={tip.label} className="flex items-start gap-3 text-base sm:text-lg leading-relaxed text-foreground">
                    <Check className="w-5 h-5 mt-1 shrink-0" style={{ color: "#0369A1" }} aria-hidden="true" />
                    <span><span className="font-bold">{tip.label} :</span> {tip.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-base sm:text-lg leading-relaxed text-muted mt-4">
                Changez une habitude à la fois : c&apos;est plus facile à tenir dans la durée.
              </p>
            </AnimateIn>

            <AnimateIn>
              <h3 className="text-xl font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                À savoir
              </h3>
              <ul className="space-y-3">
                {FOOD_GOOD_TO_KNOW.map((item) => (
                  <li key={item.label} className="flex items-start gap-3 text-base sm:text-lg leading-relaxed text-foreground">
                    <Check className="w-5 h-5 mt-1 shrink-0" style={{ color: "#0369A1" }} aria-hidden="true" />
                    <span><span className="font-bold">{item.label} :</span> {item.text}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted mt-6">
                Source : recommandations de la Société européenne de cardiologie 2021 sur la prévention cardiovasculaire (Eur Heart J 2021;42:3227-3337).
              </p>
            </AnimateIn>
            </div>
          </details>
        </div>
      </section>

      {/* ── Réadaptation cardiaque ── */}
      <CardiacRehabSection />

      {/* ── Documents à télécharger ── */}
      <section className="py-8 sm:py-12 lg:py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div id="documents" className="scroll-mt-24" aria-hidden="true" />
          <AnimateIn className="mb-5 sm:mb-8">
            <span className="section-label mb-4 sm:mb-5 inline-flex">
              <FileText className="w-3.5 h-3.5" />
              <span className="section-label-text">Documents à télécharger</span>
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-2 sm:mb-3 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Fiches d&apos;informations et de consentement
            </h2>
          </AnimateIn>
          <details className="group rounded-2xl border bg-white" style={{ borderColor: "rgba(15,23,42,0.08)" }}>
            <summary
              className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 sm:p-5 text-base sm:text-lg font-semibold text-foreground [&::-webkit-details-marker]:hidden"
              style={{ background: "#F8FAFF", minHeight: "44px" }}
            >
              <span className="flex-1 group-open:hidden">Voir les documents</span>
              <span className="hidden flex-1 group-open:inline">Masquer les documents</span>
              <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" style={{ color: "#0369A1" }} aria-hidden="true" />
            </summary>
          <div className="space-y-8 p-4 sm:p-6">
            {PATIENT_DOCUMENTS.map((group) => (
              <AnimateIn key={group.heading}>
                <h3
                  className="text-lg font-semibold text-foreground mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {group.heading}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((doc) => (
                    <li key={doc.file}>
                      <a
                        href={`/documents/${doc.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 rounded-2xl border p-4 sm:p-5 transition-shadow hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)]"
                        style={{ background: "#F8FAFF", borderColor: "rgba(15,23,42,0.08)", minHeight: "44px" }}
                      >
                        <FileText className="w-6 h-6 shrink-0" style={{ color: "#0369A1" }} aria-hidden="true" />
                        <span className="flex-1 text-base sm:text-lg text-foreground">{doc.title}</span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "#0369A1" }}>
                          <Download className="w-4 h-4" aria-hidden="true" />
                          PDF
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </AnimateIn>
            ))}
          </div>
          </details>
        </div>
      </section>

      {/* ── Équipe ── */}
      <section className="py-8 sm:py-12 lg:py-14" style={{ background: "#EEF4FF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div id="equipe" className="scroll-mt-24" aria-hidden="true" />
          <AnimateIn className="mb-5 sm:mb-8">
            <span className="section-label mb-4 sm:mb-5 inline-flex" title={teamSection.kicker}>
              <Users className="w-3.5 h-3.5" />
              <span className="section-label-text">{teamSection.kicker}</span>
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.03em] mb-2 sm:mb-3 text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {teamSection.title}
            </h2>
            <p className="text-muted text-base sm:text-lg max-w-lg">
              {teamSection.subtitle}
            </p>
          </AnimateIn>

          {doctors.length > 0 ? (
            <div
              className={`grid gap-5 sm:gap-8 ${
                doctors.length === 1
                  ? "grid-cols-1 max-w-md mx-auto"
                  : doctors.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
                  : doctors.length === 4
                  ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto"
              }`}
            >
              {doctors.map((doctor, i) => (
                <AnimateIn key={doctor.id} delay={i * 100}>
                  <div
                    className="rounded-2xl overflow-hidden border bg-white transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)] h-full flex flex-col"
                    style={{ borderColor: "rgba(15,23,42,0.08)" }}
                  >
                    <div className="relative h-44 sm:h-48 w-full bg-surface flex items-center justify-center">
                      {doctor.photoUrl ? (
                        <Image
                          src={doctor.photoUrl}
                          alt={doctor.name}
                          fill
                          quality={85}
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-contain"
                        />
                      ) : (
                        <UserRound className="w-16 h-16 text-muted" aria-hidden="true" />
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex-1">
                      <h3
                        className="font-semibold text-lg text-foreground mb-0.5"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-muted mb-2">{doctor.subtitle}</p>
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
      <section className="py-6 sm:py-10 bg-white">
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
