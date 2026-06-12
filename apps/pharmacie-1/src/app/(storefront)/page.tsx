import { Hero } from "./_components/hero";
import { ReassuranceBar } from "./_components/reassurance-bar";
import { CategoryGrid } from "./_components/category-grid";
import { FeaturedProducts } from "./_components/featured-products";

// Home page vitrine. CategoryGrid et FeaturedProducts lisent le catalogue réel
// (module catalog, lot 4.1) → rendu dynamique (la stratégie SSG/ISR = lot 8.1).
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ReassuranceBar />
      <CategoryGrid />
      <FeaturedProducts />
    </>
  );
}
