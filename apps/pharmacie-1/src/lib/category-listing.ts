// Tri et pagination du listing de catégorie. Fonctions PURES (sans I/O) appliquées côté
// data layer (`lib/catalog.ts`) sur le jeu complet des cartes d'une catégorie — les facettes
// chargent déjà ce jeu entier, on le réutilise. Push-down `orderBy`/`skip`/`take` Prisma =
// optimisation différée (cf. plan, point perf).
import { calculatePriceRange } from "@pharmacie/core/modules/pricing";

export type SortKey = "new" | "price-asc" | "price-desc" | "name";

const SORT_KEYS: readonly SortKey[] = ["new", "price-asc", "price-desc", "name"];

/** Valeur de tri issue de l'URL → `SortKey` valide. Toute valeur inconnue/absente → `"new"`. */
export function parseSort(value: string | undefined): SortKey {
  return value !== undefined && (SORT_KEYS as readonly string[]).includes(value)
    ? (value as SortKey)
    : "new";
}

/** Forme minimale d'une carte nécessaire au tri (testable sans Prisma). */
interface SortableCard {
  name: string;
  variants: ReadonlyArray<{ priceExclTax: number }>;
  taxRate: { id: string; code: string; name: string; rateBps: number };
}

/**
 * Trie une copie des cartes selon `sort`. `"new"` préserve l'ordre d'entrée (le repository
 * renvoie déjà les produits par `createdAt desc`). Le prix de référence est le min TTC des
 * déclinaisons (le « à partir de » affiché) ; un produit sans prix est repoussé en fin.
 */
export function sortCards<T extends SortableCard>(
  cards: readonly T[],
  sort: SortKey,
  locale: string,
): T[] {
  if (sort === "new") return [...cards];
  if (sort === "name") {
    const collator = new Intl.Collator(locale);
    return [...cards].sort((a, b) => collator.compare(a.name, b.name));
  }
  const direction = sort === "price-asc" ? 1 : -1;
  const minPrice = (card: SortableCard) =>
    calculatePriceRange(card.variants, card.taxRate)?.min.priceInclTax ?? Infinity;
  return [...cards].sort((a, b) => (minPrice(a) - minPrice(b)) * direction);
}

export interface Paginated<T> {
  items: T[];
  /** Page effective (toujours dans `[1, totalPages]`). */
  page: number;
  pageSize: number;
  /** Total global, indépendant de la page (pour le compteur et la pagination). */
  total: number;
  totalPages: number;
}

/**
 * Découpe la page demandée. `page` est clampée dans `[1, totalPages]` (jamais de 404 hors borne) ;
 * `totalPages` vaut au moins 1, même sur un jeu vide (l'état vide est rendu par la page).
 */
export function paginate<T>(items: readonly T[], page: number, pageSize: number): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const start = (clamped - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: clamped,
    pageSize,
    total,
    totalPages,
  };
}
