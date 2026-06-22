"use client";

import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { IconButton } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserIcon } from "./icons";

interface UserMenuProps {
  user: { name: string } | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations("auth.userMenu");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, close]);

  if (!user) {
    return (
      <Link href="/connexion">
        <IconButton label={t("signIn")} aria-label={t("signIn")}>
          <UserIcon className="h-5 w-5" />
        </IconButton>
      </Link>
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-brand-50 hover:text-brand-700"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <UserIcon className="h-5 w-5" />
        <span className="hidden sm:inline">{user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-sm border border-line bg-paper shadow-lg">
          <Link
            href="/compte"
            onClick={close}
            className="block px-4 py-2.5 text-sm text-foreground hover:bg-surface"
          >
            {t("myAccount")}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="block w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-surface disabled:opacity-50"
          >
            {signingOut ? t("signingOut") : t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
