import { describe, expect, it } from "vitest";
import { paginate, parseSort, sortCards } from "./category-listing";

const standardTaxRate = {
  id: "tax-fr-normal-20",
  code: "FR_STANDARD_20",
  name: "TVA standard 20 %",
  rateBps: 2000,
};

const card = (name: string, ...prices: number[]) => ({
  name,
  variants: prices.map((priceExclTax) => ({ priceExclTax })),
  taxRate: standardTaxRate,
});

describe("parseSort", () => {
  it("accepte les clés de tri connues", () => {
    expect(parseSort("price-asc")).toBe("price-asc");
    expect(parseSort("name")).toBe("name");
  });

  it("replie toute valeur inconnue ou absente sur 'new'", () => {
    expect(parseSort(undefined)).toBe("new");
    expect(parseSort("bogus")).toBe("new");
    expect(parseSort("")).toBe("new");
  });
});

describe("sortCards", () => {
  const cards = [card("Zinc", 1500), card("Aloès", 900, 1200), card("Crème", 2000)];

  it("préserve l'ordre d'entrée pour 'new'", () => {
    expect(sortCards(cards, "new", "fr").map((c) => c.name)).toEqual(["Zinc", "Aloès", "Crème"]);
  });

  it("trie par nom de façon locale-aware (accents FR)", () => {
    expect(sortCards(cards, "name", "fr").map((c) => c.name)).toEqual(["Aloès", "Crème", "Zinc"]);
  });

  it("trie par prix « à partir de » croissant", () => {
    expect(sortCards(cards, "price-asc", "fr").map((c) => c.name)).toEqual([
      "Aloès",
      "Zinc",
      "Crème",
    ]);
  });

  it("trie par prix décroissant", () => {
    expect(sortCards(cards, "price-desc", "fr").map((c) => c.name)).toEqual([
      "Crème",
      "Zinc",
      "Aloès",
    ]);
  });

  it("ne mute pas le tableau source", () => {
    const original = [...cards];
    sortCards(cards, "name", "fr");
    expect(cards).toEqual(original);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it("découpe la première page", () => {
    const result = paginate(items, 1, 10);
    expect(result.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result).toMatchObject({ page: 1, total: 25, totalPages: 3 });
  });

  it("découpe une page intermédiaire", () => {
    expect(paginate(items, 2, 10).items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("clampe une page hors borne haute sur la dernière page", () => {
    const result = paginate(items, 99, 10);
    expect(result.page).toBe(3);
    expect(result.items).toEqual([21, 22, 23, 24, 25]);
  });

  it("clampe une page invalide ou < 1 sur la première page", () => {
    expect(paginate(items, 0, 10).page).toBe(1);
    expect(paginate(items, -5, 10).page).toBe(1);
  });

  it("renvoie totalPages = 1 sur un jeu vide", () => {
    expect(paginate([], 1, 10)).toMatchObject({ items: [], total: 0, totalPages: 1, page: 1 });
  });
});
