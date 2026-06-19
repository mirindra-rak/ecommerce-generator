import { getTranslations } from "next-intl/server";
import { createFacetAction } from "../_actions";
import { FacetForm } from "../facet-form";

export const dynamic = "force-dynamic";

export default async function NewFacetPage() {
  const t = await getTranslations("admin.facets.new");
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      <div className="mt-6">
        <FacetForm action={createFacetAction} />
      </div>
    </div>
  );
}
