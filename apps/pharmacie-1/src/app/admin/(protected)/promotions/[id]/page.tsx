import {
  brandRepository,
  categoryRepository,
  productRepository,
} from "@pharmacie/core/modules/catalog";
import { catalogPriceRuleRepository } from "@pharmacie/core/modules/promotions";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { updateRuleAction } from "../_actions";
import { RuleForm } from "../rule-form";

export default async function EditRulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [rule, cats, prods, brs, t] = await Promise.all([
    catalogPriceRuleRepository.findById(id),
    categoryRepository.findMany(),
    productRepository.findMany(),
    brandRepository.findMany(),
    getTranslations("admin.promotions"),
  ]);

  if (!rule) notFound();

  const categories = cats.map((c) => ({ value: c.id, label: c.name }));
  const products = prods.map((p) => ({ value: p.id, label: p.name }));
  const brands = brs.map((b) => ({ value: b.id, label: b.name }));

  const ruleData = {
    id: rule.id,
    name: rule.name,
    active: rule.active,
    discountType: rule.discountType,
    discountValue: rule.discountValue,
    targetType: rule.targetType,
    targetIds: rule.targets.map((t) => t.targetId),
    floorPrice: rule.floorPrice,
    customerLabel: rule.customerLabel,
    showStrikethrough: rule.showStrikethrough,
    startDate: rule.startDate?.toISOString() ?? null,
    endDate: rule.endDate?.toISOString() ?? null,
    priority: rule.priority,
  };

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">
          {t("edit.title", { name: rule.name })}
        </h1>
      </div>
      <RuleForm
        action={updateRuleAction}
        rule={ruleData}
        categories={categories}
        products={products}
        brands={brands}
      />
    </div>
  );
}
