import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { productRepository } from "./product.repository";
import { isDisplayable } from "./product.service";

async function createCremeWithRelations() {
  const product = await productRepository.create({
    name: "Crème hydratante",
    slug: "creme-hydratante",
    productType: "COSMETIC",
    attributes: { inci: "Aqua, Glycerin" },
    options: {
      create: [
        {
          name: "Contenance",
          position: 0,
          values: {
            create: [
              { value: "50 ml", position: 0 },
              { value: "100 ml", position: 1 },
            ],
          },
        },
      ],
    },
    // Médias volontairement dans le désordre pour vérifier le tri par position.
    media: {
      create: [
        { storageKey: "media/b.jpg", alt: "B", position: 1 },
        { storageKey: "media/a.jpg", alt: "A", position: 0 },
      ],
    },
    variants: {
      create: [
        { sku: "CREME-50", ean: "3401591234567", priceExclTax: 1500, volume: "50 ml", stock: 10 },
        { sku: "CREME-100", ean: "3401591234574", priceExclTax: 2500, volume: "100 ml", stock: 5 },
      ],
    },
  });

  // Liaison variante ↔ valeur d'option (IDs connus après création).
  const value100 = await prisma.productOptionValue.findFirstOrThrow({ where: { value: "100 ml" } });
  const variant100 = await prisma.productVariant.findUniqueOrThrow({ where: { sku: "CREME-100" } });
  await prisma.variantOptionValue.create({
    data: { variantId: variant100.id, optionValueId: value100.id },
  });

  return { product, value100, variant100 };
}

