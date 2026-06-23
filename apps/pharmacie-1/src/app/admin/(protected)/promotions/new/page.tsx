import {
  brandRepository,
  categoryRepository,
  productRepository,
} from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import { createRuleAction } from "../_actions";
import { RuleForm } from "../rule-form";

export default async function NewRulePage() {
  const [cats, prods, brs, t] = await Promise.all([
    categoryRepository.findMany(),
    productRepository.findMany(),
    brandRepository.findMany(),
    getTranslations("admin.promotions"),
  ]);

  const categories = cats.map((c) => ({ value: c.id, label: c.name }));
  const products = prods.map((p) => ({ value: p.id, label: p.name }));
  const brands = brs.map((b) => ({ value: b.id, label: b.name }));

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">{t("new.heading")}</h1>
      </div>
      <RuleForm
        action={createRuleAction}
        categories={categories}
        products={products}
        brands={brands}
      />
    </div>
  );
}
