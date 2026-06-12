// Erreurs métier du catalogue. Permettent aux Server Actions de traduire un échec en
// message lisible sans laisser fuiter les erreurs Prisma.

export class ReparentCycleError extends Error {
  constructor() {
    super("Impossible de déplacer une catégorie sous elle-même ou l'un de ses descendants.");
    this.name = "ReparentCycleError";
  }
}

// Une catégorie ayant des sous-catégories ne peut pas être supprimée (l'arbre serait
// orphelin). Les produits associés, eux, n'empêchent PAS la suppression (M2M détachée).
export class CategoryNotEmptyError extends Error {
  constructor() {
    super("Cette catégorie contient des sous-catégories : déplacez-les ou supprimez-les d'abord.");
    this.name = "CategoryNotEmptyError";
  }
}

// La catégorie principale d'un produit doit faire partie de ses catégories.
export class PrimaryCategoryNotAssignedError extends Error {
  constructor() {
    super("La catégorie principale doit faire partie des catégories du produit.");
    this.name = "PrimaryCategoryNotAssignedError";
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

// SKU ou EAN déjà utilisé par une autre déclinaison (violation d'unicité Prisma P2002).
export class DuplicateProductFieldError extends Error {
  constructor(field: string) {
    super(`Ce ${field} est déjà utilisé par une autre déclinaison.`);
    this.name = "DuplicateProductFieldError";
  }
}

// Invariant « tout est déclinaison » : un produit doit garder au moins une déclinaison.
export class ProductRequiresVariantError extends Error {
  constructor() {
    super("Un produit doit avoir au moins une déclinaison.");
    this.name = "ProductRequiresVariantError";
  }
}