describe("productRepository", () => {
  it("crée un produit avec options, variantes et médias, et les recharge triés", async () => {
    const { value100, variant100 } = await createCremeWithRelations();

    const full = await productRepository.findBySlugWithRelations("creme-hydratante");
    expect(full).not.toBeNull();

    // Médias triés par position
    expect(full?.media.map((m) => m.storageKey)).toEqual(["media/a.jpg", "media/b.jpg"]);

    // Options + valeurs triées
    expect(full?.options[0]?.name).toBe("Contenance");
    expect(full?.options[0]?.values.map((v) => v.value)).toEqual(["50 ml", "100 ml"]);

    // Variante liée à la bonne valeur
    const linked = full?.variants.find((v) => v.id === variant100.id);
    expect(linked?.optionValues[0]?.optionValue.id).toBe(value100.id);
  });

  it("refuse un slug produit, ou un ean/sku de déclinaison dupliqué", async () => {
    await createCremeWithRelations();

    await expect(
      productRepository.create({ name: "Doublon slug", slug: "creme-hydratante" }),
    ).rejects.toThrow();

    // EAN et SKU vivent désormais sur la déclinaison : le doublon est rejeté à ce niveau.
    await expect(
      productRepository.create({
        name: "Doublon ean",
        slug: "autre",
        variants: { create: [{ sku: "AUTRE-50", ean: "3401591234567", priceExclTax: 999 }] },
      }),
    ).rejects.toThrow();

    await expect(
      productRepository.create({
        name: "Doublon sku",
        slug: "encore-autre",
        variants: { create: [{ sku: "CREME-50", priceExclTax: 999 }] },
      }),
    ).rejects.toThrow();
  });

  it("createWithDefaultVariant : crée un produit avec exactement 1 déclinaison vendable", async () => {
    const created = await productRepository.createWithDefaultVariant({
      product: { name: "Sérum simple", slug: "serum-simple", productType: "COSMETIC" },
      defaultVariant: { sku: "SERUM-DEF", ean: "3401599999999", priceExclTax: 1990, stock: 7 },
    });

    expect(created.variants).toHaveLength(1);
    const variant = created.variants[0];
    expect(variant?.sku).toBe("SERUM-DEF");
    expect(variant?.ean).toBe("3401599999999");
    expect(variant?.priceExclTax).toBe(1990);
    expect(variant?.stock).toBe(7);

    // L'invariant « tout est déclinaison » est satisfait → produit affichable.
    expect(isDisplayable(created, created.variants.length)).toBe(true);
  });

  it("findActiveSlugs : slugs des produits actifs uniquement (pour le sitemap)", async () => {
    await productRepository.create({
      name: "Sérum actif",
      slug: "serum-actif",
      productType: "COSMETIC",
      variants: { create: [{ priceExclTax: 1990, stock: 1 }] },
    });
    await productRepository.create({
      name: "Sérum masqué",
      slug: "serum-masque",
      productType: "COSMETIC",
      active: false,
      variants: { create: [{ priceExclTax: 1990, stock: 1 }] },
    });

    const slugs = await productRepository.findActiveSlugs();

    expect(slugs.map((p) => p.slug)).toEqual(["serum-actif"]);
    expect(slugs[0]?.updatedAt).toBeInstanceOf(Date);
  });

  it("reconcileVariants : met à jour les existantes, ajoute les nouvelles, supprime les absentes", async () => {
    const product = await productRepository.createWithDefaultVariant({
      product: { name: "Recon", slug: "recon" },
      defaultVariant: { sku: "RC-A", priceExclTax: 100, volume: "A" },
    });
    const a = product.variants[0];
    if (!a) throw new Error("variante A manquante");

    // Garde A (prix modifié) + ajoute B.
    await productRepository.reconcileVariants(product.id, [
      { id: a.id, sku: "RC-A", priceExclTax: 150, volume: "A" },
      { sku: "RC-B", priceExclTax: 200, volume: "B" },
    ]);
    let variants = await prisma.productVariant.findMany({ where: { productId: product.id } });
    expect(variants).toHaveLength(2);
    expect(variants.find((v) => v.sku === "RC-A")?.priceExclTax).toBe(150);

    // Ne garde que B → A est supprimée.
    const b = variants.find((v) => v.sku === "RC-B");
    if (!b) throw new Error("variante B manquante");
    await productRepository.reconcileVariants(product.id, [
      { id: b.id, sku: "RC-B", priceExclTax: 200, volume: "B" },
    ]);
    variants = await prisma.productVariant.findMany({ where: { productId: product.id } });
    expect(variants).toHaveLength(1);
    expect(variants[0]?.sku).toBe("RC-B");
  });

  it("supprime un produit en cascade (variantes, médias, options, liaisons)", async () => {
    const { product } = await createCremeWithRelations();

    await productRepository.delete(product.id);

    expect(await prisma.productVariant.count()).toBe(0);
    expect(await prisma.productMedia.count()).toBe(0);
    expect(await prisma.productOption.count()).toBe(0);
    expect(await prisma.productOptionValue.count()).toBe(0);
    expect(await prisma.variantOptionValue.count()).toBe(0);
  });

  it("findCardsByCategorySlug filtre par facettes (ET entre facettes, OU à l'intérieur)", async () => {
    const category = await prisma.category.create({ data: { name: "Soins", slug: "soins" } });
    const nature = await prisma.facet.create({
      data: {
        code: "nature",
        name: "Nature",
        values: {
          create: [
            { code: "creme", label: "Crème" },
            { code: "serum", label: "Sérum" },
          ],
        },
      },
      include: { values: true },
    });
    const spec = await prisma.facet.create({
      data: {
        code: "specificite",
        name: "Spécificité",
        values: { create: [{ code: "bio", label: "Bio" }] },
      },
      include: { values: true },
    });
    const valueId = (values: { code: string; id: string }[], code: string): string => {
      const value = values.find((v) => v.code === code);
      if (!value) throw new Error(`valeur de facette manquante : ${code}`);
      return value.id;
    };

    await prisma.product.create({
      data: {
        name: "Crème bio",
        slug: "creme-bio",
        categories: { connect: { id: category.id } },
        facetValues: {
          create: [
            { facetValueId: valueId(nature.values, "creme") },
            { facetValueId: valueId(spec.values, "bio") },
          ],
        },
      },
    });
    await prisma.product.create({
      data: {
        name: "Sérum",
        slug: "serum-x",
        categories: { connect: { id: category.id } },
        facetValues: { create: [{ facetValueId: valueId(nature.values, "serum") }] },
      },
    });

    const all = await productRepository.findCardsByCategorySlug("soins");
    expect(all).toHaveLength(2);

    const cremeOnly = await productRepository.findCardsByCategorySlug("soins", {
      nature: ["creme"],
    });
    expect(cremeOnly.map((p) => p.slug)).toEqual(["creme-bio"]);

    // OU dans une facette
    const natureUnion = await productRepository.findCardsByCategorySlug("soins", {
      nature: ["creme", "serum"],
    });
    expect(natureUnion).toHaveLength(2);

    // ET entre facettes
    const cremeBio = await productRepository.findCardsByCategorySlug("soins", {
      nature: ["creme"],
      specificite: ["bio"],
    });
    expect(cremeBio).toHaveLength(1);

    const serumBio = await productRepository.findCardsByCategorySlug("soins", {
      nature: ["serum"],
      specificite: ["bio"],
    });
    expect(serumBio).toHaveLength(0);
  });

  it("un produit multi-catégories ressort de chaque listing et expose sa principale", async () => {
    const c1 = await prisma.category.create({ data: { name: "Visage", slug: "visage" } });
    const c2 = await prisma.category.create({ data: { name: "Bio", slug: "bio" } });
    await prisma.product.create({
      data: {
        name: "Sérum bio",
        slug: "serum-bio",
        productType: "COSMETIC",
        categories: { connect: [{ id: c1.id }, { id: c2.id }] },
        primaryCategory: { connect: { id: c1.id } },
        variants: { create: { sku: "SB-1", priceExclTax: 1990 } },
      },
    });

    expect(await productRepository.findCardsByCategorySlug("visage")).toHaveLength(1);
    expect(await productRepository.findCardsByCategorySlug("bio")).toHaveLength(1);

    const detail = await productRepository.findBySlugWithRelations("serum-bio");
    expect(detail?.categories.map((c) => c.slug).sort()).toEqual(["bio", "visage"]);
    expect(detail?.primaryCategory?.slug).toBe("visage");
  });
});
