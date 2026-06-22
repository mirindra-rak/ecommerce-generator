"use client";

import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { key: "dashboard", href: "/compte" },
  { key: "profile", href: "/compte/profil" },
  { key: "password", href: "/compte/mot-de-passe" },
] as const;

const COMING_SOON = ["orders", "addresses", "wishlist"] as const;

export function AccountNav() {
  const t = useTranslations("auth.account.nav");
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto border-b border-line pb-2 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
      {NAV_ITEMS.map(({ key, href }) => {
        const isActive =
          href === "/compte" ? pathname.endsWith("/compte") : pathname.includes(href);
        return (
          <Link
            key={key}
            href={href}
            className={`whitespace-nowrap rounded-sm px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-brand-50 font-medium text-brand-700"
                : "text-foreground/70 hover:bg-surface hover:text-foreground"
            }`}
          >
            {t(key)}
          </Link>
        );
      })}

      <hr className="my-2 hidden border-line lg:block" />

      {COMING_SOON.map((key) => (
        <span
          key={key}
          className="flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm text-muted/50"
        >
          {t(key)}
          <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium">
            {t("comingSoon")}
          </span>
        </span>
      ))}

      <hr className="my-2 hidden border-line lg:block" />

      <button
        type="button"
        onClick={handleSignOut}
        className="whitespace-nowrap rounded-sm px-3 py-2 text-left text-sm text-foreground/70 transition-colors hover:bg-surface hover:text-foreground"
      >
        {t("signOut")}
      </button>
    </nav>
  );
}
