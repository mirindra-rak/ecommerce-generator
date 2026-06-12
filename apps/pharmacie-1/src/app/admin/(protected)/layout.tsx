import { requireStaff } from "@/lib/auth-guard";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

// Layout du back-office PROTÉGÉ. La garde s'applique à toutes les pages de ce groupe.
// Les routes /admin/login et /admin/forbidden sont hors de ce groupe (non gardées).
const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/marques", label: "Marques" },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <p className="px-3 text-xs font-bold uppercase tracking-wide text-muted">Back-office</p>
          <nav className="mt-3 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-slate-200 bg-surface p-3">
            <p className="text-xs text-muted">Connecté</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
              {user.role}
            </span>
            <LogoutButton />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
