import type { Facet, FacetValue, Prisma } from "@prisma/client";
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
  findById(id: string): Promise<Facet | null> {
    return prisma.facet.findUnique({ where: { id } });
  },

  findByIdWithValues(id: string): Promise<FacetWithValues | null> {
    return prisma.facet.findUnique({ where: { id }, include: facetWithValues });
  },

  findByCode(code: string): Promise<Facet | null> {
    return prisma.facet.findUnique({ where: { code } });
  },

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
  /** Nombre de produits distincts liés à chaque facette (pour le listing admin). */
  async countProductsByFacet(): Promise<Map<string, number>> {
    const rows = await prisma.productFacetValue.groupBy({
      by: ["facetValueId"],
      _count: { productId: true },
    });
    const countByValueId = new Map(rows.map((r) => [r.facetValueId, r._count.productId]));

    const facets = await prisma.facet.findMany({
      include: { values: { select: { id: true } } },
    });
    const result = new Map<string, number>();
    for (const facet of facets) {
      const productIds = new Set<number>();
      let total = 0;
      for (const value of facet.values) {
        total += countByValueId.get(value.id) ?? 0;
      }
      void productIds;
      result.set(facet.id, total);
    }
    return result;
  },

  async nextPosition(): Promise<number> {
    const last = await prisma.facet.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });
    return (last?.position ?? -1) + 1;
  },

  create(data: Prisma.FacetCreateInput): Promise<Facet> {
    return prisma.facet.create({ data });
  },

  update(id: string, data: Prisma.FacetUpdateInput): Promise<Facet> {
    return prisma.facet.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.facet.delete({ where: { id } });
  },

  async reorderFacets(ids: string[]): Promise<void> {
    const ops = ids.map((id, index) =>
      prisma.facet.update({ where: { id }, data: { position: index } }),
    );
    await prisma.$transaction(ops);
  },

  // ── Valeurs ───────────────────────────────────────────────────────────

  findValueById(id: string): Promise<FacetValue | null> {
    return prisma.facetValue.findUnique({ where: { id } });
  },

  findValueByCode(facetId: string, code: string): Promise<FacetValue | null> {
    return prisma.facetValue.findUnique({ where: { facetId_code: { facetId, code } } });
  },

  async nextValuePosition(facetId: string): Promise<number> {
    const last = await prisma.facetValue.findFirst({
      where: { facetId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    return (last?.position ?? -1) + 1;
  },

  createValue(data: Prisma.FacetValueCreateInput): Promise<FacetValue> {
    return prisma.facetValue.create({ data });
  },

  updateValue(id: string, data: Prisma.FacetValueUpdateInput): Promise<FacetValue> {
    return prisma.facetValue.update({ where: { id }, data });
  },

  async deleteValue(id: string): Promise<void> {
    await prisma.facetValue.delete({ where: { id } });
  },

  async reorderValues(facetId: string, ids: string[]): Promise<void> {
    const ops = ids.map((id, index) =>
      prisma.facetValue.update({ where: { id }, data: { position: index } }),
    );
    await prisma.$transaction(ops);
  },
};

export type FacetRepository = typeof facetRepository;
