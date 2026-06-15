import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@pharmacie/ui";
import { getBrands } from "@/lib/catalog";

// Marques phares — wordmarks typographiques (pas de logos bitmap sous licence). Données
// réelles : marques du catalogue (module catalog), plus de liste codée en dur.
export async function BrandStrip() {
  const [brands, t] = await Promise.all([getBrands(16), getTranslations("brandStrip")]);
  if (brands.length === 0) return null;

  return (
    <section className="border-y border-line bg-surface">
      <Container className="py-12">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t("heading")}
          </p>
          <Link
            href="/marques"
            className="text-sm font-semibold text-brand-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:decoration-brand-600"
          >
            {t("allBrands")}
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 items-center gap-x-px gap-y-px sm:grid-cols-4 lg:grid-cols-8">
          {brands.map((brand) => (
            <li key={brand.slug} className="flex justify-center">
              <Link
                href="/marques"
                className="text-base font-semibold tracking-tight text-foreground/40 transition-colors hover:text-brand-600"
              >
                {brand.name}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
