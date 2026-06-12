import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import {
  createProduct,
  deleteProduct,
  isDisplayable,
  priceRange,
  resolveVariant,
  updateProduct,
} from "./product.service";
import {
  DuplicateProductFieldError,
  InvalidProductAttributesError,
  PrimaryCategoryNotAssignedError,
  ProductRequiresVariantError,
} from "./catalog-errors";

describe("priceRange", () => {
  it("retourne la fourchette min/max", () => {
    expect(priceRange([{ priceExclTax: 1500 }, { priceExclTax: 2500 }])).toEqual({
      min: 1500,
      max: 2500,
    });
  });

  it("min === max pour une seule variante", () => {
    expect(priceRange([{ priceExclTax: 1500 }])).toEqual({ min: 1500, max: 1500 });
  });

  it("retourne null sans variante", () => {
    expect(priceRange([])).toBeNull();
  });
});

describe("isDisplayable", () => {
  it("non affichable si inactif ou sans variante", () => {
    expect(isDisplayable({ active: false }, 2)).toBe(false);
    expect(isDisplayable({ active: true }, 0)).toBe(false);
  });

  it("affichable si actif avec au moins une variante", () => {
    expect(isDisplayable({ active: true }, 1)).toBe(true);
  });
});

describe("resolveVariant", () => {
  const variants = [
    { id: "v50", selections: [{ optionName: "Contenance", value: "50 ml" }] },
    { id: "v100", selections: [{ optionName: "Contenance", value: "100 ml" }] },
  ];

  it("résout la variante correspondant à la sélection", () => {
    expect(resolveVariant(variants, { Contenance: "100 ml" })?.id).toBe("v100");
  });

  it("retourne null si sélection vide ou sans correspondance", () => {
    expect(resolveVariant(variants, {})).toBeNull();
    expect(resolveVariant(variants, { Contenance: "200 ml" })).toBeNull();
  });
});

