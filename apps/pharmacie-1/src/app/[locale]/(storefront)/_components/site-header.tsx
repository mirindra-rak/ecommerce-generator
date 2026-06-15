import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Cross, IconButton } from "@pharmacie/ui";
import { siteConfig } from "@/lib/site";
import { getMenuTree } from "@/lib/catalog";
import { CartIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";
import { LanguageSwitcher } from "./language-switcher";
import { MegaMenu } from "./mega-menu";

// En-tête vitrine partagé par le groupe (storefront). La navigation catégories est
// data-driven : l'arbre racines + sous-catégories actives vient du module catalog et
// alimente le mega menu (composant client).
export async function SiteHeader() {
  const [menu, t, tc] = await Promise.all([
    getMenuTree(),
    getTranslations("header"),
    getTranslations("common"),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      {/* Bandeau de réassurance */}
      <div className="bg-brand-700 text-white">
        <Container className="flex items-center justify-center gap-3 py-2 text-xs font-medium">
          <span>{t("barShipping")}</span>
          <Cross className="h-2 w-2 text-white/50" />
          <span>{t("barAdvice")}</span>
          <Cross className="hidden h-2 w-2 text-white/50 sm:inline" />
          <span className="hidden sm:inline">{tc("securePayment")}</span>
        </Container>
      </div>

      <Container className="flex items-center gap-5 py-6">
        <button
          type="button"
          aria-label={t("openMenu")}
          className="p-1.5 text-foreground lg:hidden"
        >
          <MenuIcon />
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-brand-600 text-white">
            <Cross className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            {siteConfig.brand.name}
          </span>
        </Link>

        {/* Recherche (placeholder — branchée au module search, lot 4.4) */}
        <div className="ml-2 hidden flex-1 items-center gap-2 rounded-sm border border-line bg-surface px-5 py-3 text-sm text-muted md:flex">
          <SearchIcon className="h-4 w-4 shrink-0" />
          <span>{t("searchPlaceholder")}</span>
        </div>

        <nav className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <IconButton label={t("account")}>
            <UserIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label={t("favorites")}>
            <HeartIcon className="h-5 w-5" />
          </IconButton>
          <IconButton label={t("cart")}>
            <CartIcon className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-sm bg-accent-600 px-1 text-[10px] font-semibold text-white">
              0
            </span>
          </IconButton>
        </nav>
      </Container>

      {/* Navigation catégories (mega menu, data-driven) */}
      <MegaMenu categories={menu} />
    </header>
  );
}
