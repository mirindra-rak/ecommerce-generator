import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";

// Layout du groupe de routes (storefront) : en-tête + pied de page partagés par
// la home, les listings de catégorie et les fiches produit (lot catalog à venir).
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
