import type { TaxRate } from "@prisma/client";
import { InvalidMoneyAmountError, InvalidTaxRateError } from "./pricing-errors";

export interface TaxRateSnapshot {
  id: string;
  code: string;
  name: string;
  rateBps: number;
}

export interface PriceBreakdown {
  priceExclTax: number;
  taxAmount: number;
  priceInclTax: number;
  taxRate: TaxRateSnapshot;
}

export interface PriceBreakdownRange {
  min: PriceBreakdown;
  max: PriceBreakdown;
}

function assertMoneyAmount(amount: number): void {
  if (!Number.isInteger(amount) || amount < 0) throw new InvalidMoneyAmountError(amount);
}

function assertTaxRate(rateBps: number): void {
  if (!Number.isInteger(rateBps) || rateBps < 0 || rateBps > 10000) {
    throw new InvalidTaxRateError(`Invalid tax rate basis points: ${rateBps}`);
  }
}

function toSnapshot(taxRate: Pick<TaxRate, "id" | "code" | "name" | "rateBps">): TaxRateSnapshot {
  assertTaxRate(taxRate.rateBps);
  return {
    id: taxRate.id,
    code: taxRate.code,
    name: taxRate.name,
    rateBps: taxRate.rateBps,
  };
}

export function calculateTaxAmount(priceExclTax: number, rateBps: number): number {
  assertMoneyAmount(priceExclTax);
  assertTaxRate(rateBps);
  return Math.round((priceExclTax * rateBps) / 10000);
}

export function calculatePriceBreakdown(
  priceExclTax: number,
  taxRate: Pick<TaxRate, "id" | "code" | "name" | "rateBps">,
): PriceBreakdown {
  const snapshot = toSnapshot(taxRate);
  const taxAmount = calculateTaxAmount(priceExclTax, snapshot.rateBps);
  return {
    priceExclTax,
    taxAmount,
    priceInclTax: priceExclTax + taxAmount,
    taxRate: snapshot,
  };
}

export function calculatePriceRange(
  variants: ReadonlyArray<{ priceExclTax: number }>,
  taxRate: Pick<TaxRate, "id" | "code" | "name" | "rateBps">,
): PriceBreakdownRange | null {
  const first = variants[0];
  if (!first) return null;

  let min = first.priceExclTax;
  let max = first.priceExclTax;
  for (const variant of variants) {
    assertMoneyAmount(variant.priceExclTax);
    if (variant.priceExclTax < min) min = variant.priceExclTax;
    if (variant.priceExclTax > max) max = variant.priceExclTax;
  }

  return {
    min: calculatePriceBreakdown(min, taxRate),
    max: calculatePriceBreakdown(max, taxRate),
  };
}
