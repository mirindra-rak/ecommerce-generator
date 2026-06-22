"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { TrashIcon } from "@pharmacie/ui";
import { Link } from "@/i18n/navigation";
import type { CartPageLineVM } from "@/lib/cart";
import { removeCartItemAction, updateCartItemAction } from "../_actions/cart-actions";

export function CartDrawerLine({
  line,
  onCartMutated,
}: {
  line: CartPageLineVM;
  onCartMutated: () => Promise<void>;
}) {
  const t = useTranslations("cart");
  const [pending, startTransition] = useTransition();

  function mutateQuantity(nextQuantity: number) {
    startTransition(async () => {
      const result =
        nextQuantity <= 0
          ? await removeCartItemAction(line.variantId)
          : await updateCartItemAction(line.variantId, nextQuantity);

      if (result.success) {
        await onCartMutated();
      }
    });
  }

  return (
    <div className={pending ? "opacity-50" : ""}>
      <div className="grid grid-cols-[56px_1fr_auto] gap-3">
        <div className="relative h-[72px] w-[56px] overflow-hidden rounded-sm border border-line bg-slate-50">
          {line.imageKey ? (
            <Image
              src={`/uploads/${line.imageKey}`}
              alt={line.productName}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-lg font-bold text-brand-600/25">
              {line.productName.charAt(0)}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
            {line.brandName ?? line.productName}
          </p>
          <Link
            href={`/produit/${line.productSlug}`}
            className="mt-0.5 block text-sm font-medium leading-5 text-foreground hover:underline"
          >
            {line.productName}
          </Link>
          {line.variantLabel && <p className="mt-0.5 text-xs text-muted">{line.variantLabel}</p>}

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => mutateQuantity(line.quantity - 1)}
              disabled={pending}
              aria-label={t("decreaseQuantity")}
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              −
            </button>
            <span className="w-5 text-center text-sm font-semibold text-foreground">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => mutateQuantity(line.quantity + 1)}
              disabled={pending}
              aria-label={t("increaseQuantity")}
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between gap-2">
          <button
            type="button"
            onClick={() => mutateQuantity(0)}
            disabled={pending}
            aria-label={t("remove")}
            className="cursor-pointer text-muted transition-colors hover:text-danger-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
          <span className="text-base font-semibold tracking-tight text-danger-text">
            {line.lineTotalLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
