import { Prisma, type Category } from "@prisma/client";
import { buildUniqueSlug } from "../../utils/slugify";
import { categoryRepository } from "./category.repository";
import { CategoryNotEmptyError, ReparentCycleError } from "./catalog-errors";
import { validateCategoryFields } from "./category-fields";

// Services de domaine des catégories (story 04). Orchestrent les repositories,
// génèrent les slugs, valident l'anti-cycle et traduisent les erreurs d'intégrité.

/**
 * Vrai si la catégorie peut être rattachée à `newParentId` sans créer de cycle :
 * le nouveau parent ne doit être ni la catégorie elle-même ni l'un de ses descendants.
 */
export function canReparent(
  categoryId: string,
  newParentId: string | null,
  descendantIds: readonly string[],
): boolean {
  if (newParentId === null) return true;
  if (newParentId === categoryId) return false;
  return !descendantIds.includes(newParentId);
}

const categorySlugExists = (slug: string): Promise<boolean> =>
  categoryRepository.findBySlug(slug).then((category) => category !== null);

// Champs de contenu/SEO/visibilité/douane (tous optionnels).
export interface CategoryContentInput {
  active?: boolean;
  description?: string | null;
  additionalInfo?: string | null;
  shortDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
  coverImageKey?: string | null;
  thumbnailKey?: string | null;
  menuThumbnailKey?: string | null;
  countryOfOrigin?: string | null;
  hsCode?: string | null;
}

// Sous-ensemble persistable (Prisma ignore les `undefined`).
function toContentData(input: CategoryContentInput) {
  return {
    active: input.active,
    description: input.description,
    additionalInfo: input.additionalInfo,
    shortDescription: input.shortDescription,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    metaKeywords: input.metaKeywords,
    coverImageKey: input.coverImageKey,
    thumbnailKey: input.thumbnailKey,
    menuThumbnailKey: input.menuThumbnailKey,
    countryOfOrigin: input.countryOfOrigin,
    hsCode: input.hsCode,
  };
}

export interface CreateCategoryInput extends CategoryContentInput {
  name: string;
  parentId?: string | null;
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  validateCategoryFields(input);
  const slug = await buildUniqueSlug(input.name, categorySlugExists);
  return categoryRepository.create({
    name: input.name,
    slug,
    ...toContentData(input),
    ...(input.parentId ? { parent: { connect: { id: input.parentId } } } : {}),
  });
}

export interface UpdateCategoryInput extends CategoryContentInput {
  name: string;
  parentId: string | null;
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  validateCategoryFields(input);
  const descendants = await categoryRepository.findDescendants(id);
  if (
    !canReparent(
      id,
      input.parentId,
      descendants.map((c) => c.id),
    )
  ) {
    throw new ReparentCycleError();
  }
  return categoryRepository.update(id, {
    name: input.name,
    ...toContentData(input),
    parent: input.parentId ? { connect: { id: input.parentId } } : { disconnect: true },
  });
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await categoryRepository.delete(id);
  } catch (error) {
    // Violation de clé étrangère (onDelete: Restrict) → SOUS-CATÉGORIES présentes. Les
    // produits associés (M2M) sont détachés en cascade et n'empêchent pas la suppression.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new CategoryNotEmptyError();
    }
    throw error;
  }
}
