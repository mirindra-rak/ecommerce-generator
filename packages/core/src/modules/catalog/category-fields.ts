import { z } from "zod";
import { InvalidCategoryFieldError } from "./catalog-errors";

// Caractères interdits (alignés sur PrestaShop) sur les champs courts (nom + SEO).
// Les champs riches (description, infos complémentaires…) en sont EXEMPTÉS (HTML possible).
const FORBIDDEN = /[<>;=#{}]/;

/** Champ texte court sans caractères interdits — réutilisable (Zod). */
export const safeTextField = z
  .string()
  .refine((value) => !FORBIDDEN.test(value), { message: "Caractères interdits : <>;=#{}" });

export interface CategoryTextFields {
  name?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
}

/** Valide les champs catégorie soumis à la règle « caractères interdits ». */
export function validateCategoryFields(fields: CategoryTextFields): void {
  const single: Array<[string, string | null | undefined]> = [
    ["name", fields.name],
    ["metaTitle", fields.metaTitle],
    ["metaDescription", fields.metaDescription],
  ];
  for (const [field, value] of single) {
    if (typeof value === "string" && FORBIDDEN.test(value)) {
      throw new InvalidCategoryFieldError(field);
    }
  }
  for (const keyword of fields.metaKeywords ?? []) {
    if (FORBIDDEN.test(keyword)) throw new InvalidCategoryFieldError("metaKeywords");
  }
}
