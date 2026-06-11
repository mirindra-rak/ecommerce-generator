import type { Brand, Prisma } from "@prisma/client";
import { prisma } from "../../db/client";

// Repository des marques. Encapsule tout accès Prisma aux marques.

export const brandRepository = {
  findById(id: string): Promise<Brand | null> {
    return prisma.brand.findUnique({ where: { id } });
  },

  findBySlug(slug: string): Promise<Brand | null> {
    return prisma.brand.findUnique({ where: { slug } });
  },

  findMany(): Promise<Brand[]> {
    return prisma.brand.findMany({ orderBy: { name: "asc" } });
  },

  create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return prisma.brand.create({ data });
  },

  update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return prisma.brand.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.brand.delete({ where: { id } });
  },
};

export type BrandRepository = typeof brandRepository;
