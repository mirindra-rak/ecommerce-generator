import Link from "next/link";
import { ArrowIcon } from "./icons";

// Hero pleine largeur, dans l'esprit des bannières promo parapharmacie : offre
// mise en avant + CTA. Visuel décoratif en CSS (pas d'asset image à charger).
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-surface to-brand-50">
      {/* Halos décoratifs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:py-20">
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-700">
            Offre du moment
          </span>

          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Vos essentiels beauté & santé, <span className="text-brand-600">livrés chez vous</span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            Plus de 1&nbsp;000 marques de parapharmacie, le conseil d&apos;un pharmacien et la
            livraison offerte dès 49&nbsp;€.
          </p>

          {/* Bloc offre type « X achetés = 1 offert » */}
          <div className="mt-7 inline-flex items-center gap-4 rounded-2xl border border-brand-500/20 bg-surface/80 px-5 py-4 shadow-sm">
            <div className="text-center leading-none">
              <p className="text-3xl font-extrabold text-accent-600">4</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                achetés
              </p>
            </div>
            <span className="text-2xl font-light text-slate-300">=</span>
            <div className="text-center leading-none">
              <p className="text-3xl font-extrabold text-accent-600">1</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                offert
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/categorie/bons-plans"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              J&apos;en profite
              <ArrowIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/categorie/tous-les-produits"
              className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>

        {/* Visuel décoratif : flacons stylisés en CSS */}
        <div aria-hidden className="relative hidden h-80 lg:block">
          <div className="absolute inset-0 grid grid-cols-3 items-end gap-5 px-6">
            <Bottle className="h-56 bg-gradient-to-b from-brand-500 to-brand-700" />
            <Bottle className="h-72 bg-gradient-to-b from-accent-500 to-accent-600" tall />
            <Bottle className="h-48 bg-gradient-to-b from-brand-600 to-brand-700" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Bottle({ className = "", tall = false }: { className?: string; tall?: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      <span className="h-6 w-4 rounded-t-sm bg-slate-300" />
      <div
        className={`w-full rounded-2xl shadow-lg ${className}`}
        style={{ height: tall ? "100%" : undefined }}
      >
        <div className="mx-auto mt-8 h-14 w-3/4 rounded-md bg-surface/85" />
      </div>
    </div>
  );
}
