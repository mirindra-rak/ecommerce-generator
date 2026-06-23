import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Cross, IconButton } from "@pharmacie/ui";
import { siteConfig } from "@/lib/site";
import { getMenuTree } from "@/lib/catalog";
import { HeartIcon, MenuIcon } from "./icons";
import { CartBadge } from "./cart-badge";
import { LanguageSwitcher } from "./language-switcher";
import { MegaMenu } from "./mega-menu";
import { SearchBox } from "./search-box";
import { UserMenu } from "./user-menu";

interface SiteHeaderProps {
  user: { name: string } | null;
}

export async function SiteHeader({ user }: SiteHeaderProps) {
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
          className="cursor-pointer p-1.5 text-foreground lg:hidden"
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

        <SearchBox placeholder={t("searchPlaceholder")} />

        <nav className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <UserMenu user={user} />
          <IconButton label={t("favorites")}>
            <HeartIcon className="h-5 w-5" />
          </IconButton>
          <CartBadge />
        </nav>
      </Container>

      {/* Navigation catégories (mega menu, data-driven) */}
      <MegaMenu categories={menu} />
    </header>
  );
}
