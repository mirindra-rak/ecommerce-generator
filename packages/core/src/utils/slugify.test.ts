import { describe, expect, it } from "vitest";
import { buildUniqueSlug, slugify } from "./slugify";

describe("slugify", () => {
  it("retire les accents, met en minuscules et remplace les espaces", () => {
    expect(slugify("Crème Hydratante 50ml")).toBe("creme-hydratante-50ml");
  });

  it("supprime les tirets de bord et collapse les séparateurs", () => {
    expect(slugify("  Soin !!  Bio ")).toBe("soin-bio");
  });
});

describe("buildUniqueSlug", () => {
  it("retourne le slug de base s'il est libre", async () => {
    const slug = await buildUniqueSlug("Visage & Soin", async () => false);
    expect(slug).toBe("visage-soin");
  });

  it("ajoute un suffixe en cas de collision", async () => {
    const taken = new Set(["cheveux", "cheveux-2"]);
    const slug = await buildUniqueSlug("Cheveux", async (s) => taken.has(s));
    expect(slug).toBe("cheveux-3");
  });
});
