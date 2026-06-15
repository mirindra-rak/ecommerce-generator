import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "./product-card";

// Données réelles : module catalog (lot 4.1). Server component asynchrone qui lit
// les produits actifs via la couche d'accès (repositories + services de domaine).
export async function FeaturedProducts() {
  const [products, t] = await Promise.all([
    getFeaturedProducts(8),
    getTranslations("featuredProducts"),
  ]);
  if (products.length === 0) return null;

  return (
    <section className="bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("heading")}</h2>
            <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
          </div>
          <Link
            href="/categorie/visage-soin"
            className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block"
          >
            {t("seeAll")}
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
