import { Button } from "@pharmacie/ui";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-brand-700">{siteConfig.brand.name}</h1>
      <p className="mt-4 text-muted">
        Fondations du storefront. Le moteur e-commerce (catalogue, panier, checkout…) sera construit
        module par module via <code>/spec</code> → <code>/plan</code> → <code>/coder</code>.
      </p>
      <div className="mt-8 flex gap-3">
        <Button>Découvrir la boutique</Button>
        <Button variant="secondary">En savoir plus</Button>
      </div>
    </main>
  );
}
