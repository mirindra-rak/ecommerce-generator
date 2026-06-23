import { describe, expect, it } from "vitest";
import type { CatalogPriceRuleWithTargets } from "./promotion.repository";
import { matchesContext, resolvePrice, resolvePrices } from "./promotion.service";
import type { TaxRateSnapshot } from "../pricing/pricing.service";
import type { ProductContext } from "./promotion.types";

const taxRate20: TaxRateSnapshot = {
  id: "fr-standard",
  code: "FR_STANDARD_20",
  name: "TVA 20%",
  rateBps: 2000,
};

function makeRule(
  overrides: Partial<CatalogPriceRuleWithTargets> & {
    targetType?: CatalogPriceRuleWithTargets["targetType"];
    discountType?: CatalogPriceRuleWithTargets["discountType"];
    discountValue?: number;
  } = {},
): CatalogPriceRuleWithTargets {
  return {
    id: "rule-1",
    name: "Test rule",
    active: true,
    startDate: null,
    endDate: null,
    priority: 0,
    targetType: "ALL",
    discountType: "PERCENTAGE",
    discountValue: 1000,
    floorPrice: null,
    customerLabel: null,
    showStrikethrough: true,
    targets: [],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("resolvePrice", () => {
  it("scénario 1 — aucune règle applicable → pas de réduction", () => {
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, []);

    expect(result.originalPriceExclTax).toBe(1000);
    expect(result.finalPriceExclTax).toBe(1000);
    expect(result.discount).toBeNull();
    expect(result.originalBreakdown.priceInclTax).toBe(1200);
    expect(result.finalBreakdown.priceInclTax).toBe(1200);
  });

  it("scénario 2 — réduction pourcentage 20%", () => {
    const rule = makeRule({ discountType: "PERCENTAGE", discountValue: 2000 });
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [rule]);

    expect(result.finalPriceExclTax).toBe(800);
    expect(result.discount).toEqual({
      type: "PERCENTAGE",
      value: 2000,
      amount: 200,
      ruleId: "rule-1",
      customerLabel: null,
    });
    expect(result.finalBreakdown.priceInclTax).toBe(960);
  });

  it("scénario 3 — réduction montant fixe 3€", () => {
    const rule = makeRule({ discountType: "FIXED_AMOUNT", discountValue: 300 });
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [rule]);

    expect(result.finalPriceExclTax).toBe(700);
    expect(result.discount?.amount).toBe(300);
  });

  it("scénario 4 — prix plancher", () => {
    const rule = makeRule({
      discountType: "PERCENTAGE",
      discountValue: 5000,
      floorPrice: 600,
    });
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [rule]);

    expect(result.finalPriceExclTax).toBe(600);
    expect(result.discount?.amount).toBe(400);
  });

  it("scénario 5 — priorité : la plus haute gagne", () => {
    const lowPrio = makeRule({
      id: "low",
      priority: 10,
      discountType: "PERCENTAGE",
      discountValue: 1000,
    });
    const highPrio = makeRule({
      id: "high",
      priority: 20,
      discountType: "PERCENTAGE",
      discountValue: 500,
    });

    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [highPrio, lowPrio]);

    expect(result.discount?.ruleId).toBe("high");
    expect(result.discount?.value).toBe(500);
    expect(result.finalPriceExclTax).toBe(950);
  });

  it("scénario 6 — règle avec startDate futur → ignorée", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rule = makeRule({ startDate: tomorrow });
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [rule]);

    expect(result.discount).toBeNull();
    expect(result.finalPriceExclTax).toBe(1000);
  });

  it("règle avec endDate passée → ignorée", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const rule = makeRule({ endDate: yesterday });
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [rule]);

    expect(result.discount).toBeNull();
  });

  it("réduction fixe supérieure au prix → plancher à 0", () => {
    const rule = makeRule({ discountType: "FIXED_AMOUNT", discountValue: 2000 });
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [rule]);

    expect(result.finalPriceExclTax).toBe(0);
    expect(result.discount?.amount).toBe(1000);
  });

  it("arrondi pourcentage cohérent avec le pricing (Math.round)", () => {
    const rule = makeRule({ discountType: "PERCENTAGE", discountValue: 3333 });
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [rule]);

    expect(result.finalPriceExclTax).toBe(667);
    expect(result.discount?.amount).toBe(333);
  });

  it("customerLabel est propagé dans le DiscountDetail", () => {
    const rule = makeRule({ customerLabel: "Soldes d'été" });
    const result = resolvePrice({ priceExclTax: 1000 }, taxRate20, [rule]);

    expect(result.discount?.customerLabel).toBe("Soldes d'été");
  });
});

