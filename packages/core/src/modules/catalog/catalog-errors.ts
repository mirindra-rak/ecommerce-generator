// Erreurs métier du catalogue. Permettent aux Server Actions de traduire un échec en
// message lisible sans laisser fuiter les erreurs Prisma.

export class ReparentCycleError extends Error {
  constructor() {
    super("Impossible de déplacer une catégorie sous elle-même ou l'un de ses descendants.");
    this.name = "ReparentCycleError";
  }
}

export class CategoryNotEmptyError extends Error {
  constructor() {
    super("Cette catégorie contient des sous-catégories ou des produits : déplacez-les d'abord.");
    this.name = "CategoryNotEmptyError";
  }
}

export class InvalidProductAttributesError extends Error {
  constructor(productType: string) {
    super(`Attributs produit invalides pour le type « ${productType} ».`);
    this.name = "InvalidProductAttributesError";
  }
}

export class InvalidCategoryFieldError extends Error {
  constructor(field: string) {
    super(`Le champ « ${field} » contient des caractères interdits (<>;=#{}).`);
    this.name = "InvalidCategoryFieldError";
  }
}
