// Utilitaire de slugification partagé (réutilisé par l'admin pour produits,
// catégories, marques). Les repositories reçoivent le slug déjà calculé et
// garantissent seulement son unicité.

/**
 * Transforme un texte en slug URL-safe : minuscules, accents retirés,
 * caractères non alphanumériques remplacés par des tirets.
 *
 * @example slugify("Crème Hydratante 50ml") // "creme-hydratante-50ml"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les diacritiques combinants
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanum → tiret
    .replace(/^-+|-+$/g, ""); // tirets de bord
}
