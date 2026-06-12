import Link from "next/link";
import {
  brandRepository,
  categoryRepository,
  productRepository,
} from "@pharmacie/core/modules/catalog";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [categories, brands, products] = await Promise.all([
    categoryRepository.findMany(),
    brandRepository.findMany(),
    productRepository.findActive(),
  ]);

  const cards = [
    { label: "Catégories", count: categories.length, href: "/admin/categories" },
    { label: "Marques", count: brands.length, href: "/admin/marques" },
    { label: "Produits actifs", count: products.length, href: "/admin" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
      <p className="mt-1 text-sm text-muted">Vue d’ensemble du catalogue.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-surface p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{card.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
