import { useTranslations } from "next-intl";
import { Container } from "@pharmacie/ui";
import { RefreshIcon, ShieldIcon, StethoscopeIcon, TruckIcon } from "./icons";

// Structure statique (icône + clé de message) ; les libellés viennent des traductions.
const ITEMS = [
  { Icon: StethoscopeIcon, key: "advice" },
  { Icon: TruckIcon, key: "shipping" },
  { Icon: ShieldIcon, key: "payment" },
  { Icon: RefreshIcon, key: "returns" },
] as const;

export function ReassuranceBar() {
  const t = useTranslations("reassurance");

  return (
    <section className="border-b border-line bg-surface">
      <Container className="grid grid-cols-2 divide-y divide-line sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {ITEMS.map(({ Icon, key }) => (
          <div key={key} className="flex items-center gap-3 px-2 py-8 lg:justify-center lg:px-6">
            <Icon className="h-6 w-6 shrink-0 text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t(`${key}Title`)}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">{t(`${key}Subtitle`)}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
