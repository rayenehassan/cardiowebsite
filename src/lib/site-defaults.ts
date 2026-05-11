import { SiteContent } from "@/types/site";

/**
 * Valeurs par défaut du contenu public.
 * Servent de fallback si la ligne Supabase `site_content` est absente ou
 * incomplète, et de référence pour le bouton "Restaurer les valeurs par défaut"
 * dans l'admin.
 */
export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    name: "Ramsay Santé",
    subtitle: "Hôpital privé de la Loire",
  },
  hero: {
    locationLabel: "Hôpital Privé de la Loire, Saint-Étienne",
    titleBefore: "Comprendre votre",
    titleHighlight: "intervention cardiaque",
    subtitle:
      "Votre cardiologue vous a proposé un geste interventionnel. Trouvez ici toutes les informations pour vous préparer sereinement.",
    ctaLabel: "Voir les interventions",
  },
  interventionsSection: {
    kicker: "Votre intervention",
    title: "Quelle est votre intervention ?",
    subtitle: "Trouvez la fiche correspondant à l'intervention que vous allez avoir.",
    badges: [
      {
        icon: "heart",
        label: "Fiches rédigées par des spécialistes en cardiologie interventionnelle.",
      },
      {
        icon: "lock",
        label: "Ni compte, ni cookie, ni tracking — visite strictement anonyme.",
      },
    ],
  },
  teamSection: {
    kicker: "Votre équipe médicale",
    title: "Vos cardiologues",
    subtitle:
      "Des spécialistes en cardiologie interventionnelle à votre écoute à l'Hôpital privé de la Loire.",
  },
  importantInfo: {
    title: "Information importante",
    body:
      "Ce site fournit des informations générales sur les procédures de cardiologie interventionnelle. Il ne remplace pas les explications personnalisées de votre cardiologue. Pour toute question concernant votre situation, contactez directement votre équipe médicale. En cas d'urgence, composez le 15.",
  },
  footer: {
    description:
      "Plateforme d'information sur les procédures pratiquées par l'équipe de cardiologie interventionnelle de l'Hôpital Privé de la Loire.",
    contact: {
      lines: ["Hôpital Privé de la Loire", "Saint-Étienne, France"],
      phoneLabel: "Tél. : 04 78 22 91 12",
      phoneHref: "tel:0478229112",
    },
    bottomNote:
      "Ce site ne collecte aucune donnée, n'utilise pas de cookies et ne suit pas les visiteurs.",
  },
};

/**
 * Fusionne un contenu partiel (potentiellement issu d'une ligne Supabase) avec
 * les valeurs par défaut, garantissant que chaque champ requis est présent.
 */
export function mergeSiteContent(partial: unknown): SiteContent {
  const defaults = DEFAULT_SITE_CONTENT;
  if (!partial || typeof partial !== "object") return defaults;
  const p = partial as Partial<SiteContent>;

  return {
    brand: { ...defaults.brand, ...(p.brand ?? {}) },
    hero: { ...defaults.hero, ...(p.hero ?? {}) },
    interventionsSection: {
      ...defaults.interventionsSection,
      ...(p.interventionsSection ?? {}),
      badges:
        p.interventionsSection?.badges ?? defaults.interventionsSection.badges,
    },
    teamSection: { ...defaults.teamSection, ...(p.teamSection ?? {}) },
    importantInfo: { ...defaults.importantInfo, ...(p.importantInfo ?? {}) },
    footer: {
      ...defaults.footer,
      ...(p.footer ?? {}),
      contact: {
        ...defaults.footer.contact,
        ...(p.footer?.contact ?? {}),
        lines: p.footer?.contact?.lines ?? defaults.footer.contact.lines,
      },
    },
  };
}
