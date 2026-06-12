import { z } from "zod";
import { InvalidProductAttributesError } from "./catalog-errors";

// Attribute-sets : couture niveau 3. Le type produit est ouvert (String en base) ;
// ses attributs descriptifs (jsonb) sont validés par un schéma Zod choisi selon le type.
// Ajouter un vertical = ajouter une entrée dans REGISTRY, sans migration Prisma.

/** Types produit connus (parapharmacie). La colonne reste un String ouvert en base. */
export const PRODUCT_TYPES = ["COSMETIC", "SUPPLEMENT", "DEVICE", "OTHER"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

// Attributs descriptifs parapharmacie.
const parapharmacieAttributes = z.object({
  inci: z.string().optional(),
  precautions: z.string().optional(),
});

export type ProductAttributes = z.infer<typeof parapharmacieAttributes>;

// Schéma permissif (type inconnu) : ne casse jamais la lecture, conserve les clés.
const permissiveAttributes = z.looseObject({});

const REGISTRY: Partial<Record<string, z.ZodType>> = {
  COSMETIC: parapharmacieAttributes,
  SUPPLEMENT: parapharmacieAttributes,
  DEVICE: parapharmacieAttributes,
  OTHER: parapharmacieAttributes,
};

/** Schéma d'attributs pour un type ; permissif si le type est inconnu. */
export function getAttributeSchema(productType: string): z.ZodType {
  return REGISTRY[productType] ?? permissiveAttributes;
}

/**
 * Valide des attributs à l'écriture selon le type. Lève `InvalidProductAttributesError`
 * si invalides ; retourne la valeur validée (nettoyée) sinon.
 */
export function validateAttributes(
  productType: string,
  attributes: unknown,
): Record<string, unknown> {
  const result = getAttributeSchema(productType).safeParse(attributes);
  if (!result.success) {
    throw new InvalidProductAttributesError(productType);
  }
  return result.data as Record<string, unknown>;
}

/**
 * Lecture typée des attributs (jamais d'`any`). Retourne un objet vide si le contenu
 * stocké ne correspond pas au schéma (robustesse à l'affichage).
 */
export function parseAttributes(productType: string, attributes: unknown): ProductAttributes {
  const result = getAttributeSchema(productType).safeParse(attributes);
  return (result.success ? result.data : {}) as ProductAttributes;
}
