import type { Brand } from "@prisma/client";
import { buildUniqueSlug } from "../../utils/slugify";
import { brandRepository } from "./brand.repository";

// Services de domaine des marques (story 04). Slug auto-généré unique ; supprimer une
// marque détache ses produits (onDelete: SetNull, cf. schéma).

const brandSlugExists = (slug: string): Promise<boolean> =>
  brandRepository.findBySlug(slug).then((brand) => brand !== null);

export async function createBrand(input: { name: string }): Promise<Brand> {
  const slug = await buildUniqueSlug(input.name, brandSlugExists);
  return brandRepository.create({ name: input.name, slug });
}

export async function updateBrand(id: string, input: { name: string }): Promise<Brand> {
  return brandRepository.update(id, { name: input.name });
}

export async function deleteBrand(id: string): Promise<void> {
  await brandRepository.delete(id);
}
