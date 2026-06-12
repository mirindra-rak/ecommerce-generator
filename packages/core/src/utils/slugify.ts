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

/**
 * Construit un slug unique à partir d'un nom : slugifie puis ajoute un suffixe
 * `-2`, `-3`… tant que le prédicat `exists` retourne vrai.
 *
 * @param exists - Prédicat d'existence (typiquement un `repository.findBySlug`).
 */
export async function buildUniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(name) || "element";
  let candidate = base;
  let suffix = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
