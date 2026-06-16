import { describe, expect, it, vi } from "vitest";

// Mock de la couche données : le sitemap est testé en pur (aucune dépendance Prisma/DB).
vi.mock("@/lib/catalog", () => ({
  getSitemapCategories: async () => [{ slug: "visage", updatedAt: new Date("2026-01-01") }],
  getSitemapProducts: async () => [{ slug: "creme-hydratante", updatedAt: new Date("2026-02-01") }],
}));

import sitemap from "./sitemap";

describe("sitemap", () => {
  it("liste home + catégories + produits, chacun décliné par locale", async () => {
    const entries = await sitemap();

    // home + 1 catégorie + 1 produit
    expect(entries).toHaveLength(3);

    for (const item of entries) {
      const languages = item.alternates?.languages ?? {};
      expect(Object.keys(languages)).toEqual(expect.arrayContaining(["fr", "en", "x-default"]));
    }

    expect(entries.some((e) => e.url.includes("/categorie/visage"))).toBe(true);
    expect(entries.some((e) => e.url.includes("/produit/creme-hydratante"))).toBe(true);
  });

  it("n'expose jamais d'URL de back-office", async () => {
    const entries = await sitemap();
    for (const item of entries) {
      expect(item.url).not.toContain("/admin");
      expect(item.url).not.toContain("/api");
    }
  });

  it("propage la date de dernière modification", async () => {
    const entries = await sitemap();
    const product = entries.find((e) => e.url.includes("/produit/creme-hydratante"));
    expect(product?.lastModified).toEqual(new Date("2026-02-01"));
  });
});
