import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { categoryRepository } from "./category.repository";

describe("categoryRepository", () => {
  it("construit un arbre et lit enfants et descendants", async () => {
    const root = await categoryRepository.create({ name: "Visage", slug: "visage" });
    const child = await categoryRepository.create({
      name: "Soins",
      slug: "soins",
      parent: { connect: { id: root.id } },
    });
    const grandChild = await categoryRepository.create({
      name: "Crèmes",
      slug: "cremes",
      parent: { connect: { id: child.id } },
    });

    const children = await categoryRepository.findChildren(root.id);
    expect(children.map((c) => c.id)).toEqual([child.id]);

    const descendants = await categoryRepository.findDescendants(root.id);
    expect(descendants.map((c) => c.id).sort()).toEqual([child.id, grandChild.id].sort());
  });

  it("refuse un slug dupliqué", async () => {
    await categoryRepository.create({ name: "Cheveux", slug: "cheveux" });
    await expect(categoryRepository.create({ name: "Doublon", slug: "cheveux" })).rejects.toThrow();
  });

  it("refuse la suppression d'une catégorie ayant des enfants (Restrict)", async () => {
    const root = await categoryRepository.create({ name: "Corps", slug: "corps" });
    await categoryRepository.create({
      name: "Hydratation",
      slug: "hydratation",
      parent: { connect: { id: root.id } },
    });

    await expect(categoryRepository.delete(root.id)).rejects.toThrow();
  });

  it("refuse la suppression d'une catégorie ayant des produits (Restrict)", async () => {
    const cat = await categoryRepository.create({ name: "Solaire", slug: "solaire" });
    await prisma.product.create({
      data: { name: "SPF50", slug: "spf50", category: { connect: { id: cat.id } } },
    });

    await expect(categoryRepository.delete(cat.id)).rejects.toThrow();
  });

  it("supprime une catégorie feuille sans erreur", async () => {
    const cat = await categoryRepository.create({ name: "Bébé", slug: "bebe" });
    await categoryRepository.delete(cat.id);
    expect(await categoryRepository.findById(cat.id)).toBeNull();
  });
});
