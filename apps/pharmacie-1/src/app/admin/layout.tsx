import Link from "next/link";

// Layout du back-office. ⚠️ Accès NON protégé à ce stade — l'authentification admin
// et le RBAC arrivent avec le socle admin (lot 5.1).
const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/marques", label: "Marques" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-amber-400 text-center text-xs font-semibold text-amber-950">
        <p className="px-4 py-1.5">
          ⚠️ Zone d’administration non sécurisée — authentification à venir (lot 5.1). Ne pas
          exposer en production.
        </p>
      </div>

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
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
