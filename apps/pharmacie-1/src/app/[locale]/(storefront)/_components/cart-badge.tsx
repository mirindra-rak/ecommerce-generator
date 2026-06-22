import { getTranslations } from "next-intl/server";
import { getCartId } from "@/lib/cart-session";
import { getCartItemCount } from "@pharmacie/core/modules/cart";
import { CartBadgeButton } from "./cart-badge-button";

export async function CartBadge() {
  const t = await getTranslations("header");
  const cartId = await getCartId();
  const count = cartId ? await getCartItemCount(cartId) : 0;

  return <CartBadgeButton count={count} label={t("cart")} />;
}
