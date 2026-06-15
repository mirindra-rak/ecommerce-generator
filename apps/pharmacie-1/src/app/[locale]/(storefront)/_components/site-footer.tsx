import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container, Cross } from "@pharmacie/ui";
import { siteConfig } from "@/lib/site";
import { FacebookIcon, InstagramIcon, TiktokIcon } from "./icons";
import { PaymentMarks } from "./payment-marks";

// Structure des colonnes : href stable + clé de libellé (texte externalisé).
const COLUMNS = [
  {
    titleKey: "colBuy",
    links: [
      { key: "colBuyAllProducts", href: "/categorie/tous-les-produits" },
      { key: "colBuyDeals", href: "/categorie/bons-plans" },
      { key: "colBuyBrands", href: "/marques" },
      { key: "colBuyNew", href: "/categorie/nouveautes" },
    ],
  },
  {
    titleKey: "colService",
    links: [
      { key: "colServiceTrackOrder", href: "/compte/commandes" },
      { key: "colServiceShippingReturns", href: "/aide/livraison" },
      { key: "colServiceAdvice", href: "/aide/conseil" },
      { key: "colServiceContact", href: "/contact" },
    ],
  },
  {
    titleKey: "colAbout",
    links: [
      { key: "colAboutUs", href: "/a-propos" },
      { key: "colAboutBlog", href: "/blog" },
      { key: "colAboutLegal", href: "/mentions-legales" },
      { key: "colAboutTerms", href: "/cgv" },
    ],
  },
] as const;

// Noms de réseaux sociaux : marques, non traduits.
const SOCIALS = [
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "TikTok", Icon: TiktokIcon },
];

export function SiteFooter() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
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
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t("tagline")}</p>

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
            <nav key={col.titleKey} aria-label={t(col.titleKey)}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                {t(col.titleKey)}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-brand-700"
                    >
                      {t(link.key)}
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
            {t("copyright", { year, company: siteConfig.brand.legalName })}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted">{tc("securePayment")}</span>
            <PaymentMarks />
          </div>
        </div>
      </Container>
    </footer>
  );
}
