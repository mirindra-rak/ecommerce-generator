import { facetRepository } from "@pharmacie/core/modules/catalog";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { updateFacetAction } from "../_actions";
import { FacetForm } from "../facet-form";
import { ValuesEditor } from "../values-editor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFacetPage({ params }: PageProps) {
  const { id } = await params;
  const facet = await facetRepository.findByIdWithValues(id);
  if (!facet) notFound();

  const t = await getTranslations("admin.facets.edit");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">{t("title", { name: facet.name })}</h1>
      <div className="mt-6 max-w-3xl space-y-6">
        <FacetForm
          action={updateFacetAction}
          facet={{ id: facet.id, name: facet.name, code: facet.code }}
        />
        <ValuesEditor
          facetId={facet.id}
          values={facet.values.map((v) => ({
            id: v.id,
            code: v.code,
            label: v.label,
            position: v.position,
          }))}
        />
      </div>
    </div>
  );
}
