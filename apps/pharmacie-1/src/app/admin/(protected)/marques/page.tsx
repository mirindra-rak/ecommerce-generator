import { brandRepository } from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { MarquesTable } from "../_components/marques-table";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  const brands = await brandRepository.findMany();
  const t = await getTranslations("admin.brands");

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("pageTitle")}</h1>
          <p className="mt-0.5 text-sm text-muted">{t("total", { count: brands.length })}</p>
        </div>
        <Link
          href="/admin/marques/new"
          className="rounded-sm bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
        >
          + {t("new.title")}
        </Link>
      </div>

      <MarquesTable initialData={brands} />
    </div>
  );
}
