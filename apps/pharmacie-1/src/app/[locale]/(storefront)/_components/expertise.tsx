import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Container, Eyebrow, Heading, Section } from "@pharmacie/ui";
import { LeafIcon, ShieldIcon, StethoscopeIcon } from "./icons";

// Structure statique (icône + clé de message) ; les libellés viennent des traductions.
const POINTS = [
  { Icon: StethoscopeIcon, key: "advice" },
  { Icon: ShieldIcon, key: "authentic" },
  { Icon: LeafIcon, key: "responsible" },
] as const;

export function Expertise() {
  const t = useTranslations("expertise");

  return (
    <Section>
      <Container className="grid items-center gap-16 lg:grid-cols-2">
        <div className="relative order-last lg:order-first">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm border border-line bg-surface">
            <Image
              src="/images/conseil.jpg"
              alt="Application d'un soin recommandé par un pharmacien"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-teal-500 to-brand-500"
            />
          </div>
          <div className="absolute -right-3 bottom-8 max-w-[10rem] rounded-sm border border-line bg-surface p-4 sm:-right-6">
            <p className="font-display text-2xl font-semibold text-brand-600">{t("badgeValue")}</p>
            <p className="mt-1 text-xs text-muted">{t("badgeLabel")}</p>
          </div>
        </div>

        <div>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <Heading className="mt-6" rule>
            {t("heading")}
          </Heading>
          <p className="mt-6 text-base leading-relaxed text-muted">{t("intro")}</p>

          <ul className="mt-8 divide-y divide-line border-y border-line">
            {POINTS.map(({ Icon, key }) => (
              <li key={key} className="flex gap-4 py-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t(`${key}Title`)}</p>
                  <p className="mt-0.5 text-sm leading-snug text-muted">{t(`${key}Text`)}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/a-propos"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 underline decoration-accent-500 decoration-2 underline-offset-4 hover:decoration-brand-600"
          >
            {t("link")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
