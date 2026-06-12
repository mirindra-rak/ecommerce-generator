import { Container } from "@pharmacie/ui";
import { RefreshIcon, ShieldIcon, StethoscopeIcon, TruckIcon } from "./icons";

const ITEMS = [
  { Icon: StethoscopeIcon, title: "Conseil pharmacien", subtitle: "Équipe diplômée, 6j/7" },
  { Icon: TruckIcon, title: "Livraison offerte", subtitle: "Dès 49 €, en 48 h" },
  { Icon: ShieldIcon, title: "Paiement sécurisé", subtitle: "3D Secure · CB, PayPal" },
  { Icon: RefreshIcon, title: "Retours 30 jours", subtitle: "Satisfait ou remboursé" },
];

export function ReassuranceBar() {
  return (
    <section className="border-b border-line bg-surface">
      <Container className="grid grid-cols-2 divide-y divide-line sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        {ITEMS.map(({ Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3 px-2 py-8 lg:justify-center lg:px-6">
            <Icon className="h-6 w-6 shrink-0 text-teal-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">{subtitle}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
