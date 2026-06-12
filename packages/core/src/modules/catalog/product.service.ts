// Services de domaine du catalogue (story 02). Logique métier pure, sans accès
// Prisma direct : les données sont fournies par l'appelant (via repository).

export interface PriceRange {
  min: number;
  max: number;
}

/** Fourchette de prix HT (centimes) d'un produit à partir de ses variantes. */
export function priceRange(variants: ReadonlyArray<{ priceExclTax: number }>): PriceRange | null {
  const first = variants[0];
  if (!first) return null;
  let min = first.priceExclTax;
  let max = first.priceExclTax;
  for (const variant of variants) {
    if (variant.priceExclTax < min) min = variant.priceExclTax;
    if (variant.priceExclTax > max) max = variant.priceExclTax;
  }
  return { min, max };
}

/** Un produit est affichable s'il est actif ET possède au moins une variante. */
export function isDisplayable(product: { active: boolean }, variantCount: number): boolean {
  return product.active && variantCount > 0;
}

export interface SelectableVariant {
  id: string;
  selections: ReadonlyArray<{ optionName: string; value: string }>;
}

/**
 * Résout l'unique variante correspondant exactement à une sélection d'options.
 * Retourne `null` si la sélection est vide, incomplète ou sans correspondance.
 */
export function resolveVariant<T extends SelectableVariant>(
  variants: ReadonlyArray<T>,
  selection: Readonly<Record<string, string>>,
): T | null {
  const keys = Object.keys(selection);
  if (keys.length === 0) return null;
  const match = variants.find(
    (variant) =>
      variant.selections.length === keys.length &&
      keys.every((key) =>
        variant.selections.some((s) => s.optionName === key && s.value === selection[key]),
      ),
  );
  return match ?? null;
}
