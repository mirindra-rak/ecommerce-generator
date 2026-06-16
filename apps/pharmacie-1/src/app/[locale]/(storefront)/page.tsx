import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import { Hero } from "./_components/hero";
import { ReassuranceBar } from "./_components/reassurance-bar";
import { PromoBanners } from "./_components/promo-banners";
import { CategoryGrid } from "./_components/category-grid";
import { FeaturedProducts } from "./_components/featured-products";
import { Expertise } from "./_components/expertise";
import { BrandStrip } from "./_components/brand-strip";
import { LoyaltyBanner } from "./_components/loyalty-banner";
import { Newsletter } from "./_components/newsletter";

// Home page vitrine. CategoryGrid et FeaturedProducts lisent le catalogue réel
// (module catalog, lot 4.1) → rendu dynamique (la stratégie SSG/ISR = lot 8.1).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor("/", locale) };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ReassuranceBar />
      <PromoBanners />
      <CategoryGrid />
      <FeaturedProducts />
      <Expertise />
      <BrandStrip />
      <LoyaltyBanner />
      <Newsletter />
    </>
  );
}
