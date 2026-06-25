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
