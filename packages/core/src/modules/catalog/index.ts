// Module: catalog
// Responsabilité: Produits, variantes, catégories, marques, médias
//
// Frontière d'accès données via Repository (voir ../../repositories).
// La logique métier vit dans des services de domaine de ce module.

export { productRepository } from "./product.repository";
export type { ProductRepository } from "./product.repository";
