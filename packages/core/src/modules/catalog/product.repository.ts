import type { Prisma, Product } from "@prisma/client";
import { prisma } from "../../db/client";

// Repository des produits. Encapsule toutes les requêtes Prisma liées aux produits,
// y compris les écritures imbriquées (options/valeurs, variantes, médias).

// Include canonique pour charger un produit avec toutes ses relations, médias et
// valeurs d'options triés par `position`.
const productInclude = {
  brand: true,
  category: true,
  options: {
    orderBy: { position: "asc" },
    include: { values: { orderBy: { position: "asc" } } },
  },
  variants: {
    include: { optionValues: { include: { optionValue: true } } },
  },
  media: { orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export const productRepository = {
  findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  },

  findBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { slug } });
  },

  findByEan(ean: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { ean } });
  },

  findActive(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findByIdWithRelations(id: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({ where: { id }, include: productInclude });
  },

  findBySlugWithRelations(slug: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({ where: { slug }, include: productInclude });
  },

  create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  },

  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  },
};

export type ProductRepository = typeof productRepository;
