"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { addToCartAction } from "../_actions/cart-actions";
import { useCartDrawer } from "./cart-drawer-provider";
import { CartIcon } from "./icons";

interface AddToCartButtonProps {
  variantId: string;
  variant?: "full" | "icon";
  productName?: string;
}

export function AddToCartButton({
  variantId,
  variant = "full",
  productName,
}: AddToCartButtonProps) {
  const t = useTranslations("cart");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { openDrawer } = useCartDrawer();

  function handleClick() {
    startTransition(async () => {
      const result = await addToCartAction(variantId);
      if (result.success) {
        router.refresh();
        openDrawer("added");
      }
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={t("addToCart", { name: productName ?? "" })}
        className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <CartIcon className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <CartIcon className="h-5 w-5" />
      )}
      {t("addToCartButton")}
    </button>
  );
}
