// Badges de moyens de paiement — SVG/markup maison (zéro dépendance, pas de logos
// bitmap). Reconnaissables sans prétendre reproduire fidèlement les chartes de marque.

function Badge({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="grid h-8 w-12 place-items-center rounded-sm border border-line bg-white"
    >
      {children}
    </span>
  );
}

export function VisaMark() {
  return (
    <Badge label="Visa">
      <span className="text-[11px] font-bold italic tracking-tight text-[#1a1f71]">VISA</span>
    </Badge>
  );
}

export function MastercardMark() {
  return (
    <Badge label="Mastercard">
      <svg viewBox="0 0 36 22" className="h-3.5">
        <circle cx="14" cy="11" r="7" fill="#eb001b" />
        <circle cx="22" cy="11" r="7" fill="#f79e1b" fillOpacity="0.9" />
      </svg>
    </Badge>
  );
}

export function CbMark() {
  return (
    <Badge label="Carte Bancaire">
      <span className="text-[10px] font-extrabold italic tracking-tight text-[#264787]">CB</span>
    </Badge>
  );
}

export function PaypalMark() {
  return (
    <Badge label="PayPal">
      <span className="text-[10px] font-bold italic tracking-tight">
        <span className="text-[#003087]">Pay</span>
        <span className="text-[#009cde]">Pal</span>
      </span>
    </Badge>
  );
}

export function BancontactMark() {
  return (
    <Badge label="Bancontact">
      <svg viewBox="0 0 36 12" className="h-2.5">
        <rect x="0" y="0" width="17" height="12" rx="1.5" fill="#005498" />
        <rect x="19" y="0" width="17" height="12" rx="1.5" fill="#ffd800" />
      </svg>
    </Badge>
  );
}

export function PaymentMarks() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <VisaMark />
      <MastercardMark />
      <CbMark />
      <PaypalMark />
      <BancontactMark />
    </div>
  );
}
