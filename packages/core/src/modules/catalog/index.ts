// Module: catalog
// Responsabilité: Produits, variantes, catégories, marques, médias
//
// Frontière d'accès données via Repository (voir ../../repositories).
// La logique métier vit dans des services de domaine de ce module.

export { brandRepository } from "./brand.repository";
export type { BrandRepository } from "./brand.repository";

export { categoryRepository } from "./category.repository";
export type { CategoryRepository, CategoryWithChildren } from "./category.repository";

export { productRepository } from "./product.repository";
export type { ProductRepository, ProductWithRelations, ProductCard } from "./product.repository";

export { facetRepository } from "./facet.repository";
export type {
  FacetRepository,
  FacetWithValues,
  FacetWithCounts,
  FacetValueCount,
} from "./facet.repository";

export {
  priceRange,
  isDisplayable,
  resolveVariant,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./product.service";
export type {
  PriceRange,
  SelectableVariant,
  CreateProductInput,
  UpdateProductInput,
  ProductVariantInput,
} from "./product.service";

export { canReparent, createCategory, updateCategory, deleteCategory } from "./category.service";
export type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryContentInput,
} from "./category.service";

export { safeTextField, validateCategoryFields } from "./category-fields";

export { createBrand, updateBrand, deleteBrand } from "./brand.service";

export {
  ReparentCycleError,
  CategoryNotEmptyError,
  PrimaryCategoryNotAssignedError,
  InvalidProductAttributesError,
  InvalidCategoryFieldError,
  DuplicateProductFieldError,
  ProductRequiresVariantError,
} from "./catalog-errors";

export {
  PRODUCT_TYPES,
  getAttributeSchema,
  validateAttributes,
  parseAttributes,
} from "./product-attributes";
export type { ProductType, ProductAttributes } from "./product-attributes";
