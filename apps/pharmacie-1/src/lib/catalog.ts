// Couche d'accès données du storefront (server-only) : appelle les repositories +
// services de domaine de @pharmacie/core et renvoie des view-models plats,
// sérialisables, prêts pour les composants. Aucune requête Prisma dans les composants.
import {
  categoryRepository,
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

export interface NavCategoryVM {
  slug: string;
  label: string;
}

/** Catégories racines (univers) pour la home et la navigation. */
export async function getRootCategories(): Promise<NavCategoryVM[]> {
  const categories = await categoryRepository.findChildren(null);
  return categories.map((c) => ({ slug: c.slug, label: c.name }));
}

export interface CategoryPageVM {
  name: string;
  products: ProductCardVM[];
}

export async function getCategoryWithProducts(slug: string): Promise<CategoryPageVM | null> {
  const category = await categoryRepository.findBySlug(slug);
  if (!category) return null;
  const cards = await productRepository.findCardsByCategorySlug(slug);
  return { name: category.name, products: cards.map(toCardVM) };
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
  options: { name: string; values: string[] }[];
  variants: { sku: string; volume: string | null; priceLabel: string; stock: number }[];
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
    options: product.options.map((o) => ({ name: o.name, values: o.values.map((v) => v.value) })),
    variants: product.variants.map((v) => ({
      sku: v.sku,
      volume: v.volume,
      priceLabel: formatPrice(v.priceExclTax),
      stock: v.stock,
    })),
  };
}
