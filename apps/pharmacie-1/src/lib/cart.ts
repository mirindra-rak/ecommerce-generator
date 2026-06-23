import { getCart, type CartVM } from "@pharmacie/core/modules/cart";
import { getCartId } from "./cart-session";
import { formatPrice } from "./catalog";

export interface CartPageLineVM {
  variantId: string;
  productName: string;
  brandName: string | null;
  productSlug: string;
  variantLabel: string | null;
  imageKey: string | null;
  quantity: number;
  unitPriceLabel: string;
  lineTotalLabel: string;
}

export interface CartPageVM {
  lines: CartPageLineVM[];
  totalExclTaxLabel: string;
  totalTaxLabel: string;
  totalInclTaxLabel: string;
  totalInclTaxValue: number;
  itemCount: number;
  freeShippingRemainingCents: number;
  freeShippingRemainingLabel: string;
  isEmpty: boolean;
}

const FREE_SHIPPING_THRESHOLD_CENTS = 4900;

function toPageVM(cart: CartVM): CartPageVM {
  return {
    lines: cart.lines.map((line) => ({
      variantId: line.variantId,
      productName: line.productName,
      brandName: line.brandName,
      productSlug: line.productSlug,
      variantLabel: line.variantLabel,
      imageKey: line.imageKey,
      quantity: line.quantity,
      unitPriceLabel: formatPrice(line.unitPriceInclTax),
      lineTotalLabel: formatPrice(line.lineTotalInclTax),
    })),
    totalExclTaxLabel: formatPrice(cart.totals.totalExclTax),
    totalTaxLabel: formatPrice(cart.totals.totalTax),
    totalInclTaxLabel: formatPrice(cart.totals.totalInclTax),
    totalInclTaxValue: cart.totals.totalInclTax,
    itemCount: cart.totals.itemCount,
    freeShippingRemainingCents: Math.max(
      FREE_SHIPPING_THRESHOLD_CENTS - cart.totals.totalInclTax,
      0,
    ),
    freeShippingRemainingLabel: formatPrice(
      Math.max(FREE_SHIPPING_THRESHOLD_CENTS - cart.totals.totalInclTax, 0),
    ),
    isEmpty: cart.lines.length === 0,
  };
}

export const EMPTY_CART: CartPageVM = {
  lines: [],
  totalExclTaxLabel: formatPrice(0),
  totalTaxLabel: formatPrice(0),
  totalInclTaxLabel: formatPrice(0),
  totalInclTaxValue: 0,
  itemCount: 0,
  freeShippingRemainingCents: FREE_SHIPPING_THRESHOLD_CENTS,
  freeShippingRemainingLabel: formatPrice(FREE_SHIPPING_THRESHOLD_CENTS),
  isEmpty: true,
};

export async function getCartPageVM(): Promise<CartPageVM> {
  const cartId = await getCartId();
  if (!cartId) return EMPTY_CART;

  const cart = await getCart(cartId);
  if (!cart) return EMPTY_CART;

  return toPageVM(cart);
}
