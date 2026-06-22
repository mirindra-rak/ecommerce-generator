import { describe, expect, it } from "vitest";
import { inferFacetValueCodes } from "./seed-facets";

describe("inferFacetValueCodes", () => {
  it("déduit la nature et le conditionnement depuis le libellé produit", () => {
    expect(
      inferFacetValueCodes({
        name: "Embryolisse CC Cream + Chocolat Tube 30 ml",
        description: null,
        shortDescription: null,
        metaTitle: null,
        metaDescription: null,
        categorySlug: "visage",
      }),
    ).toEqual(expect.arrayContaining(["creme", "tube"]));
  });

  it("déduit les spécificités et indications depuis le contenu marketing", () => {
    expect(
      inferFacetValueCodes({
        name: "Gel lavant bio",
        description: "Usage externe uniquement. Sans paraben. Tenir hors de portée des enfants.",
        shortDescription: null,
        metaTitle: null,
        metaDescription: null,
        categorySlug: "naturel-et-bio",
      }),
    ).toEqual(expect.arrayContaining(["gel", "bio", "sans-paraben", "usage-externe"]));
  });

  it("retourne un tableau vide quand aucun signal exploitable n'est présent", () => {
    expect(
      inferFacetValueCodes({
        name: "Produit mystère",
        description: null,
        shortDescription: null,
        metaTitle: null,
        metaDescription: null,
        categorySlug: null,
      }),
    ).toEqual([]);
  });
});
