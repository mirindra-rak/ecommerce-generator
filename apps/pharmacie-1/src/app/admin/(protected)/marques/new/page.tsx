import { getTranslations } from "next-intl/server";
import { createBrandAction } from "../_actions";
import { BrandForm } from "../brand-form";

export const dynamic = "force-dynamic";

export default async function NewBrandPage() {
  const t = await getTranslations("admin.brands.new");
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-6">
        <BrandForm action={createBrandAction} />
      </div>
    </div>
  );
}
