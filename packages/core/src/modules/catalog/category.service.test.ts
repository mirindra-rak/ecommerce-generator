import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { categoryRepository } from "./category.repository";
import {
  CategoryNotEmptyError,
  InvalidCategoryFieldError,
  ReparentCycleError,
} from "./catalog-errors";
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

describe("category.service — champs enrichis (intégration)", () => {
  it("persiste les champs de contenu/SEO", async () => {
    const created = await createCategory({
      name: "Bio & Naturel",
      description: "Notre sélection bio.",
      shortDescription: "Bio",
      metaTitle: "Produits bio",
      metaDescription: "La meilleure sélection bio.",
      metaKeywords: ["bio", "naturel"],
      active: false,
    });
    const found = await categoryRepository.findById(created.id);
    expect(found?.description).toBe("Notre sélection bio.");
    expect(found?.metaTitle).toBe("Produits bio");
    expect(found?.metaKeywords).toEqual(["bio", "naturel"]);
    expect(found?.active).toBe(false);
  });

  it("création minimale (name seul) → défauts active=true, metaKeywords=[]", async () => {
    const created = await createCategory({ name: "Minimal" });
    const found = await categoryRepository.findById(created.id);
    expect(found?.active).toBe(true);
    expect(found?.metaKeywords).toEqual([]);
  });

  it("rejette un caractère interdit dans le nom", async () => {
    await expect(createCategory({ name: "Soins <b>" })).rejects.toBeInstanceOf(
      InvalidCategoryFieldError,
    );
  });

  it("findActiveChildren exclut les catégories inactives", async () => {
    await createCategory({ name: "Visible", active: true });
    await createCategory({ name: "Cachée", active: false });
    const roots = await categoryRepository.findActiveChildren(null);
    const names = roots.map((c) => c.name);
    expect(names).toContain("Visible");
    expect(names).not.toContain("Cachée");
  });
});
