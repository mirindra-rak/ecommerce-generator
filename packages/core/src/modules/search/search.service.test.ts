import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { createProduct, type CreateProductInput } from "../catalog/product.service";
import { DEFAULT_TAX_RATE_ID } from "../pricing";
import { search, suggest } from "./search.service";
import type { SearchConfig } from "./search-dictionary.types";

const base: Pick<CreateProductInput, "productType" | "taxRateId"> = {
  productType: "OTHER",
  taxRateId: DEFAULT_TAX_RATE_ID,
};

const searchConfig: SearchConfig = {
  dictionary: {
    entries: [
      {
        canonicalTerm: "avene",
        aliases: ["avene", "avène"],
        entity: { kind: "brand", code: "avene" },
      },
      {
        canonicalTerm: "solaire",
        aliases: ["spf", "ecran solaire"],
        entity: { kind: "category", code: "solaire" },
      },
      {
        canonicalTerm: "spray",
        aliases: ["brume"],
        entity: { kind: "attributeValue", code: "spray" },
      },
    ],
  },
};

let fvSprayId: string;
let fvCremeId: string;
let fvTubeId: string;
let fvFlaconId: string;

async function seedSearchData() {
  const nature = await prisma.facet.create({
    data: { code: "nature", name: "Nature", position: 0 },
  });
  const spray = await prisma.facetValue.create({
    data: { facetId: nature.id, code: "spray", label: "Spray", position: 0 },
  });
  fvSprayId = spray.id;
  const creme = await prisma.facetValue.create({
    data: { facetId: nature.id, code: "creme", label: "Crème", position: 1 },
  });
  fvCremeId = creme.id;

  const conditionnement = await prisma.facet.create({
    data: { code: "conditionnement", name: "Conditionnement", position: 1 },
  });
  const tube = await prisma.facetValue.create({
    data: { facetId: conditionnement.id, code: "tube", label: "Tube", position: 0 },
  });
  fvTubeId = tube.id;
  const flacon = await prisma.facetValue.create({
    data: { facetId: conditionnement.id, code: "flacon", label: "Flacon", position: 1 },
  });
  fvFlaconId = flacon.id;

  const brand = await prisma.brand.create({
    data: { name: "Avène", slug: "avene" },
  });

  await createProduct({
    ...base,
    name: "Crème solaire SPF 50",
    brandId: brand.id,
    variants: [{ sku: "SOL-50", ean: "3401560000001", priceExclTax: 1500 }],
    facetValueIds: [fvCremeId, fvTubeId],
  });

  await createProduct({
    ...base,
    name: "Spray solaire SPF 30",
    brandId: brand.id,
    variants: [{ sku: "SOL-30", priceExclTax: 1200 }],
    facetValueIds: [fvSprayId, fvFlaconId],
  });

  await createProduct({
    ...base,
    name: "Doliprane 1000mg",
    variants: [
      { sku: "DOL-1000", priceExclTax: 350 },
      { sku: "DOL-500", priceExclTax: 250 },
    ],
  });

  await createProduct({
    ...base,
    name: "Gel douche hydratant",
    variants: [{ priceExclTax: 500 }],
    facetValueIds: [fvFlaconId],
  });

  await createProduct({
    ...base,
    name: "Produit inactif solaire",
    active: false,
    variants: [{ priceExclTax: 100 }],
  });
}

beforeEach(async () => {
  await seedSearchData();
});

