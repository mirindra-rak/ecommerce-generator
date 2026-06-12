import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryWithProducts } from "@/lib/catalog";
import { ProductCard } from "../../_components/product-card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryWithProducts(slug);
  if (!data) return { title: "Catégorie introuvable" };
  return {
    title: data.metaTitle ?? data.name,
    description: data.metaDescription ?? undefined,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCategoryWithProducts(slug);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <nav className="text-sm text-muted">
        <span>Accueil</span> <span className="px-1">/</span>{" "}
        <span className="text-foreground">{data.name}</span>
      </nav>
      {/* Bandeau de couverture (placeholder CSS tant que l'upload d'images n'est pas branché) */}
      <div className="relative mt-3 flex h-40 items-end overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-slate-100 p-6">
        {data.coverImageKey && (
          <span className="absolute right-4 top-4 rounded-full bg-surface/70 px-2 py-0.5 text-[10px] text-muted">
            image : {data.coverImageKey}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{data.name}</h1>
      </div>

      {data.description && (
        // Rendu en texte échappé (pas de dangerouslySetInnerHTML) — sanitization riche = lot 9.4.
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {data.description}
        </p>
      )}

      <p className="mt-3 text-sm text-muted">
        {data.products.length} produit{data.products.length > 1 ? "s" : ""}
      </p>

      {data.products.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-muted">
          Aucun produit dans cette catégorie pour le moment.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {data.products.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
