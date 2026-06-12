import { RefreshIcon, ShieldIcon, StethoscopeIcon, TruckIcon } from "./icons";

// Barre de réassurance (sous le hero) : arguments de confiance d'une parapharmacie.
const ITEMS = [
  {
    Icon: StethoscopeIcon,
    title: "Conseil pharmacien",
    subtitle: "Une équipe diplômée à votre écoute 6j/7",
  },
  {
    Icon: TruckIcon,
    title: "Livraison offerte",
    subtitle: "Dès 49 € d'achat, en 48 h",
  },
  {
    Icon: ShieldIcon,
    title: "Paiement sécurisé",
    subtitle: "3D Secure · CB, PayPal & plus",
  },
  {
    Icon: RefreshIcon,
    title: "Retours 30 jours",
    subtitle: "Satisfait ou remboursé",
  },
];

export function ReassuranceBar() {
  return (
    <section className="border-y border-slate-200/80 bg-surface">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-8 lg:grid-cols-4">
        {ITEMS.map(({ Icon, title, subtitle }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-50 text-accent-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">{subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
