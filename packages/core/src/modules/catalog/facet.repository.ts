import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/client";

// Repository des facettes (filtres produit). Encapsule l'accès Prisma à la taxonomie
// Facet / FacetValue.

const facetWithValues = {
  values: { orderBy: { position: "asc" } },
} satisfies Prisma.FacetInclude;

export type FacetWithValues = Prisma.FacetGetPayload<{ include: typeof facetWithValues }>;

export interface FacetValueCount {
  code: string;
  label: string;
  count: number;
}

export interface FacetWithCounts {
  code: string;
  name: string;
  values: FacetValueCount[];
}

export const facetRepository = {
  /** Toutes les facettes avec leurs valeurs, triées par position (rendu filtres/formulaire). */
  findAllWithValues(): Promise<FacetWithValues[]> {
    return prisma.facet.findMany({
      include: facetWithValues,
      orderBy: { position: "asc" },
    });
  },

  /**
   * Facettes et valeurs PRÉSENTES parmi les produits actifs d'une catégorie (pour la
   * sidebar de filtres) : on n'affiche ni facette ni valeur sans produit correspondant.
   */
  findForCategory(slug: string): Promise<FacetWithValues[]> {
    const presentInCategory = {
      products: { some: { product: { active: true, categories: { some: { slug } } } } },
    };
    return prisma.facet.findMany({
      where: { values: { some: presentInCategory } },
      include: {
        values: { where: presentInCategory, orderBy: { position: "asc" } },
      },
      orderBy: { position: "asc" },
    });
  },

  /**
   * Idem `findForCategory`, mais chaque valeur porte son **compteur drill-down** : nombre
   * de produits actifs de la catégorie qui satisfont les filtres des AUTRES facettes (on
   * exclut la facette courante, car ses valeurs sont en OU). Une requête `groupBy` par
   * facette présente.
   */
  async findForCategoryWithCounts(
    slug: string,
    filters: Record<string, string[]>,
  ): Promise<FacetWithCounts[]> {
    const present = await this.findForCategory(slug);
    const presentCodes = new Set(present.map((facet) => facet.code));

    const result: FacetWithCounts[] = [];
    for (const facet of present) {
      // Filtres actifs des autres facettes présentes (la facette courante est exclue).
      const baseClauses = Object.entries(filters)
        .filter(
          ([code, codes]) => code !== facet.code && presentCodes.has(code) && codes.length > 0,
        )
        .map(([facetCode, codes]) => ({
          facetValues: {
            some: { facetValue: { facet: { code: facetCode }, code: { in: codes } } },
          },
        }));

      const grouped = await prisma.productFacetValue.groupBy({
        by: ["facetValueId"],
        where: {
          facetValue: { facetId: facet.id },
          product: { active: true, categories: { some: { slug } }, AND: baseClauses },
        },
        _count: { facetValueId: true },
      });
      const countById = new Map(grouped.map((row) => [row.facetValueId, row._count.facetValueId]));

      result.push({
        code: facet.code,
        name: facet.name,
        values: facet.values.map((value) => ({
          code: value.code,
          label: value.label,
          count: countById.get(value.id) ?? 0,
        })),
      });
    }
    return result;
  },
};

export type FacetRepository = typeof facetRepository;
