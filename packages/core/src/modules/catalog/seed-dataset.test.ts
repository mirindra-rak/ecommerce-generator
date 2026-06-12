import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Garde-fou du dataset committé (`prisma/seed-data/catalog.json`). Le générateur lit le
// repo voisin `laparaducoin` (absent en CI) ; ce test verrouille en revanche les
// invariants du JSON versionné, garants d'un seed sain (Scénarios 3 & 5 de la story).

interface SeedCategory {
  externalId: number;
  slug: string;
  parentExternalId: number | null;
}
interface SeedBrand {
  externalId: number;
  slug: string;
}
interface SeedProduct {
  externalId: number;
  slug: string;
  vatRate: number;
  brandExternalId: number;
  categoryExternalId: number;
  variant: { sku: string; ean?: string; priceExclTax: number; stock: number };
}
interface Dataset {
  categories: SeedCategory[];
  brands: SeedBrand[];
  products: SeedProduct[];
}

const datasetPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../prisma/seed-data/catalog.json",
);
const dataset = JSON.parse(readFileSync(datasetPath, "utf8")) as Dataset;

const VALID_VAT_RATES = new Set([210, 550, 1000, 2000]);

describe("dataset catalog.json", () => {
  it("contient des catégories, marques et ~100 produits", () => {
    expect(dataset.categories.length).toBeGreaterThan(0);
    expect(dataset.brands.length).toBeGreaterThan(0);
    expect(dataset.products.length).toBeGreaterThanOrEqual(50);
  });

  it("expose des univers (catégories racines)", () => {
    const roots = dataset.categories.filter((c) => c.parentExternalId === null);
    expect(roots.length).toBeGreaterThan(0);
  });

  it("référence des parents de catégorie existants", () => {
    const ids = new Set(dataset.categories.map((c) => c.externalId));
    for (const c of dataset.categories) {
      if (c.parentExternalId !== null) expect(ids.has(c.parentExternalId)).toBe(true);
    }
  });

  it("rattache chaque produit à une catégorie et une marque du dataset", () => {
    const categoryIds = new Set(dataset.categories.map((c) => c.externalId));
    const brandIds = new Set(dataset.brands.map((b) => b.externalId));
    for (const p of dataset.products) {
      expect(categoryIds.has(p.categoryExternalId)).toBe(true);
      expect(brandIds.has(p.brandExternalId)).toBe(true);
    }
  });

  it("garantit des SKU uniques", () => {
    const skus = dataset.products.map((p) => p.variant.sku);
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("garantit des EAN uniques (quand présents)", () => {
    const eans = dataset.products.map((p) => p.variant.ean).filter((e): e is string => Boolean(e));
    expect(new Set(eans).size).toBe(eans.length);
  });

  it("a des prix entiers strictement positifs", () => {
    for (const p of dataset.products) {
      expect(Number.isInteger(p.variant.priceExclTax)).toBe(true);
      expect(p.variant.priceExclTax).toBeGreaterThan(0);
    }
  });

  it("a des taux de TVA valides (points de base FR)", () => {
    for (const p of dataset.products) {
      expect(VALID_VAT_RATES.has(p.vatRate)).toBe(true);
    }
  });

  it("a des slugs uniques (catégories et produits)", () => {
    const catSlugs = dataset.categories.map((c) => c.slug);
    expect(new Set(catSlugs).size).toBe(catSlugs.length);
    const productSlugs = dataset.products.map((p) => p.slug);
    expect(new Set(productSlugs).size).toBe(productSlugs.length);
  });
});
