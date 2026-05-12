export type BadgeIcon = "heart" | "lock" | "shield" | "book" | "users";

export interface SiteBadge {
  icon: BadgeIcon;
  label: string;
}

export interface SiteBrand {
  name: string;
  subtitle: string;
}

export interface SiteHero {
  locationLabel: string;
  titleBefore: string;
  titleHighlight: string;
  subtitle: string;
  ctaLabel: string;
}

export interface SiteInterventionsSection {
  kicker: string;
  title: string;
  subtitle: string;
  badges: SiteBadge[];
}

export interface SiteTeamSection {
  kicker: string;
  title: string;
  subtitle: string;
}

export interface SiteImportantInfo {
  title: string;
  body: string;
}

export interface SiteFooterContact {
  lines: string[];
  phoneLabel: string;
  phoneHref: string;
}

export interface SiteFooter {
  description: string;
  contact: SiteFooterContact;
  bottomNote: string;
}

export interface SiteLegalNotice {
  title: string;
  body: string;
}

export interface SiteContent {
  brand: SiteBrand;
  hero: SiteHero;
  interventionsSection: SiteInterventionsSection;
  teamSection: SiteTeamSection;
  importantInfo: SiteImportantInfo;
  footer: SiteFooter;
  legalNotice: SiteLegalNotice;
}
