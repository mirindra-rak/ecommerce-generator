"use client";

import { authClient } from "@/lib/auth-client";
import {
  BellIcon,
  Cross,
  GearIcon,
  HouseIcon,
  PackageIcon,
  StorefrontIcon,
  TagIcon,
  cx,
} from "@pharmacie/ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

interface AdminUser {
  email: string;
  role: string;
}

const NAV = [
  { href: "/admin", label: "Tableau de bord", Icon: HouseIcon, exact: true },
  { href: "/admin/produits", label: "Produits", Icon: PackageIcon },
  { href: "/admin/categories", label: "Catégories", Icon: TagIcon },
  { href: "/admin/marques", label: "Marques", Icon: StorefrontIcon },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Tableau de bord";
  if (pathname.startsWith("/admin/produits")) return "Produits";
  if (pathname.startsWith("/admin/categories")) return "Catégories";
  if (pathname.startsWith("/admin/marques")) return "Marques";
  return "Administration";
}

export function AdminShell({ user, children }: { user: AdminUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = user.email.slice(0, 2).toUpperCase();
  const username = user.email.split("@")[0];

  async function handleLogout() {
    setLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="flex w-64 shrink-0 flex-col bg-foreground">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <Cross className="h-7 w-7 text-brand-500" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Back-office
            </p>
            <p className="text-sm font-semibold leading-none text-white">Pharmacie</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Navigation
          </p>
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, Icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cx(
                      "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/55 hover:bg-white/8 hover:text-white/85",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1">{label}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Separator + settings */}
          <div className="mt-6">
            <div className="mb-2 h-px bg-white/10" />
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-white/35 transition-colors hover:bg-white/8 hover:text-white/70"
            >
              <GearIcon className="h-5 w-5 shrink-0" />
              Paramètres
            </Link>
          </div>
        </nav>

        {/* User area */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{username}</p>
              <p className="text-[10px] uppercase tracking-wide text-white/40">{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-sm border border-white/15 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-white/25 hover:bg-white/8 hover:text-white/85 disabled:opacity-40"
          >
            {loggingOut ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface px-6">
          <h1 className="text-base font-semibold text-foreground">{getPageTitle(pathname)}</h1>

          <div className="flex items-center gap-2">
            {/* Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:bg-bg-subtle hover:text-foreground"
            >
              <BellIcon className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger-solid" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs font-bold text-accent-600">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-foreground">{username}</p>
                <p className="text-[10px] capitalize text-muted">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto bg-paper">{children}</main>
      </div>
    </div>
  );
}
