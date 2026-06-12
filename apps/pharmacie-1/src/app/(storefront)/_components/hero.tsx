"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, buttonClasses, Container, Eyebrow, Heading } from "@pharmacie/ui";

type Slide = {
  image: string;
  alt: string;
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  cta: { label: string; href: string };
  offer?: boolean;
};

// Carrousel hero (attendu e-commerce). Contenu statique ; à terme alimentable par
// le CMS (lot 4.16). Autoplay avec pause au survol/focus, navigation flèches + puces.
const SLIDES: Slide[] = [
  {
    image: "/images/slide-1.jpg",
    alt: "Sélection de soins de parapharmacie",
    eyebrow: "Offre du moment",
    title: (
      <>
        Vos essentiels beauté & santé,{" "}
        <span className="italic text-brand-600">livrés chez vous</span>
      </>
    ),
    text: "Plus de 1 000 marques, le conseil d'un pharmacien et la livraison offerte dès 49 €.",
    cta: { label: "J'en profite", href: "/categorie/bons-plans" },
    offer: true,
  },
  {
    image: "/images/slide-2.jpg",
    alt: "Soin du visage recommandé par un pharmacien",
    eyebrow: "Conseil pharmacien",
    title: (
      <>
        Le bon soin, <span className="italic text-brand-600">recommandé par un expert</span>
      </>
    ),
    text: "Une équipe diplômée vous guide vers ce qui convient vraiment à votre peau.",
    cta: { label: "Nos conseils", href: "/aide/conseil" },
  },
  {
    image: "/images/slide-3.jpg",
    alt: "Routine éclat à la vitamine C",
    eyebrow: "Routine éclat",
    title: (
      <>
        Vitamine C & actifs pour une <span className="italic text-brand-600">peau éclatante</span>
      </>
    ),
    text: "Compléments et soins ciblés, sélectionnés par nos pharmaciens.",
    cta: { label: "Découvrir", href: "/categorie/visage-soin" },
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = SLIDES.length;

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(next, 6000);
    return () => clearTimeout(id);
  }, [next, paused]);

  return (
    <section className="bg-paper">
      <Container className="py-10 lg:py-12">
        <div
          className="relative h-[30rem] overflow-hidden rounded-sm border border-line sm:h-[36rem]"
          aria-roledescription="carrousel"
          aria-label="Mises en avant"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "z-10 opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={i !== index}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${i + 1} / ${count}`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1152px) 1088px, 100vw"
                className="object-cover"
              />
              {/* Lisibilité : dégradé papier depuis la gauche */}
              <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/85 to-transparent sm:via-paper/70" />
              {/* Filet d'accent */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-teal-500 to-accent-600"
              />

              <div className="relative flex h-full items-center">
                <div className="max-w-lg px-8 sm:px-12 lg:px-16">
                  <Eyebrow>{slide.eyebrow}</Eyebrow>
                  <Heading as="h1" className="mt-5">
                    {slide.title}
                  </Heading>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-muted">{slide.text}</p>

                  {slide.offer && (
                    <div className="mt-7 inline-flex items-stretch rounded-sm border border-line bg-surface">
                      <Stat value="4" label="achetés" />
                      <span className="w-px bg-line" />
                      <span className="grid place-items-center px-4 font-display text-xl text-muted">
                        =
                      </span>
                      <span className="w-px bg-line" />
                      <Stat value="1" label="offert" accent />
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap items-center gap-5">
                    <Link href={slide.cta.href} className={buttonClasses()}>
                      {slide.cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/categorie/tous-les-produits"
                      className={buttonClasses({ variant: "link" })}
                    >
                      Voir le catalogue
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Puces */}
          <div className="absolute bottom-6 left-8 z-20 flex items-center gap-2 sm:left-12 lg:left-16">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.image}
                type="button"
                aria-label={`Aller à la diapositive ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`h-1 rounded-sm transition-all ${
                  i === index ? "w-8 bg-brand-600" : "w-4 bg-foreground/20 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>

          {/* Flèches */}
          <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
            <button
              type="button"
              aria-label="Diapositive précédente"
              onClick={prev}
              className="grid h-9 w-9 place-items-center rounded-sm border border-line bg-surface/90 text-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Diapositive suivante"
              onClick={next}
              className="grid h-9 w-9 place-items-center rounded-sm border border-line bg-surface/90 text-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stat({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="px-5 py-3 text-center leading-none">
      <p
        className={`font-display text-3xl font-semibold ${accent ? "text-accent-600" : "text-brand-700"}`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
