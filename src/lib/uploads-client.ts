import type { Section } from "@/types/intervention";

/**
 * Gestion du nettoyage des médias Supabase Storage côté admin.
 *
 * Principe : on ne supprime JAMAIS un fichier au moment où l'utilisateur
 * "remplace" ou "retire" un média dans le formulaire — sinon, s'il quitte sans
 * enregistrer, la fiche publiée (toujours en base) pointerait vers un fichier
 * supprimé → image cassée pour les patients. La suppression est différée :
 *  - après un ENREGISTREMENT réussi : on supprime les fichiers qui ne sont plus
 *    référencés (anciens fichiers remplacés + uploads de session inutilisés) ;
 *  - à l'ABANDON du formulaire : on supprime uniquement les uploads de session
 *    (jamais commités), pas les fichiers d'origine encore référencés en base.
 */

const MANAGED_PREFIX = "/storage/v1/object/public/intervention-media/";

/** Vrai uniquement pour une URL de notre bucket (jamais YouTube/Vimeo/externe). */
export function isManagedUpload(url: string | undefined | null): url is string {
  return typeof url === "string" && url.includes(MANAGED_PREFIX);
}

/** Supprime un fichier du bucket (best-effort, ne lève jamais). */
export async function deleteUpload(url: string): Promise<void> {
  if (!isManagedUpload(url)) return;
  try {
    await fetch("/api/admin/uploads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* best-effort : un orphelin résiduel vaut mieux qu'un fichier référencé perdu */
  }
}

/** Toutes les URLs de médias gérés référencées par les sections d'une fiche. */
export function collectSectionMedia(sections: Section[]): Set<string> {
  const urls = new Set<string>();
  for (const s of sections) {
    if (isManagedUpload(s.imageUrl)) urls.add(s.imageUrl);
    if (isManagedUpload(s.documentUrl)) urls.add(s.documentUrl);
    if (s.videoType === "file" && isManagedUpload(s.videoUrl)) urls.add(s.videoUrl);
  }
  return urls;
}

/** URLs gérées présentes dans `candidates` mais absentes de `used`. */
export function orphanedUploads(
  candidates: Iterable<string>,
  used: Set<string>
): string[] {
  const out: string[] = [];
  for (const u of candidates) {
    if (isManagedUpload(u) && !used.has(u)) out.push(u);
  }
  return out;
}
