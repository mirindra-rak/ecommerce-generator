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
  return { title: data?.name ?? "Catégorie introuvable" };
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
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{data.name}</h1>
      <p className="mt-1 text-sm text-muted">
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