describe("search service", () => {
  it("recherche simple par terme", async () => {
    const result = await search({ query: "doliprane" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Doliprane 1000mg");
    expect(result.total).toBe(1);
  });

  it("recherche multi-mots (AND)", async () => {
    const result = await search({ query: "crème solaire" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Crème solaire SPF 50");
  });

  it("normalise les accents et la casse dans l'intention", async () => {
    const result = await search({ query: "  CRÈME   solaire " });
    expect(result.intent?.normalizedQuery).toBe("creme solaire");
    expect(result.items[0]?.name).toBe("Crème solaire SPF 50");
  });

  it("recherche par EAN", async () => {
    const result = await search({ query: "3401560000001" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Crème solaire SPF 50");
  });

  it("recherche par SKU", async () => {
    const result = await search({ query: "DOL-1000" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Doliprane 1000mg");
  });

  it("exclut les produits inactifs", async () => {
    const result = await search({ query: "solaire" });
    const names = result.items.map((i) => i.name);
    expect(names).not.toContain("Produit inactif solaire");
  });

  it("recherche combinée avec filtre facette", async () => {
    const result = await search({
      query: "solaire",
      filters: { nature: ["creme"] },
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Crème solaire SPF 50");
  });

  it("compteurs de facettes drill-down", async () => {
    const result = await search({ query: "solaire" });
    const nature = result.facets.find((f) => f.code === "nature");
    expect(nature).toBeDefined();
    const sprayCount = nature?.values.find((v) => v.code === "spray")?.count;
    const cremeCount = nature?.values.find((v) => v.code === "creme")?.count;
    expect(sprayCount).toBe(1);
    expect(cremeCount).toBe(1);
  });

  it("drill-down exclut la facette courante du comptage des autres", async () => {
    const result = await search({
      query: "solaire",
      filters: { nature: ["spray"] },
    });
    const cond = result.facets.find((f) => f.code === "conditionnement");
    expect(cond).toBeDefined();
    const flaconCount = cond?.values.find((v) => v.code === "flacon")?.count;
    expect(flaconCount).toBe(1);
  });

  it("tri par prix croissant", async () => {
    const result = await search({ query: "solaire", sort: "price-asc" });
    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.name).toBe("Spray solaire SPF 30");
    expect(result.items[1]?.name).toBe("Crème solaire SPF 50");
  });

  it("canonicalise les alias configurés avant le retrieval", async () => {
    const result = await search({
      query: "spf",
      searchConfig,
    });
    expect(result.intent?.normalizedQuery).toBe("solaire");
    expect(result.total).toBe(2);
  });

  it("tolère une faute de frappe légère sur le nom produit", async () => {
    const result = await search({ query: "dolipranne" });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Doliprane 1000mg");
  });

  it("tolère une faute de frappe légère sur la marque", async () => {
    const result = await search({ query: "avenne" });
    expect(result.total).toBe(2);
    expect(result.items.every((item) => item.brandName === "Avène")).toBe(true);
  });

  it("expose les entités détectées dans l'intention", async () => {
    const result = await search({
      query: "Avène écran solaire spray",
      searchConfig,
    });

    expect(result.intent?.entities).toEqual({
      brand: ["avene"],
      category: ["solaire"],
      attributeValue: ["spray"],
    });
  });

  it("tri par nom", async () => {
    const result = await search({ query: "solaire", sort: "name" });
    expect(result.items[0]?.name).toBe("Crème solaire SPF 50");
    expect(result.items[1]?.name).toBe("Spray solaire SPF 30");
  });

  it("pagination", async () => {
    const result = await search({ query: "solaire", pageSize: 1, page: 2 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(2);
  });

  it("aucun résultat", async () => {
    const result = await search({ query: "xyznonexistent" });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("query trop courte retourne un résultat vide", async () => {
    const result = await search({ query: "a" });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("hasMultiplePrices est true quand le produit a des prix différents", async () => {
    const result = await search({ query: "doliprane" });
    expect(result.items[0]?.from).toBe(true);
  });

  it("priceValue est le prix TTC minimum", async () => {
    const result = await search({ query: "doliprane" });
    // 250 centimes HT * (10000 + 2000) / 10000 = 300 centimes TTC
    expect(result.items[0]?.priceValue).toBe(300);
  });
});

describe("suggest service", () => {
  it("retourne des suggestions pour un préfixe", async () => {
    const items = await suggest("sol");
    expect(items.length).toBeGreaterThanOrEqual(1);
    const names = items.map((i) => i.name);
    expect(names.some((n) => n.includes("solaire"))).toBe(true);
  });

  it("retourne un tableau vide pour un terme trop court", async () => {
    const items = await suggest("a");
    expect(items).toHaveLength(0);
  });

  it("normalise les accents et la casse pour les suggestions", async () => {
    const items = await suggest("SOL");
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("limite le nombre de suggestions", async () => {
    const items = await suggest("sol", 1);
    expect(items).toHaveLength(1);
  });

  it("exclut les produits inactifs", async () => {
    const items = await suggest("inactif");
    expect(items).toHaveLength(0);
  });
});
