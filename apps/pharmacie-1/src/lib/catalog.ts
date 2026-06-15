// Couche d'accès données du storefront (server-only) : appelle les repositories +
// services de domaine de @pharmacie/core et renvoie des view-models plats,
// sérialisables, prêts pour les composants. Aucune requête Prisma dans les composants.
import {
  brandRepository,
  categoryRepository,
  facetRepository,
  parseAttributes,
  priceRange,
  productRepository,
  type ProductCard,
} from "@pharmacie/core/modules/catalog";
import { siteConfig } from "./site";

const priceFormatter = new Intl.NumberFormat(siteConfig.locale.locale, {
  style: "currency",
  currency: siteConfig.locale.currency,
});

/** Formate un montant en centimes vers une chaîne « 14,90 € ». */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

export interface ProductCardVM {
  slug: string;
  name: string;
  brandName: string | null;
  priceLabel: string | null;
  /** true si le produit a plusieurs prix (afficher « à partir de »). */
  from: boolean;
}

function toCardVM(product: ProductCard): ProductCardVM {
  const range = priceRange(product.variants);
  return {
    slug: product.slug,
    name: product.name,
    brandName: product.brand?.name ?? null,
    priceLabel: range ? formatPrice(range.min) : null,
    from: range ? range.min !== range.max : false,
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCardVM[]> {
  const cards = await productRepository.findActiveCards(limit);
  return cards.map(toCardVM);
}

export interface BrandVM {
  slug: string;
  name: string;
}

/** Marques pour le bandeau « marques phares » (triées par nom, plafonnées). */
export async function getBrands(limit = 14): Promise<BrandVM[]> {
  const brands = await brandRepository.findMany();
  return brands.slice(0, limit).map((b) => ({ slug: b.slug, name: b.name }));
}

export interface NavCategoryVM {
  slug: string;
  label: string;
}

/** Catégories racines ACTIVES (univers) pour la home et la navigation. */
export async function getRootCategories(): Promise<NavCategoryVM[]> {
  const categories = await categoryRepository.findActiveChildren(null);
  return categories.map((c) => ({ slug: c.slug, label: c.name }));
}

export interface MenuCategoryVM extends NavCategoryVM {
  /** Sous-catégories actives, déjà triées (vides si l'univers est une feuille). */
  children: NavCategoryVM[];
}

/**
 * Arbre de navigation (mega menu) : racines actives + sous-catégories actives, en
 * view-model plat et sérialisable (aucune entité Prisma exposée au client).
 */
export async function getMenuTree(): Promise<MenuCategoryVM[]> {
  const roots = await categoryRepository.findActiveMenuTree();
  return roots.map((root) => ({
    slug: root.slug,
    label: root.name,
    children: root.children.map((child) => ({ slug: child.slug, label: child.name })),
  }));
}

export interface CategoryPageVM {
  name: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  coverImageKey: string | null;
  products: ProductCardVM[];
}

export async function getCategoryWithProducts(
  slug: string,
  filters: Record<string, string[]> = {},
): Promise<CategoryPageVM | null> {
  const category = await categoryRepository.findBySlug(slug);
  // Catégorie inexistante OU masquée côté boutique → 404 storefront.
  if (!category || !category.active) return null;
  const cards = await productRepository.findCardsByCategorySlug(slug, filters);
  return {
    name: category.name,
    description: category.description,
    metaTitle: category.metaTitle,
    metaDescription: category.metaDescription,
    coverImageKey: category.coverImageKey,
    products: cards.map(toCardVM),
  };
}

export interface FilterFacetVM {
  code: string;
  name: string;
  values: { code: string; label: string; count: number }[];
}

/**
 * Facettes disponibles pour la sidebar d'une catégorie, avec compteur drill-down par valeur
 * (selon les filtres déjà actifs sur les AUTRES facettes).
 */
export async function getCategoryFilters(
  slug: string,
  filters: Record<string, string[]> = {},
): Promise<FilterFacetVM[]> {
  const facets = await facetRepository.findForCategoryWithCounts(slug, filters);
  return facets.map((facet) => ({
    code: facet.code,
    name: facet.name,
    values: facet.values.map((value) => ({
      code: value.code,
      label: value.label,
      count: value.count,
    })),
  }));
}

export interface ProductDetailVM {
  name: string;
  brandName: string | null;
  description: string | null;
  productType: string;
  inci: string | null;
  precautions: string | null;
  priceLabel: string | null;
  from: boolean;
  /** Catégories du produit (M2M) + catégorie principale (canonical / fil d'Ariane). */
  categories: NavCategoryVM[];
  primaryCategory: NavCategoryVM | null;
  options: { name: string; values: string[] }[];
  variants: { sku: string | null; volume: string | null; priceLabel: string; stock: number }[];
}

export async function getProductDetail(slug: string): Promise<ProductDetailVM | null> {
  const product = await productRepository.findBySlugWithRelations(slug);
  if (!product || !product.active || product.variants.length === 0) return null;

  const range = priceRange(product.variants);
  const attributes = parseAttributes(product.productType, product.attributes);
  return {
    name: product.name,
    brandName: product.brand?.name ?? null,
    description: product.description,
    productType: product.productType,
    inci: attributes.inci ?? null,
    precautions: attributes.precautions ?? null,
    priceLabel: range ? formatPrice(range.min) : null,
    from: range ? range.min !== range.max : false,
    categories: product.categories.map((c) => ({ slug: c.slug, label: c.name })),
    primaryCategory: product.primaryCategory
      ? { slug: product.primaryCategory.slug, label: product.primaryCategory.name }
      : null,
    options: product.options.map((o) => ({ name: o.name, values: o.values.map((v) => v.value) })),
    variants: product.variants.map((v) => ({
      sku: v.sku,
      volume: v.volume,
      priceLabel: formatPrice(v.priceExclTax),
      stock: v.stock,
    })),
  };
}
