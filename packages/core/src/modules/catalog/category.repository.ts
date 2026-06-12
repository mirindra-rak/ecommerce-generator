import type { Category, Prisma } from "@prisma/client";
import { prisma } from "../../db/client";

// Repository des catégories (arbre auto-référencé). La suppression d'une catégorie
// ayant des enfants ou des produits est refusée au niveau base (onDelete: Restrict) ;
// la règle métier fine est affinée en story 04.

export const categoryRepository = {
  findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  },

  findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { slug } });
  },

  findMany(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] });
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
