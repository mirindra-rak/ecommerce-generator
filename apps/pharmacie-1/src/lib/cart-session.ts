import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { cartRepository, createCart, mergeOnLogin } from "@pharmacie/core/modules/cart";
import { getSession } from "./auth";

const CART_COOKIE = "cart_session";
const CART_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Read-only — safe to call from Server Components.
 * Returns the user's cart if logged in, or the anonymous cart from cookie.
 * Does NOT merge or mutate cookies.
 */
export async function getCartId(): Promise<string | null> {
  const session = await getSession();
  const cookieStore = await cookies();
  const cartToken = cookieStore.get(CART_COOKIE)?.value ?? null;

  if (session?.user) {
    const userCart = await cartRepository.findByUserId(session.user.id);
    return userCart?.id ?? null;
  }

  if (cartToken) {
    const cart = await cartRepository.findBySessionToken(cartToken);
    return cart?.id ?? null;
  }

  return null;
}

/**
 * Merge anonymous cart into user cart and clean up the cookie.
 * Must only be called from a Server Action or Route Handler.
 */
async function mergeAnonCartIfNeeded(userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const cartToken = cookieStore.get(CART_COOKIE)?.value ?? null;
  if (!cartToken) return null;

  const anonCart = await cartRepository.findBySessionToken(cartToken);
  let mergedId: string | null = null;

  if (anonCart && anonCart.items.length > 0) {
    mergedId = await mergeOnLogin(anonCart.id, userId);
  } else if (anonCart) {
    await cartRepository.deleteCart(anonCart.id);
  }

  cookieStore.delete(CART_COOKIE);
  return mergedId;
}

export async function getOrCreateCartId(): Promise<string> {
  const session = await getSession();
  const cookieStore = await cookies();

  if (session?.user) {
    const merged = await mergeAnonCartIfNeeded(session.user.id);
    if (merged) return merged;

    const userCart = await cartRepository.findByUserId(session.user.id);
    if (userCart) return userCart.id;

    const cart = await createCart({ userId: session.user.id });
    return cart.id;
  }

  const cartToken = cookieStore.get(CART_COOKIE)?.value ?? null;
  if (cartToken) {
    const cart = await cartRepository.findBySessionToken(cartToken);
    if (cart) return cart.id;
  }

  const token = createId();
  const cart = await createCart({ sessionToken: token });
  cookieStore.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
  return cart.id;
}
