import { catalogPriceRuleRepository } from "@pharmacie/core/modules/promotions";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PromotionsTable } from "../_components/promotions-table";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const [rules, t] = await Promise.all([
    catalogPriceRuleRepository.findMany(),
    getTranslations("admin.promotions"),
  ]);

  const data = rules.map((r) => ({
    id: r.id,
    name: r.name,
    active: r.active,
    discountType: r.discountType,
    discountValue: r.discountValue,
    targetType: r.targetType,
    targetsCount: r.targets.length,
    priority: r.priority,
    startDate: r.startDate?.toISOString() ?? null,
    endDate: r.endDate?.toISOString() ?? null,
  }));

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("pageTitle")}</h1>
          <p className="mt-0.5 text-sm text-muted">{t("total", { count: rules.length })}</p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="rounded-sm bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
        >
          + {t("new.title")}
        </Link>
      </div>

      <PromotionsTable initialData={data} />
    </div>
  );
}
