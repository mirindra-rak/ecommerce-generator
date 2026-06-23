import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@pharmacie/ui";
import { getCartPageVM } from "@/lib/cart";
import { CartLineRow } from "./cart-line-row";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CartPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [cart, t] = await Promise.all([getCartPageVM(), getTranslations("cart")]);

  return (
    <Container className="py-12">
      <h1 className="text-2xl font-bold text-foreground">{t("pageTitle")}</h1>

      {cart.isEmpty ? (
        <div className="mt-10 text-center">
          <p className="text-lg text-muted">{t("empty")}</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t("emptyLink")}
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <div className="hidden border-b border-line pb-3 sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-6">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t("product")}
            </span>
            <span className="w-24 text-center text-xs font-semibold uppercase tracking-wide text-muted">
              {t("unitPrice")}
            </span>
            <span className="w-24 text-center text-xs font-semibold uppercase tracking-wide text-muted">
              {t("quantity")}
            </span>
            <span className="w-24 text-right text-xs font-semibold uppercase tracking-wide text-muted">
              {t("subtotal")}
            </span>
          </div>

          <div className="divide-y divide-line">
            {cart.lines.map((line) => (
              <CartLineRow key={line.variantId} line={line} />
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>{t("totalExclTax")}</span>
                <span>{cart.totalExclTaxLabel}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t("totalTax")}</span>
                <span>{cart.totalTaxLabel}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-lg font-bold text-foreground">
                <span>{t("totalInclTax")}</span>
                <span>{cart.totalInclTaxLabel}</span>
              </div>
              <p className="text-right text-xs text-muted">
                {t("itemCount", { count: cart.itemCount })}
              </p>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
