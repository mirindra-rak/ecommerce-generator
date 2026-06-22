"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { Link } from "@/i18n/navigation";
import type { CartPageLineVM } from "@/lib/cart";
import { updateCartItemAction, removeCartItemAction } from "../_actions/cart-actions";

export function CartLineRow({ line }: { line: CartPageLineVM }) {
  const t = useTranslations("cart");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleQtyChange(delta: number) {
    const newQty = line.quantity + delta;
    startTransition(async () => {
      if (newQty <= 0) {
        const result = await removeCartItemAction(line.variantId);
        if (result.success) router.refresh();
      } else {
        const result = await updateCartItemAction(line.variantId, newQty);
        if (result.success) router.refresh();
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeCartItemAction(line.variantId);
      if (result.success) router.refresh();
    });
  }

  return (
    <div
      className={`grid items-center gap-4 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-6 ${pending ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br from-brand-50 to-slate-100">
          <span className="grid h-full w-full place-items-center text-lg font-bold text-brand-600/20">
            {line.productName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0">
          <Link
            href={`/produit/${line.productSlug}`}
            className="text-sm font-medium text-foreground hover:underline"
          >
            {line.productName}
          </Link>
          {line.variantLabel && <p className="mt-0.5 text-xs text-muted">{line.variantLabel}</p>}
        </div>
      </div>

      <div className="w-24 text-center text-sm text-foreground">{line.unitPriceLabel}</div>

      <div className="flex w-24 items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => handleQtyChange(-1)}
          disabled={pending}
          className="grid h-7 w-7 cursor-pointer place-items-center rounded border border-line text-sm font-medium text-foreground hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium text-foreground">{line.quantity}</span>
        <button
          type="button"
          onClick={() => handleQtyChange(1)}
          disabled={pending}
          className="grid h-7 w-7 cursor-pointer place-items-center rounded border border-line text-sm font-medium text-foreground hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>

      <div className="flex w-24 items-center justify-end gap-3">
        <span className="text-sm font-semibold text-foreground">{line.lineTotalLabel}</span>
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="cursor-pointer text-xs text-danger-text hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("remove")}
        </button>
      </div>
    </div>
  );
}
