import { getTranslations } from "next-intl/server";
import { IconButton } from "@pharmacie/ui";
import { Link } from "@/i18n/navigation";
import { getCartId } from "@/lib/cart-session";
import { getCartItemCount } from "@pharmacie/core/modules/cart";
import { CartIcon } from "./icons";

export async function CartBadge() {
  const t = await getTranslations("header");
  const cartId = await getCartId();
  const count = cartId ? await getCartItemCount(cartId) : 0;

  return (
    <Link href="/panier">
      <IconButton label={t("cart")}>
        <CartIcon className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-sm bg-accent-600 px-1 text-[10px] font-semibold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </IconButton>
    </Link>
  );
}
