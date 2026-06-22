export interface CartLineItem {
  id: string;
  variantId: string;
  quantity: number;
  priceExclTax: number;
  taxRateBps: number;
  priceInclTax: number;
}

export interface CartLineVM {
  id: string;
  variantId: string;
  productName: string;
  productSlug: string;
  variantLabel: string | null;
  imageKey: string | null;
  quantity: number;
  unitPriceExclTax: number;
  unitPriceInclTax: number;
  taxRateBps: number;
  lineTotalExclTax: number;
  lineTotalInclTax: number;
}

export interface CartTotals {
  totalExclTax: number;
  totalTax: number;
  totalInclTax: number;
  itemCount: number;
}

export interface CartVM {
  id: string;
  lines: CartLineVM[];
  totals: CartTotals;
}