describe("matchesContext", () => {
  const ctx: ProductContext = {
    productId: "prod-1",
    categoryIds: ["cat-a", "cat-b"],
    brandId: "brand-x",
  };

  it("ALL matche tout", () => {
    expect(matchesContext(makeRule({ targetType: "ALL" }), ctx)).toBe(true);
  });

  it("CATEGORY matche si une catégorie du produit est ciblée", () => {
    const rule = makeRule({
      targetType: "CATEGORY",
      targets: [{ id: "t1", ruleId: "rule-1", targetId: "cat-a" }],
    });
    expect(matchesContext(rule, ctx)).toBe(true);
  });

  it("CATEGORY ne matche pas si aucune catégorie commune", () => {
    const rule = makeRule({
      targetType: "CATEGORY",
      targets: [{ id: "t1", ruleId: "rule-1", targetId: "cat-other" }],
    });
    expect(matchesContext(rule, ctx)).toBe(false);
  });

  it("PRODUCT matche par productId", () => {
    const rule = makeRule({
      targetType: "PRODUCT",
      targets: [{ id: "t1", ruleId: "rule-1", targetId: "prod-1" }],
    });
    expect(matchesContext(rule, ctx)).toBe(true);
  });

  it("BRAND matche par brandId", () => {
    const rule = makeRule({
      targetType: "BRAND",
      targets: [{ id: "t1", ruleId: "rule-1", targetId: "brand-x" }],
    });
    expect(matchesContext(rule, ctx)).toBe(true);
  });

  it("BRAND ne matche pas si brandId est null", () => {
    const rule = makeRule({
      targetType: "BRAND",
      targets: [{ id: "t1", ruleId: "rule-1", targetId: "brand-x" }],
    });
    expect(matchesContext(rule, { ...ctx, brandId: null })).toBe(false);
  });
});

describe("resolvePrices", () => {
  it("scénario 7 — résolution batch correcte", () => {
    const catRule = makeRule({
      id: "cat-rule",
      targetType: "CATEGORY",
      discountType: "PERCENTAGE",
      discountValue: 1000,
      priority: 5,
      targets: [{ id: "t1", ruleId: "cat-rule", targetId: "cat-promo" }],
    });
    const brandRule = makeRule({
      id: "brand-rule",
      targetType: "BRAND",
      discountType: "FIXED_AMOUNT",
      discountValue: 200,
      priority: 10,
      targets: [{ id: "t2", ruleId: "brand-rule", targetId: "brand-y" }],
    });

    const products = Array.from({ length: 20 }, (_, i) => ({
      productId: `prod-${i}`,
      variants: [{ priceExclTax: 1000 }],
      taxRate: taxRate20,
      context: {
        productId: `prod-${i}`,
        categoryIds: i < 10 ? ["cat-promo"] : ["cat-other"],
        brandId: i >= 15 ? "brand-y" : null,
      } satisfies ProductContext,
    }));

    const result = resolvePrices(products, [brandRule, catRule]);

    // prod-0..9: cat-promo → catRule (-10%) → 900
    expect(result.get("prod-0")![0]!.finalPriceExclTax).toBe(900);
    expect(result.get("prod-5")![0]!.discount?.ruleId).toBe("cat-rule");

    // prod-10..14: no match → no discount
    expect(result.get("prod-12")![0]!.discount).toBeNull();
    expect(result.get("prod-12")![0]!.finalPriceExclTax).toBe(1000);

    // prod-15..19: brand-y → brandRule (-200cts, higher prio) → 800
    expect(result.get("prod-17")![0]!.finalPriceExclTax).toBe(800);
    expect(result.get("prod-17")![0]!.discount?.ruleId).toBe("brand-rule");

    expect(result.size).toBe(20);
  });
});
