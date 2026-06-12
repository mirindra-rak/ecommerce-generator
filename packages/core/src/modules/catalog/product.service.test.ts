import { describe, expect, it } from "vitest";
import { isDisplayable, priceRange, resolveVariant } from "./product.service";

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