// Services d'écriture : intégration sur la vraie base de test (resetDb avant chaque test).
describe("product write services", () => {
  it("crée un produit avec une déclinaison", async () => {
    const product = await createProduct({
      name: "Crème test",
      productType: "COSMETIC",
      attributes: { inci: "Aqua" },
      variants: [{ sku: "TEST-SKU", ean: "1234567890123", priceExclTax: 1500, stock: 10 }],
    });

    expect(product.slug).toBe("creme-test");
    expect(product.variants).toHaveLength(1);
    const [variant] = product.variants;
    expect(variant?.sku).toBe("TEST-SKU");
    expect(variant?.ean).toBe("1234567890123");
    expect(variant?.priceExclTax).toBe(1500);
    expect(variant?.stock).toBe(10);
    expect(isDisplayable(product, product.variants.length)).toBe(true);
  });

  it("crée un produit avec plusieurs déclinaisons", async () => {
    const product = await createProduct({
      name: "Crème multi",
      productType: "COSMETIC",
      variants: [
        { sku: "M-50", volume: "50 ml", priceExclTax: 1490, stock: 5 },
        { sku: "M-100", volume: "100 ml", priceExclTax: 2290, stock: 3 },
      ],
    });

    expect(product.variants).toHaveLength(2);
    const labels = product.variants.map((v) => v.volume).sort();
    expect(labels).toEqual(["100 ml", "50 ml"]);
  });

  it("refuse une liste de déclinaisons vide", async () => {
    await expect(
      createProduct({ name: "Vide", productType: "OTHER", variants: [] }),
    ).rejects.toBeInstanceOf(ProductRequiresVariantError);
  });

  it("génère un slug unique en cas de doublon de nom", async () => {
    await createProduct({
      name: "Doublon",
      productType: "OTHER",
      variants: [{ sku: "A1", priceExclTax: 100 }],
    });
    const second = await createProduct({
      name: "Doublon",
      productType: "OTHER",
      variants: [{ sku: "A2", priceExclTax: 100 }],
    });
    expect(second.slug).toBe("doublon-2");
  });

  it("rejette des attributs descriptifs invalides", async () => {
    await expect(
      createProduct({
        name: "Invalide",
        productType: "COSMETIC",
        attributes: { inci: 123 },
        variants: [{ sku: "INV-1", priceExclTax: 100 }],
      }),
    ).rejects.toBeInstanceOf(InvalidProductAttributesError);
  });

  it("met à jour le produit et sa déclinaison", async () => {
    const product = await createProduct({
      name: "Avant",
      productType: "OTHER",
      variants: [{ sku: "U1", priceExclTax: 1000, stock: 5 }],
    });
    const [created] = product.variants;
    if (!created) throw new Error("déclinaison manquante");

    await updateProduct(product.id, {
      name: "Après",
      productType: "OTHER",
      variants: [{ id: created.id, sku: "U1", priceExclTax: 2000, stock: 8 }],
    });

    const reloaded = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
      include: { variants: true },
    });
    expect(reloaded.name).toBe("Après");
    expect(reloaded.variants).toHaveLength(1);
    expect(reloaded.variants[0]?.priceExclTax).toBe(2000);
    expect(reloaded.variants[0]?.stock).toBe(8);
  });

  it("updateProduct réconcilie les déclinaisons (maj + ajout + suppression)", async () => {
    const product = await createProduct({
      name: "Réconcilie",
      productType: "OTHER",
      variants: [
        { sku: "R-A", volume: "A", priceExclTax: 100 },
        { sku: "R-B", volume: "B", priceExclTax: 200 },
      ],
    });
    const byLabel = new Map(product.variants.map((v) => [v.volume, v.id]));
    const idA = byLabel.get("A");
    if (!idA) throw new Error("déclinaison A manquante");

    // Garde A (prix modifié), supprime B (absent), ajoute C.
    await updateProduct(product.id, {
      name: "Réconcilie",
      productType: "OTHER",
      variants: [
        { id: idA, sku: "R-A", volume: "A", priceExclTax: 150 },
        { sku: "R-C", volume: "C", priceExclTax: 300 },
      ],
    });

    const variants = await prisma.productVariant.findMany({ where: { productId: product.id } });
    expect(variants).toHaveLength(2);
    expect(variants.map((v) => v.sku).sort()).toEqual(["R-A", "R-C"]);
    expect(variants.find((v) => v.sku === "R-A")?.priceExclTax).toBe(150);
  });

  it("refuse de vider toutes les déclinaisons à la mise à jour", async () => {
    const product = await createProduct({
      name: "Garde une",
      productType: "OTHER",
      variants: [{ sku: "G1", priceExclTax: 100 }],
    });
    await expect(
      updateProduct(product.id, { name: "Garde une", productType: "OTHER", variants: [] }),
    ).rejects.toBeInstanceOf(ProductRequiresVariantError);
  });

  it("supprime un produit et ses déclinaisons en cascade", async () => {
    const product = await createProduct({
      name: "À supprimer",
      productType: "OTHER",
      variants: [{ sku: "D1", priceExclTax: 100 }],
    });

    await deleteProduct(product.id);

    expect(await prisma.product.count()).toBe(0);
    expect(await prisma.productVariant.count()).toBe(0);
  });

  it("rejette un SKU ou un EAN dupliqué", async () => {
    await createProduct({
      name: "Premier",
      productType: "OTHER",
      variants: [{ sku: "DUP", ean: "999", priceExclTax: 100 }],
    });

    await expect(
      createProduct({
        name: "SKU dupliqué",
        productType: "OTHER",
        variants: [{ sku: "DUP", priceExclTax: 100 }],
      }),
    ).rejects.toBeInstanceOf(DuplicateProductFieldError);

    await expect(
      createProduct({
        name: "EAN dupliqué",
        productType: "OTHER",
        variants: [{ sku: "AUTRE", ean: "999", priceExclTax: 100 }],
      }),
    ).rejects.toBeInstanceOf(DuplicateProductFieldError);
  });

  it("crée une déclinaison sans SKU (sku = null)", async () => {
    const product = await createProduct({
      name: "Sans SKU",
      productType: "OTHER",
      variants: [{ priceExclTax: 100 }],
    });
    expect(product.variants).toHaveLength(1);
    expect(product.variants[0]?.sku).toBeNull();
  });

  it("autorise plusieurs déclinaisons sans SKU (NULL distinct dans l'index unique)", async () => {
    await createProduct({
      name: "Sans SKU 1",
      productType: "OTHER",
      variants: [{ priceExclTax: 100 }],
    });
    // Un autre produit sans SKU + un produit à 2 déclinaisons sans SKU : aucun conflit d'unicité.
    await createProduct({
      name: "Sans SKU 2",
      productType: "OTHER",
      variants: [
        { priceExclTax: 100, volume: "A" },
        { priceExclTax: 200, volume: "B" },
      ],
    });
    expect(await prisma.productVariant.count({ where: { sku: null } })).toBe(3);
  });

  it("assigne puis remplace les valeurs de facettes", async () => {
    const facet = await prisma.facet.create({
      data: {
        code: "nature",
        name: "Nature",
        values: {
          create: [
            { code: "creme", label: "Crème" },
            { code: "gel", label: "Gel" },
          ],
        },
      },
      include: { values: true },
    });
    const creme = facet.values.find((v) => v.code === "creme");
    const gel = facet.values.find((v) => v.code === "gel");
    if (!creme || !gel) throw new Error("valeurs de facette manquantes");

    const product = await createProduct({
      name: "Avec facette",
      productType: "COSMETIC",
      variants: [{ sku: "F1", priceExclTax: 100 }],
      facetValueIds: [creme.id],
    });
    expect(await prisma.productFacetValue.count({ where: { productId: product.id } })).toBe(1);

    const [variant] = product.variants;
    if (!variant) throw new Error("déclinaison manquante");

    // L'update remplace l'ensemble des valeurs (purge + recrée).
    await updateProduct(product.id, {
      name: "Avec facette",
      productType: "COSMETIC",
      variants: [{ id: variant.id, sku: "F1", priceExclTax: 100 }],
      facetValueIds: [gel.id],
    });

    const links = await prisma.productFacetValue.findMany({ where: { productId: product.id } });
    expect(links).toHaveLength(1);
    expect(links[0]?.facetValueId).toBe(gel.id);
  });

  it("associe un produit à plusieurs catégories + une principale", async () => {
    const c1 = await prisma.category.create({ data: { name: "Visage", slug: "visage" } });
    const c2 = await prisma.category.create({ data: { name: "Bio", slug: "bio" } });

    const product = await createProduct({
      name: "Multi-cat",
      productType: "COSMETIC",
      categoryIds: [c1.id, c2.id],
      primaryCategoryId: c1.id,
      variants: [{ sku: "MC-1", priceExclTax: 100 }],
    });

    const reloaded = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
      include: { categories: true },
    });
    expect(reloaded.categories.map((c) => c.slug).sort()).toEqual(["bio", "visage"]);
    expect(reloaded.primaryCategoryId).toBe(c1.id);
  });

  it("updateProduct remplace l'ensemble des catégories (set)", async () => {
    const c1 = await prisma.category.create({ data: { name: "C1", slug: "c1" } });
    const c2 = await prisma.category.create({ data: { name: "C2", slug: "c2" } });
    const product = await createProduct({
      name: "Re-cat",
      productType: "OTHER",
      categoryIds: [c1.id, c2.id],
      variants: [{ sku: "RC-1", priceExclTax: 100 }],
    });
    const [variant] = product.variants;
    if (!variant) throw new Error("déclinaison manquante");

    await updateProduct(product.id, {
      name: "Re-cat",
      productType: "OTHER",
      categoryIds: [c2.id],
      primaryCategoryId: c2.id,
      variants: [{ id: variant.id, sku: "RC-1", priceExclTax: 100 }],
    });

    const reloaded = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
      include: { categories: true },
    });
    expect(reloaded.categories.map((c) => c.slug)).toEqual(["c2"]);
    expect(reloaded.primaryCategoryId).toBe(c2.id);
  });

  it("rejette une catégorie principale hors de la liste", async () => {
    const c1 = await prisma.category.create({ data: { name: "Dans", slug: "dans" } });
    const c2 = await prisma.category.create({ data: { name: "Hors", slug: "hors" } });
    await expect(
      createProduct({
        name: "Principale invalide",
        productType: "OTHER",
        categoryIds: [c1.id],
        primaryCategoryId: c2.id,
        variants: [{ sku: "PI-1", priceExclTax: 100 }],
      }),
    ).rejects.toBeInstanceOf(PrimaryCategoryNotAssignedError);
  });
});
