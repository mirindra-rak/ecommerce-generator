import { describe, expect, it } from "vitest";
import { prisma } from "../../db/client";
import { facetRepository, type FacetWithCounts } from "./facet.repository";

// Catégorie « soins » : 2 crèmes (dont une bio) + 1 sérum. Permet de vérifier le drill-down.
async function setup(): Promise<void> {
  const category = await prisma.category.create({ data: { name: "Soins", slug: "soins" } });
  const nature = await prisma.facet.create({
    data: {
      code: "nature",
      name: "Nature",
      position: 0,
      values: {
        create: [
          { code: "creme", label: "Crème", position: 0 },
          { code: "serum", label: "Sérum", position: 1 },
        ],
      },
    },
    include: { values: true },
  });
  const spec = await prisma.facet.create({
    data: {
      code: "specificite",
      name: "Spécificité",
      position: 1,
      values: { create: [{ code: "bio", label: "Bio", position: 0 }] },
    },
    include: { values: true },
  });
  const id = (values: { code: string; id: string }[], code: string): string => {
    const value = values.find((v) => v.code === code);
    if (!value) throw new Error(`valeur manquante : ${code}`);
    return value.id;
  };

  await prisma.product.create({
    data: {
      name: "Crème bio",
      slug: "creme-bio",
      categories: { connect: { id: category.id } },
      facetValues: {
        create: [
          { facetValueId: id(nature.values, "creme") },
          { facetValueId: id(spec.values, "bio") },
        ],
      },
    },
  });
  await prisma.product.create({
    data: {
      name: "Crème simple",
      slug: "creme-simple",
      categories: { connect: { id: category.id } },
      facetValues: { create: [{ facetValueId: id(nature.values, "creme") }] },
    },
  });
  await prisma.product.create({
    data: {
      name: "Sérum",
      slug: "serum-x",
      categories: { connect: { id: category.id } },
      facetValues: { create: [{ facetValueId: id(nature.values, "serum") }] },
    },
  });
}

function countOf(
  facets: FacetWithCounts[],
  facetCode: string,
  valueCode: string,
): number | undefined {
  return facets.find((f) => f.code === facetCode)?.values.find((v) => v.code === valueCode)?.count;
}

describe("facetRepository.findForCategoryWithCounts", () => {
  it("compte les produits par valeur sans filtre actif", async () => {
    await setup();
    const facets = await facetRepository.findForCategoryWithCounts("soins", {});
    expect(countOf(facets, "nature", "creme")).toBe(2);
    expect(countOf(facets, "nature", "serum")).toBe(1);
    expect(countOf(facets, "specificite", "bio")).toBe(1);
  });

  it("drill-down : un filtre sur une facette ajuste les compteurs des autres facettes", async () => {
    await setup();
    const facets = await facetRepository.findForCategoryWithCounts("soins", {
      specificite: ["bio"],
    });
    // « nature » compté SOUS la contrainte specificite=bio.
    expect(countOf(facets, "nature", "creme")).toBe(1); // seule la crème bio
    expect(countOf(facets, "nature", "serum")).toBe(0); // aucun sérum bio
    // « specificite » exclut son propre filtre → compteur inchangé.
    expect(countOf(facets, "specificite", "bio")).toBe(1);
  });
});
