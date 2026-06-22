import { getCart, type CartVM } from "@pharmacie/core/modules/cart";
import { getCartId } from "./cart-session";
import { formatPrice } from "./catalog";

export interface CartPageLineVM {
  variantId: string;
  productName: string;
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
  itemCount: number;
  isEmpty: boolean;
}

function toPageVM(cart: CartVM): CartPageVM {
  return {
    lines: cart.lines.map((line) => ({
      variantId: line.variantId,
      productName: line.productName,
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
    itemCount: cart.totals.itemCount,
    isEmpty: cart.lines.length === 0,
  };
}

const EMPTY_CART: CartPageVM = {
  lines: [],
  totalExclTaxLabel: formatPrice(0),
  totalTaxLabel: formatPrice(0),
  totalInclTaxLabel: formatPrice(0),
  itemCount: 0,
  isEmpty: true,
};

export async function getCartPageVM(): Promise<CartPageVM> {
  const cartId = await getCartId();
  if (!cartId) return EMPTY_CART;

  const cart = await getCart(cartId);
  if (!cart) return EMPTY_CART;

  return toPageVM(cart);
}
