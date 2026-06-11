import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { productRepository } from "./product.repository";

async function createCremeWithRelations() {
  const product = await productRepository.create({
    name: "Crème hydratante",
    slug: "creme-hydratante",
    ean: "3401591234567",
    productType: "COSMETIC",
    inci: "Aqua, Glycerin",
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
        { sku: "CREME-50", priceExclTax: 1500, volume: "50 ml", stock: 10 },
        { sku: "CREME-100", priceExclTax: 2500, volume: "100 ml", stock: 5 },
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

  it("refuse un slug, un ean ou un sku dupliqué", async () => {
    await createCremeWithRelations();

    await expect(
      productRepository.create({ name: "Doublon slug", slug: "creme-hydratante" }),
    ).rejects.toThrow();

    await expect(
      productRepository.create({ name: "Doublon ean", slug: "autre", ean: "3401591234567" }),
    ).rejects.toThrow();

    await expect(
      productRepository.create({
        name: "Doublon sku",
        slug: "encore-autre",
        variants: { create: [{ sku: "CREME-50", priceExclTax: 999 }] },
      }),
    ).rejects.toThrow();
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
});
