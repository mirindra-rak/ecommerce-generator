import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { createProduct, updateProduct } from "../catalog/product.service";
import { DEFAULT_TAX_RATE_ID } from "../pricing";
import { searchRepository } from "./search.repository";

function getSearchVector(productId: string): Promise<string | null> {
  return prisma.$queryRaw<Array<{ search_vector: string | null }>>`
    SELECT search_vector::text FROM "Product" WHERE "id" = ${productId}
  `.then((rows) => rows[0]?.search_vector ?? null);
}

describe("search vector", () => {
  it("est calculé après createProduct", async () => {
    const product = await createProduct({
      name: "Doliprane 1000mg",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      variants: [{ sku: "DOL-1000", priceExclTax: 350 }],
    });

    const vector = await getSearchVector(product.id);
    expect(vector).not.toBeNull();
    expect(vector).toContain("'dolipran'"); // stemmed french
  });

  it("contient le nom du produit en poids A", async () => {
    const product = await createProduct({
      name: "Ibuprofène",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      variants: [{ priceExclTax: 400 }],
    });

    const vector = await getSearchVector(product.id);
    expect(vector).toMatch(/'ibuprofen':1A/);
  });

  it("contient la marque en poids A", async () => {
    const brand = await prisma.brand.create({
      data: { name: "Sanofi", slug: "sanofi" },
    });
    const product = await createProduct({
      name: "Aspirine",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      brandId: brand.id,
      variants: [{ priceExclTax: 250 }],
    });

    const vector = await getSearchVector(product.id);
    expect(vector).toContain("'sanof'");
  });

  it("contient SKU et EAN en poids A (dictionnaire simple)", async () => {
    const product = await createProduct({
      name: "Crème mains",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      variants: [{ sku: "ACM-CR-200", ean: "3401560123456", priceExclTax: 890 }],
    });

    const vector = await getSearchVector(product.id);
    expect(vector).toContain("'acm'");
    expect(vector).toContain("'3401560123456'");
  });

  it("contient shortDescription en poids B", async () => {
    const product = await createProduct({
      name: "Sérum",
      productType: "COSMETIC",
      taxRateId: DEFAULT_TAX_RATE_ID,
      description: "Description longue du produit pour le SEO.",
      variants: [{ priceExclTax: 1500 }],
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { shortDescription: "Soin hydratant visage" },
    });
    await searchRepository.refreshSearchVector(product.id);

    const vector = await getSearchVector(product.id);
    expect(vector).toMatch(/'hydrat':\d+B/);
  });

  it("contient la description en poids C", async () => {
    const product = await createProduct({
      name: "Gel douche",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      description: "Nettoyant quotidien pour peaux sensibles",
      variants: [{ priceExclTax: 500 }],
    });

    const vector = await getSearchVector(product.id);
    expect(vector).toMatch(/'nettoi':\d+C/);
  });

  it("contient les valeurs des attributs JSONB en poids C", async () => {
    const product = await createProduct({
      name: "Baume réparateur",
      productType: "COSMETIC",
      taxRateId: DEFAULT_TAX_RATE_ID,
      attributes: { inci: "Aqua Glycerin Cetearyl" },
      variants: [{ priceExclTax: 1200 }],
    });

    const vector = await getSearchVector(product.id);
    expect(vector).toContain("glycerin");
  });

  it("est mis à jour après updateProduct", async () => {
    const product = await createProduct({
      name: "Ancien nom",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      variants: [{ sku: "UPD-1", priceExclTax: 100 }],
    });

    await updateProduct(product.id, {
      name: "Nouveau nom spécifique",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      variants: [{ sku: "UPD-1", priceExclTax: 100 }],
    });

    const vector = await getSearchVector(product.id);
    expect(vector).toContain("'spécif'"); // stemmed
    expect(vector).not.toContain("'ancien'");
  });

  it("refreshAll met à jour tous les produits", async () => {
    const p1 = await createProduct({
      name: "Produit Alpha",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      variants: [{ priceExclTax: 100 }],
    });
    const p2 = await createProduct({
      name: "Produit Beta",
      productType: "OTHER",
      taxRateId: DEFAULT_TAX_RATE_ID,
      variants: [{ priceExclTax: 200 }],
    });

    // Corrupt vectors manually then refresh all
    await prisma.$executeRaw`UPDATE "Product" SET "search_vector" = NULL`;
    await searchRepository.refreshAll();

    expect(await getSearchVector(p1.id)).not.toBeNull();
    expect(await getSearchVector(p2.id)).not.toBeNull();
  });
});
