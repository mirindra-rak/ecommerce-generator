import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { cartRepository, createCart, mergeOnLogin } from "@pharmacie/core/modules/cart";
import { getSession } from "./auth";

const CART_COOKIE = "cart_session";
const CART_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function getCartId(): Promise<string | null> {
  const session = await getSession();
  const cookieStore = await cookies();
  const cartToken = cookieStore.get(CART_COOKIE)?.value ?? null;

  if (session?.user) {
    const userCart = await cartRepository.findByUserId(session.user.id);

    if (cartToken) {
      const anonCart = await cartRepository.findBySessionToken(cartToken);
      if (anonCart && anonCart.items.length > 0) {
        const mergedId = await mergeOnLogin(anonCart.id, session.user.id);
        cookieStore.delete(CART_COOKIE);
        return mergedId;
      }
      if (anonCart) {
        await cartRepository.deleteCart(anonCart.id);
      }
      cookieStore.delete(CART_COOKIE);
    }

    return userCart?.id ?? null;
  }

  if (cartToken) {
    const cart = await cartRepository.findBySessionToken(cartToken);
    return cart?.id ?? null;
  }

  return null;
}

export async function getOrCreateCartId(): Promise<string> {
  const existing = await getCartId();
  if (existing) return existing;

  const session = await getSession();
  const cookieStore = await cookies();

  if (session?.user) {
    const cart = await createCart({ userId: session.user.id });
    return cart.id;
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
