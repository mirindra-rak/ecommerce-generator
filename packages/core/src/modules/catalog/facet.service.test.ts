import { describe, expect, it } from "vitest";
import { facetRepository } from "./facet.repository";
import {
  createFacet,
  createFacetValue,
  deleteFacet,
  deleteFacetValue,
  DuplicateFacetCodeError,
  DuplicateFacetValueCodeError,
  reorderFacets,
  reorderFacetValues,
  updateFacet,
  updateFacetValue,
} from "./facet.service";

describe("facet.service (intégration)", () => {
  it("crée une facette avec code auto-slugifié et position auto", async () => {
    const facet = await createFacet({ name: "Forme galénique" });
    expect(facet.code).toBe("forme-galenique");
    expect(facet.position).toBeGreaterThanOrEqual(0);

    const found = await facetRepository.findById(facet.id);
    expect(found?.name).toBe("Forme galénique");
  });

  it("refuse un code dupliqué", async () => {
    await createFacet({ name: "Unique Test" });
    await expect(createFacet({ name: "Unique Test" })).rejects.toThrow(DuplicateFacetCodeError);
  });

  it("renomme une facette sans changer le code", async () => {
    const facet = await createFacet({ name: "À Renommer" });
    const updated = await updateFacet(facet.id, { name: "Renommée" });
    expect(updated.name).toBe("Renommée");
    expect(updated.code).toBe(facet.code);
  });

  it("supprime une facette", async () => {
    const facet = await createFacet({ name: "À Supprimer" });
    await deleteFacet(facet.id);
    expect(await facetRepository.findById(facet.id)).toBeNull();
  });

  it("réordonne les facettes", async () => {
    const a = await createFacet({ name: "Reorder A" });
    const b = await createFacet({ name: "Reorder B" });
    await reorderFacets([b.id, a.id]);

    const bAfter = await facetRepository.findById(b.id);
    const aAfter = await facetRepository.findById(a.id);
    expect(bAfter?.position).toBe(0);
    expect(aAfter?.position).toBe(1);
  });

  it("crée une valeur avec code auto et position auto", async () => {
    const facet = await createFacet({ name: "Valeur Parent" });
    const value = await createFacetValue(facet.id, { label: "Comprimé pelliculé" });
    expect(value.code).toBe("comprime-pellicule");
    expect(value.position).toBe(0);
  });

  it("refuse un code valeur dupliqué dans la même facette", async () => {
    const facet = await createFacet({ name: "Dup Value Parent" });
    await createFacetValue(facet.id, { label: "Tube" });
    await expect(createFacetValue(facet.id, { label: "Tube" })).rejects.toThrow(
      DuplicateFacetValueCodeError,
    );
  });

  it("renomme une valeur sans changer le code", async () => {
    const facet = await createFacet({ name: "Rename Val Parent" });
    const value = await createFacetValue(facet.id, { label: "Ancien" });
    const updated = await updateFacetValue(value.id, { label: "Nouveau" });
    expect(updated.label).toBe("Nouveau");
    expect(updated.code).toBe(value.code);
  });

  it("supprime une valeur", async () => {
    const facet = await createFacet({ name: "Delete Val Parent" });
    const value = await createFacetValue(facet.id, { label: "Éphémère" });
    await deleteFacetValue(value.id);
    expect(await facetRepository.findValueById(value.id)).toBeNull();
  });

  it("réordonne les valeurs", async () => {
    const facet = await createFacet({ name: "Reorder Val Parent" });
    const v1 = await createFacetValue(facet.id, { label: "Premier" });
    const v2 = await createFacetValue(facet.id, { label: "Deuxième" });
    await reorderFacetValues(facet.id, [v2.id, v1.id]);

    const v2After = await facetRepository.findValueById(v2.id);
    const v1After = await facetRepository.findValueById(v1.id);
    expect(v2After?.position).toBe(0);
    expect(v1After?.position).toBe(1);
  });
});
