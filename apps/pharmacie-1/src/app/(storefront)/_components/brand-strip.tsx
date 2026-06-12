import Link from "next/link";
import { Container } from "@pharmacie/ui";

// Marques phares — wordmarks typographiques (pas de logos bitmap sous licence),
// à remplacer par les vrais logos fournis par les marques.
const BRANDS = [
  { name: "Avène", className: "font-display italic" },
  { name: "La Roche-Posay", className: "font-semibold tracking-tight" },
  { name: "Bioderma", className: "font-bold uppercase tracking-wide" },
  { name: "Vichy", className: "font-bold uppercase tracking-[0.2em]" },
  { name: "CeraVe", className: "font-semibold tracking-tight" },
  { name: "Caudalie", className: "font-display tracking-wide" },
  { name: "Nuxe", className: "font-bold uppercase tracking-[0.3em]" },
  { name: "Uriage", className: "font-semibold tracking-wide" },
];

export function BrandStrip() {
  return (
    <section className="border-y border-line bg-surface">
      <Container className="py-12">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Vos marques préférées
          </p>
          <Link
            href="/marques"
            className="text-sm font-semibold text-brand-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:decoration-brand-600"
          >
            Toutes les marques
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 items-center gap-x-px gap-y-px sm:grid-cols-4 lg:grid-cols-8">
          {BRANDS.map((b) => (
            <li key={b.name} className="flex justify-center">
              <Link
                href="/marques"
                className={`text-base text-foreground/40 transition-colors hover:text-brand-600 ${b.className}`}
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
