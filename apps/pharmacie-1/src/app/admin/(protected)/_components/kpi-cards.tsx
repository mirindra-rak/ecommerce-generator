"use client";

import { BagIcon, PackageIcon, StorefrontIcon, TagIcon } from "@pharmacie/ui";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

interface Kpi {
  label: string;
  value: number;
  description: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  colorClass: string;
}

const KPIS: Kpi[] = [
  {
    label: "Catégories",
    value: 0,
    description: "Arborescence catalogue",
    href: "/admin/categories",
    Icon: TagIcon,
    colorClass: "bg-brand-600",
  },
  {
    label: "Marques",
    value: 0,
    description: "Fournisseurs référencés",
    href: "/admin/marques",
    Icon: StorefrontIcon,
    colorClass: "bg-accent-600",
  },
  {
    label: "Produits actifs",
    value: 0,
    description: "Visibles en boutique",
    href: "/admin",
    Icon: PackageIcon,
    colorClass: "bg-teal-600",
  },
  {
    label: "Commandes",
    value: 0,
    description: "Bientôt disponible",
    href: "/admin",
    Icon: BagIcon,
    colorClass: "bg-info-solid",
  },
];

interface KpiCardsProps {
  categories: number;
  brands: number;
  products: number;
}

export function KpiCards({ categories, brands, products }: KpiCardsProps) {
  const kpis = KPIS.map((k, i) => ({
    ...k,
    value: [categories, brands, products, 0][i],
  }));

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.Icon;
        return (
          <Link
            key={kpi.label}
            href={kpi.href}
            className={`group flex flex-col rounded-sm p-5 text-white transition-opacity hover:opacity-90 ${kpi.colorClass}`}
          >
            <div className="flex items-center justify-between">
              <Icon className="h-6 w-6 opacity-75" />
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                voir
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold tabular-nums leading-none">{kpi.value}</p>
            <p className="mt-1.5 text-sm font-semibold">{kpi.label}</p>
            <p className="mt-0.5 text-[11px] opacity-65">{kpi.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
