import { calculatePriceBreakdown } from "../pricing/pricing.service";
import type { TaxRateSnapshot } from "../pricing/pricing.service";
import type { CatalogPriceRuleWithTargets } from "./promotion.repository";
import type { DiscountDetail, ProductContext, ResolvedPrice } from "./promotion.types";

function isDateValid(rule: CatalogPriceRuleWithTargets, now: Date): boolean {
  if (rule.startDate && rule.startDate > now) return false;
  if (rule.endDate && rule.endDate < now) return false;
  return true;
}

export function matchesContext(rule: CatalogPriceRuleWithTargets, ctx: ProductContext): boolean {
  switch (rule.targetType) {
    case "ALL":
      return true;
    case "PRODUCT":
      return rule.targets.some((t) => t.targetId === ctx.productId);
    case "CATEGORY":
      return rule.targets.some((t) => ctx.categoryIds.includes(t.targetId));
    case "BRAND":
      return ctx.brandId !== null && rule.targets.some((t) => t.targetId === ctx.brandId);
  }
}

function calculateDiscount(priceExclTax: number, rule: CatalogPriceRuleWithTargets): number {
  let discountAmount: number;

  if (rule.discountType === "PERCENTAGE") {
    discountAmount = Math.round((priceExclTax * rule.discountValue) / 10000);
  } else {
    discountAmount = Math.min(rule.discountValue, priceExclTax);
  }

  let finalPrice = priceExclTax - discountAmount;

  if (rule.floorPrice !== null && finalPrice < rule.floorPrice) {
    finalPrice = rule.floorPrice;
    discountAmount = priceExclTax - finalPrice;
  }

  if (finalPrice < 0) {
    finalPrice = 0;
    discountAmount = priceExclTax;
  }

  return discountAmount;
}

export function resolvePrice(
  variant: { priceExclTax: number },
  taxRate: TaxRateSnapshot,
  rules: CatalogPriceRuleWithTargets[],
): ResolvedPrice {
  const originalBreakdown = calculatePriceBreakdown(variant.priceExclTax, taxRate);
  const now = new Date();

  const applicableRule = rules.find((r) => r.active && isDateValid(r, now));

  if (!applicableRule) {
    return {
      originalPriceExclTax: variant.priceExclTax,
      finalPriceExclTax: variant.priceExclTax,
      originalBreakdown,
      finalBreakdown: originalBreakdown,
      discount: null,
    };
  }

  const discountAmount = calculateDiscount(variant.priceExclTax, applicableRule);
  const finalPriceExclTax = variant.priceExclTax - discountAmount;
  const finalBreakdown = calculatePriceBreakdown(finalPriceExclTax, taxRate);

  const discount: DiscountDetail = {
    type: applicableRule.discountType,
    value: applicableRule.discountValue,
    amount: discountAmount,
    ruleId: applicableRule.id,
    customerLabel: applicableRule.customerLabel,
  };

  return {
    originalPriceExclTax: variant.priceExclTax,
    finalPriceExclTax,
    originalBreakdown,
    finalBreakdown,
    discount,
  };
}

export function resolvePrices(
  products: Array<{
    productId: string;
    variants: Array<{ priceExclTax: number }>;
    taxRate: TaxRateSnapshot;
    context: ProductContext;
  }>,
  rules: CatalogPriceRuleWithTargets[],
): Map<string, ResolvedPrice[]> {
  const result = new Map<string, ResolvedPrice[]>();

  for (const product of products) {
    const matchingRules = rules.filter((r) => matchesContext(r, product.context));
    const resolved = product.variants.map((v) => resolvePrice(v, product.taxRate, matchingRules));
    result.set(product.productId, resolved);
  }

  return result;
}
