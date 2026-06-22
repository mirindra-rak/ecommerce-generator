"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, XIcon, cx } from "@pharmacie/ui";
import { Link } from "@/i18n/navigation";
import { type CartPageVM } from "@/lib/cart";
import { getCartSnapshotAction } from "../_actions/cart-actions";
import { useCartDrawer } from "./cart-drawer-provider";
import { CartDrawerLine } from "./cart-drawer-line";

const EMPTY_CART: CartPageVM = {
  lines: [],
  totalExclTaxLabel: "0,00 €",
  totalTaxLabel: "0,00 €",
  totalInclTaxLabel: "0,00 €",
  totalInclTaxValue: 0,
  itemCount: 0,
  freeShippingRemainingCents: 4900,
  freeShippingRemainingLabel: "49,00 €",
  isEmpty: true,
};

export function CartDrawer() {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const router = useRouter();
  const { closeDrawer, isOpen, openReason } = useCartDrawer();
  const [cart, setCart] = useState<CartPageVM>(EMPTY_CART);
  const [isHydrating, setIsHydrating] = useState(false);

  const refreshCart = useCallback(async () => {
    setIsHydrating(true);
    try {
      const nextCart = await getCartSnapshotAction();
      setCart(nextCart);
    } finally {
      setIsHydrating(false);
    }
  }, []);

  const handleCartMutated = useCallback(async () => {
    router.refresh();
    await refreshCart();
  }, [refreshCart, router]);

  useEffect(() => {
    if (!isOpen) return;
    void refreshCart();
  }, [isOpen, refreshCart]);

  return (
    <div
      aria-hidden={!isOpen}
      className={cx(
        "fixed inset-0 z-50 transition-opacity duration-200",
        isOpen ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <button
        type="button"
        aria-label={t("closeDrawer")}
        onClick={closeDrawer}
        className={cx(
          "absolute inset-0 cursor-pointer bg-slate-950/30 transition-opacity duration-200",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cx(
          "absolute right-0 top-0 flex h-full w-full max-w-[24rem] flex-col bg-paper shadow-[0_0_40px_rgba(15,23,42,0.16)] transition-transform duration-300 ease-out sm:w-[24rem]",
          isOpen ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <h2
            id="cart-drawer-title"
            className="text-xl font-semibold tracking-tight text-brand-700"
          >
            {t("drawerTitle")}
          </h2>
          <button
            type="button"
            aria-label={t("closeDrawer")}
            onClick={closeDrawer}
            className="cursor-pointer text-danger-text transition-colors hover:text-danger-text/80"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {openReason === "added" && (
          <div className="border-b border-success-border bg-success-bg px-4 py-3 text-center text-base font-medium text-success-text">
            {t("addedNotice")}
          </div>
        )}

        {isHydrating && cart.isEmpty ? (
          <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted">
            {tc("loading")}
          </div>
        ) : cart.isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-base font-medium text-foreground">{t("empty")}</p>
            <p className="mt-2 max-w-xs text-sm leading-5 text-muted">{t("drawerEmptyHint")}</p>
            <Button className="mt-5" onClick={closeDrawer}>
              {t("continueShopping")}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {cart.lines.map((line) => (
                  <CartDrawerLine
                    key={line.variantId}
                    line={line}
                    onCartMutated={handleCartMutated}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-line bg-surface">
              <div className="bg-brand-700 px-4 py-3 text-center text-xs font-medium text-white">
                {cart.freeShippingRemainingCents > 0
                  ? t("freeShippingRemaining", { amount: cart.freeShippingRemainingLabel })
                  : t("freeShippingReached")}
              </div>

              <div className="space-y-4 px-4 py-4">
                <p className="text-center text-sm font-medium text-foreground">
                  {t("itemCount", { count: cart.itemCount })}
                </p>

                <div className="flex items-end justify-between gap-4">
                  <span className="text-sm text-foreground">{t("drawerSubtotal")}</span>
                  <span className="text-xl font-semibold tracking-tight text-brand-700">
                    {cart.totalInclTaxLabel}
                  </span>
                </div>

                <Link
                  href="/panier"
                  onClick={closeDrawer}
                  className="block cursor-pointer rounded-sm bg-brand-700 px-4 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  {t("viewCart")}
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
