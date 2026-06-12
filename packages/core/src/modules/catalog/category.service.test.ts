import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { categoryRepository } from "./category.repository";
import { CategoryNotEmptyError, ReparentCycleError } from "./catalog-errors";
import { canReparent, createCategory, deleteCategory, updateCategory } from "./category.service";

describe("canReparent", () => {
  it("refuse soi-même et les descendants, accepte le reste et la racine", () => {
    expect(canReparent("a", "a", [])).toBe(false);
    expect(canReparent("a", "b", ["b", "c"])).toBe(false);
    expect(canReparent("a", "x", ["b", "c"])).toBe(true);
    expect(canReparent("a", null, ["b"])).toBe(true);
  });
});

describe("category.service (intégration)", () => {
  it("génère un slug unique en cas de noms identiques", async () => {
    const first = await createCategory({ name: "Soin Visage" });
    const second = await createCategory({ name: "Soin Visage" });
    expect(first.slug).toBe("soin-visage");
    expect(second.slug).toBe("soin-visage-2");
  });

  it("re-parente une catégorie et refuse un cycle", async () => {
    const root = await createCategory({ name: "Racine" });
    const child = await createCategory({ name: "Enfant", parentId: root.id });

    // Déplacer la racine sous son propre enfant → cycle refusé.
    await expect(
      updateCategory(root.id, { name: "Racine", parentId: child.id }),
    ).rejects.toBeInstanceOf(ReparentCycleError);

    // Déplacement valide (enfant → racine).
    const moved = await updateCategory(child.id, { name: "Enfant", parentId: null });
    expect(moved.parentId).toBeNull();
  });

  it("refuse la suppression d'une catégorie peuplée, accepte une feuille", async () => {
    const parent = await createCategory({ name: "Parent" });
    await createCategory({ name: "Sous", parentId: parent.id });

    await expect(deleteCategory(parent.id)).rejects.toBeInstanceOf(CategoryNotEmptyError);

    const leaf = await createCategory({ name: "Feuille" });
    await deleteCategory(leaf.id);
    expect(await categoryRepository.findById(leaf.id)).toBeNull();
  });

  it("refuse la suppression d'une catégorie contenant un produit", async () => {
    const category = await createCategory({ name: "Avec produit" });
    await prisma.product.create({
      data: { name: "P", slug: "p-test", category: { connect: { id: category.id } } },
    });
    await expect(deleteCategory(category.id)).rejects.toBeInstanceOf(CategoryNotEmptyError);
  });
});
