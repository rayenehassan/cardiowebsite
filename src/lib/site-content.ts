import { cache } from "react";
import { SiteContent } from "@/types/site";
import {
  readSiteContent,
  readSiteContentAdmin,
  upsertSiteContent,
} from "@/lib/site-store";

// Dédupe les lectures au sein d'une même requête serveur (layout + page).
export const getPublicSiteContent = cache(
  async (): Promise<SiteContent> => readSiteContent()
);

export async function getAdminSiteContent(): Promise<SiteContent> {
  return readSiteContentAdmin();
}

export async function saveSiteContent(
  content: SiteContent
): Promise<SiteContent> {
  return upsertSiteContent(content);
}
