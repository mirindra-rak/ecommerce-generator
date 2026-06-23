// Services de domaine du catalogue. Deux familles :
//  - fonctions pures de lecture (priceRange, isDisplayable, resolveVariant), alimentées
//    par l'appelant ;
//  - services d'écriture (createProduct…) qui orchestrent le repository, génèrent le slug,
//    valident les attributs et traduisent les violations d'unicité Prisma.

import { Prisma } from "@prisma/client";
import { taxRateRepository, TaxRateNotFoundError } from "../pricing";
import { searchRepository } from "../search";
import { buildUniqueSlug } from "../../utils/slugify";
import { productRepository, type ProductWithRelations } from "./product.repository";
import { validateAttributes } from "./product-attributes";
import {
  DuplicateProductFieldError,
  PrimaryCategoryNotAssignedError,
  ProductRequiresVariantError,
} from "./catalog-errors";

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

/**
 * Un produit est affichable s'il est actif ET possède au moins une variante.
 * Garde **lecture** de l'invariant « tout est déclinaison » ; la garantie **écriture**
 * (un produit naît toujours avec sa déclinaison par défaut) est portée par
 * `productRepository.createWithDefaultVariant`.
 */
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

// ───────────────────────── Services d'écriture ─────────────────────────

const productSlugExists = (slug: string): Promise<boolean> =>
  productRepository.findBySlug(slug).then((product) => product !== null);

/** Traduit une violation d'unicité Prisma (P2002 sur SKU/EAN) en erreur métier. */
function translateDuplicate(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = error.meta?.target;
    const fields = Array.isArray(target) ? target.join(",") : String(target ?? "");
    throw new DuplicateProductFieldError(fields.includes("ean") ? "code-barres (EAN)" : "SKU");
  }
  throw error;
}

// Une déclinaison : le vendable. Prix en CENTIMES HT. `id` présent = existante (réconciliation),
// `volume` = étiquette libre (ex. « 50 ml », « Lavande »).
export interface ProductVariantInput {
  id?: string;
  sku?: string | null;
  ean?: string | null;
  priceExclTax: number;
  stock?: number;
  volume?: string | null;
}

export interface CreateProductInput {
  name: string;
  productType: string;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  active?: boolean;
  taxRateId?: string;
  brandId?: string | null;
  /** Catégories du produit (M2M). Un produit peut être rattaché à plusieurs catégories. */
  categoryIds?: string[];
  /** Catégorie principale (canonical / fil d'Ariane) ; doit appartenir à `categoryIds`. */
  primaryCategoryId?: string | null;
  attributes?: unknown;
  variants: ProductVariantInput[]; // ≥ 1 (invariant « tout est déclinaison »)
  facetValueIds?: string[];
}

async function resolveTaxRateId(taxRateId?: string): Promise<string> {
  if (taxRateId) {
    const taxRate = await taxRateRepository.findById(taxRateId);
    if (!taxRate || !taxRate.active) throw new TaxRateNotFoundError(taxRateId);
    return taxRate.id;
  }
  const taxRate = await taxRateRepository.findDefault();
  if (!taxRate || !taxRate.active) throw new TaxRateNotFoundError("default");
  return taxRate.id;
}

/**
 * Construit les écritures imbriquées des catégories (M2M) et de la catégorie principale.
 * `mode` distingue la création (`connect`) de la mise à jour (`set`, qui remplace la liste).
 * Rejette une catégorie principale absente de la liste.
 */
function categoryWrite(
  categoryIds: string[],
  primaryCategoryId: string | null,
  mode: "connect" | "set",
) {
  if (primaryCategoryId && !categoryIds.includes(primaryCategoryId)) {
    throw new PrimaryCategoryNotAssignedError();
  }
  const refs = categoryIds.map((id) => ({ id }));
  // À la création, `disconnect` n'a pas de sens (rien à détacher) → on omet la principale.
  const primaryCategory = primaryCategoryId
    ? { connect: { id: primaryCategoryId } }
    : mode === "set"
      ? { disconnect: true }
      : undefined;
  return {
    categories: mode === "connect" ? { connect: refs } : { set: refs },
    ...(primaryCategory ? { primaryCategory } : {}),
  };
}

/**
 * Crée un produit regroupeur + ses déclinaisons (≥ 1, invariant « tout est déclinaison »).
 * Valide les attributs descriptifs selon le type, génère un slug unique.
 */
export async function createProduct(input: CreateProductInput): Promise<ProductWithRelations> {
  if (input.variants.length === 0) throw new ProductRequiresVariantError();
  const attributes = validateAttributes(input.productType, input.attributes ?? {});
  const slug = await buildUniqueSlug(input.name, productSlugExists);
  const taxRateId = await resolveTaxRateId(input.taxRateId);
  try {
    const product = await productRepository.createWithVariants({
      product: {
        name: input.name,
        slug,
        productType: input.productType,
        description: input.description ?? null,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        active: input.active ?? true,
        attributes: attributes as Prisma.InputJsonValue,
        taxRate: { connect: { id: taxRateId } },
        ...(input.brandId ? { brand: { connect: { id: input.brandId } } } : {}),
        ...categoryWrite(input.categoryIds ?? [], input.primaryCategoryId ?? null, "connect"),
      },
      variants: input.variants,
    });
    await productRepository.setFacetValues(product.id, input.facetValueIds ?? []);
    await searchRepository.refreshSearchVector(product.id);
    return product;
  } catch (error) {
    translateDuplicate(error);
  }
}

export type UpdateProductInput = CreateProductInput;

/**
 * Met à jour un produit et réconcilie ses déclinaisons (≥ 1). Le slug n'est PAS régénéré
 * (URL stable). Les déclinaisons sont réconciliées en premier : un SKU/EAN dupliqué est
 * rejeté avant toute mutation des champs scalaires du produit.
 */
export async function updateProduct(id: string, input: UpdateProductInput): Promise<void> {
  if (input.variants.length === 0) throw new ProductRequiresVariantError();
  const attributes = validateAttributes(input.productType, input.attributes ?? {});
  const taxRateId = await resolveTaxRateId(input.taxRateId);
  try {
    await productRepository.reconcileVariants(id, input.variants);
    await productRepository.update(id, {
      name: input.name,
      productType: input.productType,
      description: input.description ?? null,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      active: input.active ?? true,
      attributes: attributes as Prisma.InputJsonValue,
      taxRate: { connect: { id: taxRateId } },
      brand: input.brandId ? { connect: { id: input.brandId } } : { disconnect: true },
      ...categoryWrite(input.categoryIds ?? [], input.primaryCategoryId ?? null, "set"),
    });
    await productRepository.setFacetValues(id, input.facetValueIds ?? []);
    await searchRepository.refreshSearchVector(id);
  } catch (error) {
    translateDuplicate(error);
  }
}

/** Supprime un produit (cascade : déclinaisons, options, médias, liaisons). */
export async function deleteProduct(id: string): Promise<void> {
  await productRepository.delete(id);
}
