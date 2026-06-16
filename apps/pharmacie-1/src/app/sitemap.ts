import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getSitemapCategories, getSitemapProducts } from "@/lib/catalog";
import { alternatesFor } from "@/lib/seo";

// Sitemap décliné par locale (story i18n 04). Chaque URL apparaît une fois (locale par
// défaut comme URL principale) avec ses `alternates.languages` (annotations `xhtml:link`
// hreflang) issues de la MÊME source que les `hreflang` du HTML → cohérence garantie.
// Lecture base à la génération (catalogue en `force-dynamic` ; SSG/ISR = lot 8.1).
export const dynamic = "force-dynamic";

function entry(pathname: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  const { canonical, languages } = alternatesFor(pathname, routing.defaultLocale);
  return { url: canonical, lastModified, alternates: { languages } };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getSitemapCategories(), getSitemapProducts()]);

  return [
    entry("/"),
    ...categories.map((category) => entry(`/categorie/${category.slug}`, category.updatedAt)),
    ...products.map((product) => entry(`/produit/${product.slug}`, product.updatedAt)),
  ];
}
