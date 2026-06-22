import type { DiscountType, TargetType } from "@prisma/client";
import type { PriceBreakdown } from "../pricing/pricing.service";

export type { DiscountType, TargetType } from "@prisma/client";

export interface CreateCatalogPriceRuleInput {
  name: string;
  active?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  priority?: number;
  targetType: TargetType;
  discountType: DiscountType;
  discountValue: number;
  floorPrice?: number | null;
  customerLabel?: string | null;
  showStrikethrough?: boolean;
  targetIds: string[];
}

export interface UpdateCatalogPriceRuleInput {
  name?: string;
  active?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  priority?: number;
  targetType?: TargetType;
  discountType?: DiscountType;
  discountValue?: number;
  floorPrice?: number | null;
  customerLabel?: string | null;
  showStrikethrough?: boolean;
  targetIds?: string[];
}

export interface ProductContext {
  productId: string;
  categoryIds: string[];
  brandId: string | null;
}

export interface DiscountDetail {
  type: DiscountType;
  value: number;
  amount: number;
  ruleId: string;
  customerLabel: string | null;
}

export interface ResolvedPrice {
  originalPriceExclTax: number;
  finalPriceExclTax: number;
  originalBreakdown: PriceBreakdown;
  finalBreakdown: PriceBreakdown;
  discount: DiscountDetail | null;
}
