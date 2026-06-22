"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, buttonClasses, Container, Eyebrow, Heading } from "@pharmacie/ui";

// Carrousel hero (attendu e-commerce). Structure statique (image + lien) ; libellés et
// emphase via les traductions (clé `slideN*`). À terme alimentable par le CMS (lot 4.16).
// Autoplay avec pause au survol/focus, navigation flèches + puces.
const SLIDES = [
  { key: "slide1", image: "/images/slide-1.jpg", href: "/categorie/bons-plans", offer: true },
  { key: "slide2", image: "/images/slide-2.jpg", href: "/aide/conseil", offer: false },
  { key: "slide3", image: "/images/slide-3.jpg", href: "/categorie/visage-soin", offer: false },
] as const;

export function Hero() {
  const t = useTranslations("hero");
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
          aria-roledescription={t("carousel")}
          aria-label={t("label")}
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
              aria-roledescription={t("slide")}
              aria-label={`${i + 1} / ${count}`}
            >
              <Image
                src={slide.image}
                alt={t(`${slide.key}Alt`)}
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
                  <Eyebrow>{t(`${slide.key}Eyebrow`)}</Eyebrow>
                  <Heading as="h1" className="mt-5">
                    {t.rich(`${slide.key}Title`, {
                      em: (chunks) => <span className="italic text-brand-600">{chunks}</span>,
                    })}
                  </Heading>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
                    {t(`${slide.key}Text`)}
                  </p>

                  {slide.offer && (
                    <div className="mt-7 inline-flex items-stretch rounded-sm border border-line bg-surface">
                      <Stat value="4" label={t("boughtLabel")} />
                      <span className="w-px bg-line" />
                      <span className="grid place-items-center px-4 font-display text-xl text-muted">
                        =
                      </span>
                      <span className="w-px bg-line" />
                      <Stat value="1" label={t("freeLabel")} accent />
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap items-center gap-5">
                    <Link href={slide.href} className={buttonClasses()}>
                      {t(`${slide.key}Cta`)}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/categorie/tous-les-produits"
                      className={buttonClasses({ variant: "link" })}
                    >
                      {t("seeCatalog")}
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
                aria-label={t("goToSlide", { number: i + 1 })}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`cursor-pointer h-1 rounded-sm transition-all ${
                  i === index ? "w-8 bg-brand-600" : "w-4 bg-foreground/20 hover:bg-foreground/40"
                }`}
              />
            ))}
          </div>

          {/* Flèches */}
          <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2">
            <button
              type="button"
              aria-label={t("prevSlide")}
              onClick={prev}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border border-line bg-surface/90 text-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              aria-label={t("nextSlide")}
              onClick={next}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border border-line bg-surface/90 text-foreground transition-colors hover:bg-brand-50 hover:text-brand-700"
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
