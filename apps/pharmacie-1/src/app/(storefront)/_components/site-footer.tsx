import Link from "next/link";
import { Container, Cross } from "@pharmacie/ui";
import { siteConfig } from "@/lib/site";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "./icons";
import { PaymentMarks } from "./payment-marks";

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

const SOCIALS = [
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "TikTok", Icon: TiktokIcon },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-sm bg-brand-600 text-white">
                <Cross className="h-4 w-4" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                {siteConfig.brand.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Votre parapharmacie en ligne : cosmétiques, santé, bien-être et compléments, avec le
              conseil d&apos;un pharmacien.
            </p>

            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ label, Icon }) => (
                <Link
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-sm border border-line text-foreground/60 transition-colors hover:border-accent-500 hover:text-brand-700"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                {col.title}
              </h3>
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

        {siteConfig.locale.legalMentions.length > 0 && (
          <div className="mt-10 flex items-start gap-2 rounded-sm border border-line bg-paper px-4 py-3">
            <Cross className="mt-0.5 h-3 w-3 shrink-0 text-brand-500" />
            <div>
              {siteConfig.locale.legalMentions.map((mention) => (
                <p key={mention} className="text-xs leading-relaxed text-muted">
                  {mention}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {year} {siteConfig.brand.legalName}. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted">Paiement sécurisé</span>
            <PaymentMarks />
          </div>
        </div>
      </Container>
    </footer>
  );
}
