import { brandRepository } from "@pharmacie/core/modules/catalog";
import { notFound } from "next/navigation";
import { updateBrandAction } from "../_actions";
import { BrandForm } from "../brand-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: PageProps) {
  const { id } = await params;
  const brand = await brandRepository.findById(id);
  if (!brand) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Éditer « {brand.name} »</h1>
      <div className="mt-6">
        <BrandForm action={updateBrandAction} brand={{ id: brand.id, name: brand.name }} />
      </div>
    </div>
  );
}
