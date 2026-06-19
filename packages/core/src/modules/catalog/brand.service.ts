import type { Brand } from "@prisma/client";
import { buildUniqueSlug } from "../../utils/slugify";
import { brandRepository } from "./brand.repository";

const brandSlugExists = (slug: string): Promise<boolean> =>
  brandRepository.findBySlug(slug).then((brand) => brand !== null);

interface BrandInput {
  name: string;
  active?: boolean;
  shortDescription?: string | null;
  description?: string | null;
  logoKey?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export async function createBrand(input: BrandInput): Promise<Brand> {
  const slug = await buildUniqueSlug(input.name, brandSlugExists);
  const { name, ...rest } = input;
  return brandRepository.create({ name, slug, ...rest });
}

export async function updateBrand(id: string, input: BrandInput): Promise<Brand> {
  return brandRepository.update(id, input);
}

export async function deleteBrand(id: string): Promise<void> {
  await brandRepository.delete(id);
}
