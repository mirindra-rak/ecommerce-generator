import { describe, expect, it } from "vitest";
import { DEFAULT_TAX_RATE_ID, TAX_RATE_REFERENCES } from "./tax-rate.constants";
import {
  calculatePriceBreakdown,
  calculatePriceRange,
  calculateTaxAmount,
} from "./pricing.service";
import { InvalidMoneyAmountError, InvalidTaxRateError } from "./pricing-errors";

const standardTaxRate = TAX_RATE_REFERENCES.find((taxRate) => taxRate.id === DEFAULT_TAX_RATE_ID);
if (!standardTaxRate) throw new Error("default tax rate missing");

describe("calculateTaxAmount", () => {
  it("calcule la TVA en centimes avec arrondi centralisé", () => {
    expect(calculateTaxAmount(1283, 2000)).toBe(257);
    expect(calculateTaxAmount(1412, 550)).toBe(78);
    expect(calculateTaxAmount(863, 1000)).toBe(86);
    expect(calculateTaxAmount(600, 0)).toBe(0);
  });

  it("rejette les montants ou taux invalides", () => {
    expect(() => calculateTaxAmount(-1, 2000)).toThrow(InvalidMoneyAmountError);
    expect(() => calculateTaxAmount(100, -1)).toThrow(InvalidTaxRateError);
    expect(() => calculateTaxAmount(100, 10001)).toThrow(InvalidTaxRateError);
  });
});

describe("calculatePriceBreakdown", () => {
  it("retourne un breakdown complet HT / TVA / TTC", () => {
    expect(calculatePriceBreakdown(1283, standardTaxRate)).toEqual({
      priceExclTax: 1283,
      taxAmount: 257,
      priceInclTax: 1540,
      taxRate: {
        id: standardTaxRate.id,
        code: standardTaxRate.code,
        name: standardTaxRate.name,
        rateBps: standardTaxRate.rateBps,
      },
    });
  });
});

describe("calculatePriceRange", () => {
  it("retourne la fourchette TTC d'un produit multi-variantes", () => {
    const range = calculatePriceRange(
      [{ priceExclTax: 1490 }, { priceExclTax: 2290 }],
      standardTaxRate,
    );

    expect(range?.min.priceInclTax).toBe(1788);
    expect(range?.max.priceInclTax).toBe(2748);
  });

  it("retourne null sans variante", () => {
    expect(calculatePriceRange([], standardTaxRate)).toBeNull();
  });
});
