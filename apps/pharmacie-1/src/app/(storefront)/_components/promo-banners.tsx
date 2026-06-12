import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Container } from "@pharmacie/ui";

const BANNERS = [
  {
    href: "/categorie/visage-soin",
    image: "/images/promo-visage.jpg",
    eyebrow: "Routine visage",
    title: "Le soin sur mesure pour votre peau",
    cta: "Découvrir",
    tone: "brand" as const,
  },
  {
    href: "/categorie/complements-alimentaires",
    image: "/images/promo-naturel.jpg",
    eyebrow: "Bien-être naturel",
    title: "Compléments & actifs d'origine naturelle",
    cta: "Explorer",
    tone: "accent" as const,
  },
];

export function PromoBanners() {
  return (
    <Container className="py-16">
      <div className="grid gap-5 md:grid-cols-2">
        {BANNERS.map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-sm border border-line p-8"
          >
            <Image
              src={b.image}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                b.tone === "brand"
                  ? "from-brand-700/90 via-brand-700/30"
                  : "from-accent-700/90 via-accent-700/30"
              } to-transparent`}
            />
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-500 to-teal-500"
            />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                {b.eyebrow}
              </p>
              <h3 className="mt-2 max-w-xs font-display text-2xl font-semibold leading-snug text-white">
                {b.title}
              </h3>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-accent-500 decoration-2 underline-offset-4">
                {b.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
