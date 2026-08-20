/**
 * Normalise un texte pour une comparaison insensible à la casse ET aux accents.
 * Indispensable pour la recherche patient : un public de 60+ tape souvent sans
 * accent ("echographie", "defibrillateur", "coeur") et doit quand même trouver
 * "Échographie", "Défibrillateur", "Cœur".
 */
export function normalizeForSearch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diacritiques combinants (é → e)
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .trim();
}

/**
 * Applique les règles typographiques françaises à un texte destiné à
 * l'affichage : espace fine insécable avant les ponctuations doubles,
 * espace insécable après le deux-points ouvrant et dans les guillemets,
 * apostrophe courbe.
 *
 * Détail invisible mais très discriminant : aucun gabarit générique ne le
 * fait, et tout lecteur francophone professionnel le remarque.
 * Idempotent — réappliquer la fonction ne double pas les espaces.
 */
export function frenchTypography(input: string): string {
  return input
    .replace(/'/g, "\u2019")
    .replace(/\s*([;!?])/g, "\u202F$1")
    .replace(/\s*:/g, "\u00A0:")
    .replace(/(\d)\s*%/g, "$1\u202F%")
    .replace(/«\s*/g, "\u00AB\u00A0")
    .replace(/\s*»/g, "\u00A0\u00BB");
}
