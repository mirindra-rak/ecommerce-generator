import { createBrandAction } from "../_actions";
import { BrandForm } from "../brand-form";

export const dynamic = "force-dynamic";

export default function NewBrandPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Nouvelle marque</h1>
      <p className="mt-1 text-sm text-muted">Le slug est généré automatiquement depuis le nom.</p>
      <div className="mt-6">
        <BrandForm action={createBrandAction} />
      </div>
    </div>
  );
}
