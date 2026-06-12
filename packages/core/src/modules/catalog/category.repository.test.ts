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

  it("findActiveMenuTree : racines actives triées + enfants actifs uniquement", async () => {
    const visage = await categoryRepository.create({
      name: "Visage",
      slug: "visage",
      position: 0,
    });
    const cheveux = await categoryRepository.create({
      name: "Cheveux",
      slug: "cheveux",
      position: 1,
    });
    // Racine masquée : ne doit pas remonter.
    await categoryRepository.create({ name: "Brouillon", slug: "brouillon", active: false });

    await categoryRepository.create({
      name: "Sérums",
      slug: "serums",
      position: 1,
      parent: { connect: { id: visage.id } },
    });
    await categoryRepository.create({
      name: "Crèmes",
      slug: "cremes",
      position: 0,
      parent: { connect: { id: visage.id } },
    });
    // Enfant masqué : ne doit pas remonter.
    await categoryRepository.create({
      name: "Archive",
      slug: "archive",
      active: false,
      parent: { connect: { id: visage.id } },
    });

    const tree = await categoryRepository.findActiveMenuTree();

    expect(tree.map((c) => c.slug)).toEqual([visage.slug, cheveux.slug]);
    expect(tree[0]?.children.map((c) => c.slug)).toEqual(["cremes", "serums"]);
    expect(tree[1]?.children).toEqual([]);
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

  it("supprime une catégorie associée à des produits (M2M détachée, produit conservé)", async () => {
    const cat = await categoryRepository.create({ name: "Solaire", slug: "solaire" });
    const product = await prisma.product.create({
      data: { name: "SPF50", slug: "spf50", categories: { connect: { id: cat.id } } },
    });
    expect(await categoryRepository.countProducts(cat.id)).toBe(1);

    await categoryRepository.delete(cat.id);

    expect(await categoryRepository.findById(cat.id)).toBeNull();
    const survivor = await prisma.product.findUnique({
      where: { id: product.id },
      include: { categories: true },
    });
    expect(survivor?.categories).toEqual([]);
  });

  it("supprime une catégorie feuille sans erreur", async () => {
    const cat = await categoryRepository.create({ name: "Bébé", slug: "bebe" });
    await categoryRepository.delete(cat.id);
    expect(await categoryRepository.findById(cat.id)).toBeNull();
  });
});
