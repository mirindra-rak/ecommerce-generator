import type { Category, Prisma } from "@prisma/client";
import { prisma } from "../../db/client";

/** Catégorie racine avec ses enfants directs chargés (arbre de navigation). */
export type CategoryWithChildren = Category & { children: Category[] };

// Repository des catégories (arbre auto-référencé). La suppression d'une catégorie
// ayant des enfants ou des produits est refusée au niveau base (onDelete: Restrict) ;
// la règle métier fine est affinée en story 04.

export const categoryRepository = {
  findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  },

  findBySlug(slug: string, excludeId?: string): Promise<Category | null> {
    if (excludeId) {
      return prisma.category.findFirst({
        where: { slug, id: { not: excludeId } },
      });
    }
    return prisma.category.findUnique({ where: { slug } });
  },

  findMany(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] });
  },

  /** Comme `findMany`, mais avec le nombre de produits associés (M2M) par catégorie. */
  async findManyWithProductCounts(): Promise<(Category & { productCount: number })[]> {
    const rows = await prisma.category.findMany({
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    return rows.map(({ _count, ...category }) => ({ ...category, productCount: _count.products }));
  },

  /** Slugs + date de mise à jour des catégories ACTIVES (visibles boutique), pour le sitemap. */
  findActiveSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
    return prisma.category.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });
  },

  /** Enfants directs d'une catégorie (ou racines si `parentId` vaut `null`). */
  findChildren(parentId: string | null): Promise<Category[]> {
    return prisma.category.findMany({
      where: { parentId },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });
  },

  /** Enfants directs ACTIFS (visibles côté boutique). */
  findActiveChildren(parentId: string | null): Promise<Category[]> {
    return prisma.category.findMany({
      where: { parentId, active: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
    });
  },

  /**
   * Arbre de navigation : racines ACTIVES avec leurs enfants directs ACTIFS, en une
   * seule requête (pas de N+1). Trié par `position` puis `name` aux deux niveaux.
   */
  findActiveMenuTree(): Promise<CategoryWithChildren[]> {
    return prisma.category.findMany({
      where: { parentId: null, active: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      include: {
        children: {
          where: { active: true },
          orderBy: [{ position: "asc" }, { name: "asc" }],
        },
      },
    });
  },

  /** Nombre de produits associés à une catégorie (relation M2M) — pour l'alerte de suppression. */
  countProducts(id: string): Promise<number> {
    return prisma.product.count({ where: { categories: { some: { id } } } });
  },

  /** Tous les descendants (récursif) via CTE PostgreSQL. */
  findDescendants(id: string): Promise<Category[]> {
    return prisma.$queryRaw<Category[]>`
      WITH RECURSIVE sub AS (
        SELECT * FROM "Category" WHERE "parentId" = ${id}
        UNION ALL
        SELECT c.* FROM "Category" c JOIN sub ON c."parentId" = sub.id
      )
      SELECT * FROM sub
    `;
  },

  create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  },

  update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  },
};

export type CategoryRepository = typeof categoryRepository;
