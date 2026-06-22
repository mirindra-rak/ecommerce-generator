"use server";

import {
  addItem,
  updateItemQty,
  removeItem,
  ItemNotAvailableError,
} from "@pharmacie/core/modules/cart";
import { getOrCreateCartId } from "@/lib/cart-session";
import { revalidatePath } from "next/cache";

export interface CartActionResult {
  success: boolean;
  error?: string;
}

export async function addToCartAction(variantId: string): Promise<CartActionResult> {
  try {
    const cartId = await getOrCreateCartId();
    await addItem(cartId, variantId, 1);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof ItemNotAvailableError) {
      return { success: false, error: "outOfStock" };
    }
    console.error("[Cart] addToCart failed:", error);
    return { success: false, error: "unknown" };
  }
}

export async function updateCartItemAction(
  variantId: string,
  quantity: number,
): Promise<CartActionResult> {
  try {
    const cartId = await getOrCreateCartId();
    await updateItemQty(cartId, variantId, quantity);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof ItemNotAvailableError) {
      return { success: false, error: "outOfStock" };
    }
    console.error("[Cart] updateCartItem failed:", error);
    return { success: false, error: "unknown" };
  }
}

export async function removeCartItemAction(variantId: string): Promise<CartActionResult> {
  try {
    const cartId = await getOrCreateCartId();
    await removeItem(cartId, variantId);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[Cart] removeCartItem failed:", error);
    return { success: false, error: "unknown" };
  }
}
