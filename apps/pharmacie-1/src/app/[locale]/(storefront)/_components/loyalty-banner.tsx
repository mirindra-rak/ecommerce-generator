import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Container } from "@pharmacie/ui";
import { GiftIcon, PercentIcon, SparklesIcon } from "./icons";

// Structure statique (icône + clé de message) ; les libellés viennent des traductions.
const PERKS = [
  { Icon: PercentIcon, key: "perkDiscount" },
  { Icon: GiftIcon, key: "perkGifts" },
  { Icon: SparklesIcon, key: "perkPrivateSales" },
] as const;

export function LoyaltyBanner() {
  const t = useTranslations("loyalty");

  return (
    <Container className="py-16">
      <div className="relative overflow-hidden rounded-sm border border-line px-10 py-16 sm:px-12">
        <Image
          src="/images/loyalty.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 1100px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-accent-700/95 via-accent-700/85 to-accent-600/50" />

        <div className="relative max-w-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-500">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-white">
            {t("heading")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/80">{t("text")}</p>

          <ul className="mt-6 space-y-3">
            {PERKS.map(({ Icon, key }) => (
              <li key={key} className="flex items-center gap-3 text-white">
                <Icon className="h-5 w-5 shrink-0 text-teal-500" />
                <span className="text-sm font-medium">{t(key)}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/compte/inscription"
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3 text-sm font-semibold tracking-tight text-brand-700 transition-colors hover:bg-brand-50"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Container>
  );
}
