import type { Product } from "@prisma/client";
import { prisma } from "../../db/client";

// Exemplar de Repository concret. Sert de patron aux autres modules : on encapsule
// ici TOUTES les requêtes Prisma liées aux produits ; rien ne fuit dans les routes.

export const productRepository = {
  findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  },

  findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { slug } });
  },

  findActive(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  },
};

export type ProductRepository = typeof productRepository;
