import { calculatePriceBreakdown } from "../pricing";
import { isAvailable } from "../inventory";
import { cartRepository } from "./cart.repository";
import { ItemNotAvailableError } from "./cart-errors";
import type { CartLineVM, CartTotals, CartVM } from "./cart.types";

export async function createCart(opts: { sessionToken?: string; userId?: string }) {
  return cartRepository.create(opts);
}

export async function addItem(cartId: string, variantId: string, quantity: number): Promise<void> {
  const available = await isAvailable(variantId, quantity);
  if (!available) throw new ItemNotAvailableError(variantId);

  const { prisma } = await import("../../db/client");
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { taxRate: true } } },
  });
  if (!variant) throw new ItemNotAvailableError(variantId);

  const breakdown = calculatePriceBreakdown(variant.priceExclTax, variant.product.taxRate);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });

  const newQty = existing ? existing.quantity + quantity : quantity;
  await cartRepository.upsertItem(cartId, variantId, newQty, {
    priceExclTax: breakdown.priceExclTax,
    taxRateBps: breakdown.taxRate.rateBps,
    priceInclTax: breakdown.priceInclTax,
  });
}

export async function updateItemQty(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<void> {
  if (quantity <= 0) {
    await cartRepository.removeItem(cartId, variantId);
    return;
  }

  const available = await isAvailable(variantId, quantity);
  if (!available) throw new ItemNotAvailableError(variantId);

  await cartRepository.updateItemQty(cartId, variantId, quantity);
}

export async function removeItem(cartId: string, variantId: string): Promise<void> {
  await cartRepository.removeItem(cartId, variantId);
}

export async function clearCart(cartId: string): Promise<void> {
  await cartRepository.clearItems(cartId);
}

export async function getCart(cartId: string): Promise<CartVM | null> {
  const cart = await cartRepository.findById(cartId);
  if (!cart) return null;

  const lines: CartLineVM[] = cart.items.map((item) => ({
    id: item.id,
    variantId: item.variantId,
    productName: item.variant.product.name,
    productSlug: item.variant.product.slug,
    variantLabel: item.variant.volume,
    imageKey: item.variant.product.media[0]?.storageKey ?? null,
    quantity: item.quantity,
    unitPriceExclTax: item.priceExclTax,
    unitPriceInclTax: item.priceInclTax,
    taxRateBps: item.taxRateBps,
    lineTotalExclTax: item.priceExclTax * item.quantity,
    lineTotalInclTax: item.priceInclTax * item.quantity,
  }));

  const totals: CartTotals = lines.reduce(
    (acc, line) => ({
      totalExclTax: acc.totalExclTax + line.lineTotalExclTax,
      totalTax: acc.totalTax + (line.lineTotalInclTax - line.lineTotalExclTax),
      totalInclTax: acc.totalInclTax + line.lineTotalInclTax,
      itemCount: acc.itemCount + line.quantity,
    }),
    { totalExclTax: 0, totalTax: 0, totalInclTax: 0, itemCount: 0 } as CartTotals,
  );

  return { id: cart.id, lines, totals };
}

export async function getCartItemCount(cartId: string): Promise<number> {
  return cartRepository.getItemCount(cartId);
}

export async function mergeOnLogin(anonymousCartId: string, userId: string): Promise<string> {
  let userCart = await cartRepository.findByUserId(userId);
  if (!userCart) {
    userCart = await cartRepository.create({ userId });
  }
  await cartRepository.mergeAnonymousIntoUser(anonymousCartId, userCart.id);
  return userCart.id;
}
