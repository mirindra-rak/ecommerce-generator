import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("retire les accents, met en minuscules et remplace les espaces", () => {
    expect(slugify("Crème Hydratante 50ml")).toBe("creme-hydratante-50ml");
  });

  it("supprime les tirets de bord et collapse les séparateurs", () => {
    expect(slugify("  Soin !!  Bio ")).toBe("soin-bio");
  });
});
