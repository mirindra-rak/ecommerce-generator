import Link from "next/link";
import { siteConfig } from "@/lib/site";

const COLUMNS = [
  {
    title: "Acheter",
    links: [
      { label: "Tous les produits", href: "/categorie/tous-les-produits" },
      { label: "Bons plans", href: "/categorie/bons-plans" },
      { label: "Nos marques", href: "/marques" },
      { label: "Nouveautés", href: "/categorie/nouveautes" },
    ],
  },
  {
    title: "Service client",
    links: [
      { label: "Suivre ma commande", href: "/compte/commandes" },
      { label: "Livraison & retours", href: "/aide/livraison" },
      { label: "Conseil pharmacien", href: "/aide/conseil" },
      { label: "Nous contacter", href: "/contact" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "Qui sommes-nous", href: "/a-propos" },
      { label: "Le blog", href: "/blog" },
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "CGV", href: "/cgv" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-bold text-white">
                {siteConfig.brand.name.charAt(0)}
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {siteConfig.brand.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Votre parapharmacie en ligne : cosmétiques, santé, bien-être et compléments, avec le
              conseil d&apos;un pharmacien.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-brand-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Mentions réglementaires (depuis la config du site) */}
        {siteConfig.locale.legalMentions.length > 0 && (
          <div className="mt-10 rounded-xl bg-slate-50 px-4 py-3">
            {siteConfig.locale.legalMentions.map((mention) => (
              <p key={mention} className="text-xs leading-relaxed text-muted">
                {mention}
              </p>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-muted sm:flex-row">
          <p>
            © {year} {siteConfig.brand.legalName}. Tous droits réservés.
          </p>
          <p>Paiement sécurisé · CB · PayPal · Bancontact</p>
        </div>
      </div>
    </footer>
  );
}
