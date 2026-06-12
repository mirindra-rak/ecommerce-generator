// Module: catalog
// Responsabilité: Produits, variantes, catégories, marques, médias
//
// Frontière d'accès données via Repository (voir ../../repositories).
// La logique métier vit dans des services de domaine de ce module.

export { brandRepository } from "./brand.repository";
export type { BrandRepository } from "./brand.repository";

export { categoryRepository } from "./category.repository";
export type { CategoryRepository } from "./category.repository";

export { productRepository } from "./product.repository";
export type { ProductRepository, ProductWithRelations, ProductCard } from "./product.repository";

export { priceRange, isDisplayable, resolveVariant } from "./product.service";
export type { PriceRange, SelectableVariant } from "./product.service";

export { canReparent, createCategory, updateCategory, deleteCategory } from "./category.service";
export type { CreateCategoryInput, UpdateCategoryInput } from "./category.service";

export { createBrand, updateBrand, deleteBrand } from "./brand.service";

export { ReparentCycleError, CategoryNotEmptyError } from "./catalog-errors";
