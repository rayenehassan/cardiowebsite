import { SiteContent } from "@/types/site";

/**
 * Valeurs par défaut du contenu public.
 * Servent de fallback si la ligne Supabase `site_content` est absente ou
 * incomplète, et de référence pour le bouton "Restaurer les valeurs par défaut"
 * dans l'admin.
 *
 * Règle de rédaction (voir docs/audit-ui-design.md § La voix) : chaque phrase
 * doit contenir un fait que seul cet établissement pourrait écrire. Pas de
 * « sereinement », pas de « à votre écoute », pas de « à chaque étape ».
 */
export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    name: "Ramsay Santé",
    subtitle: "Hôpital privé de la Loire",
  },
  hero: {
    locationLabel: "Hôpital privé de la Loire, Saint-Étienne",
    titleBefore: "Comprendre votre",
    titleHighlight: "intervention cardiaque",
    titleAfter: "",
    // Conservés pour compatibilité avec les lignes Supabase existantes ;
    // le rendu public les ignore depuis la refonte (le titre est d'une
    // seule encre).
    highlightColor1: "#1B4F72",
    highlightColor2: "#1B4F72",
    highlightGradient: false,
    subtitle:
      "Cherchez le nom que votre cardiologue vous a indiqué. Chaque fiche décrit le déroulé, la préparation et les suites, dans les mots de l'équipe qui vous prendra en charge.",
    ctaLabel: "Voir toutes les fiches",
  },
  interventionsSection: {
    kicker: "Votre intervention",
    title: "Quelle est votre intervention ?",
    subtitle:
      "Cherchez le nom inscrit sur votre convocation, ou parcourez la liste ci-dessous.",
    badges: [
      {
        icon: "heart",
        label:
          "Chaque fiche est écrite et relue par les cardiologues qui réalisent le geste.",
      },
      {
        icon: "lock",
        label: "Ni compte, ni cookie, ni tracking — votre visite reste anonyme.",
      },
    ],
  },
  teamSection: {
    kicker: "Votre équipe médicale",
    title: "Vos cardiologues",
    subtitle:
      "Ce sont eux qui réalisent les interventions décrites sur ce site, et qui en ont rédigé les fiches.",
  },
  importantInfo: {
    title: "Information importante",
    body:
      "Ce site décrit les interventions de cardiologie interventionnelle en termes généraux. Il ne remplace pas les explications que votre cardiologue vous donnera pour votre situation. Pour toute question sur votre cas, appelez directement le service. En cas d'urgence, composez le 15.",
  },
  footer: {
    description:
      "Fiches d'information sur les interventions pratiquées par l'équipe de cardiologie interventionnelle de l'Hôpital privé de la Loire.",
    contact: {
      lines: ["Hôpital privé de la Loire", "Saint-Étienne, France"],
      phoneLabel: "Tél. : 04 78 22 91 12",
      phoneHref: "tel:0478229112",
    },
    bottomNote:
      "Ce site ne collecte aucune donnée, n'utilise pas de cookies et ne suit pas les visiteurs.",
  },
  legalNotice: {
    title: "Mentions légales",
    body:
      "<p><strong>Éditeur du site</strong><br>Hôpital Privé de la Loire — Ramsay Santé<br>Adresse : [à compléter]<br>Téléphone : 04 78 22 91 12<br>Email : [à compléter]</p>" +
      "<p><strong>Directeur de la publication</strong><br>[Nom et titre du responsable médical à compléter]</p>" +
      "<p><strong>Hébergement</strong><br>Vercel Inc.<br>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br>https://vercel.com</p>" +
      "<p><strong>Base de données et stockage</strong><br>Supabase Inc.<br>970 Toa Payoh North #07-04, Singapore 318992<br>https://supabase.com</p>" +
      "<p><strong>Propriété intellectuelle</strong><br>L'ensemble des contenus présents sur ce site (textes, images, vidéos, documents) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>" +
      "<p><strong>Données personnelles</strong><br>Ce site ne collecte aucune donnée personnelle des visiteurs. Aucun cookie de traçage, aucune analyse de fréquentation, aucun fingerprinting n'est mis en œuvre. Les informations affichées sont identiques pour tous les visiteurs.</p>" +
      "<p><strong>Responsabilité</strong><br>Les informations diffusées sur ce site sont fournies à titre indicatif et ne se substituent pas à une consultation médicale. En cas d'urgence, composez le 15.</p>" +
      "<p><strong>Droit applicable</strong><br>Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>",
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
    legalNotice: { ...defaults.legalNotice, ...(p.legalNotice ?? {}) },
  };
}
