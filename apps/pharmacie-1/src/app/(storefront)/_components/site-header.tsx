import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { CartIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

// En-tête vitrine partagé par toutes les pages du groupe (storefront).
// Liens catégories en placeholder (`/categorie/<slug>`) : les routes réelles
// arrivent avec le module catalog (lot 4.1, stories 05/06).
const NAV = [
  { label: "Tous les produits", slug: "tous-les-produits" },
  { label: "Visage & Soin", slug: "visage-soin" },
  { label: "Compléments", slug: "complements-alimentaires" },
  { label: "Hygiène", slug: "hygiene" },
  { label: "Maman & Bébé", slug: "maman-bebe" },
  { label: "Cheveux", slug: "cheveux" },
  { label: "Solaires", slug: "solaires" },
];

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
    >
      {children}
    </button>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-surface/85 backdrop-blur">
      {/* Bandeau de réassurance fin */}
      <div className="bg-brand-700 text-center text-xs font-medium text-white">
        <p className="px-4 py-1.5">
          Livraison offerte dès 49&nbsp;€ · Conseil pharmacien 6j/7 · Paiement sécurisé
        </p>
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <button
          type="button"
          aria-label="Ouvrir le menu"
          className="rounded-md p-1.5 text-slate-700 lg:hidden"
        >
          <MenuIcon />
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-bold text-white">
            {siteConfig.brand.name.charAt(0)}
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {siteConfig.brand.name}
          </span>
        </Link>

        {/* Recherche (placeholder visuel — branchée au module `search`, lot 4.4) */}
        <div className="ml-2 hidden flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-muted md:flex">
          <SearchIcon className="h-4 w-4 shrink-0" />
          <span>Rechercher un produit, une marque…</span>
        </div>

        <nav className="ml-auto flex items-center gap-1">
          <IconButton label="Mon compte">
            <UserIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label="Mes favoris">
            <HeartIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label="Mon panier">
            <CartIcon className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
              0
            </span>
          </IconButton>
        </nav>
      </div>

      {/* Navigation catégories */}
      <nav className="border-t border-slate-200/70 bg-surface">
        <ul className="mx-auto hidden max-w-6xl items-center gap-1 px-6 lg:flex">
          {NAV.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/categorie/${item.slug}`}
                className="inline-block px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="ml-auto flex items-center gap-2 py-2">
            <Link
              href="/categorie/bons-plans"
              className="rounded-full bg-accent-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
            >
              Bons plans
            </Link>
            <Link
              href="/premium"
              className="rounded-full bg-foreground px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-foreground/90"
            >
              Premium
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
