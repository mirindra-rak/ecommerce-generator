import { describe, expect, it } from "vitest";
import { InvalidCategoryFieldError } from "./catalog-errors";
import { safeTextField, validateCategoryFields } from "./category-fields";

describe("safeTextField", () => {
  it("accepte un texte normal (y compris &)", () => {
    expect(safeTextField.safeParse("Visage & Soin").success).toBe(true);
  });

  it("rejette chaque caractère interdit", () => {
    for (const ch of ["<", ">", ";", "=", "#", "{", "}"]) {
      expect(safeTextField.safeParse(`x${ch}y`).success).toBe(false);
    }
  });
});

describe("validateCategoryFields", () => {
  it("accepte des champs valides", () => {
    expect(() =>
      validateCategoryFields({
        name: "Soins",
        metaTitle: "Soins bio",
        metaKeywords: ["bio", "naturel"],
      }),
    ).not.toThrow();
  });

  it("rejette un caractère interdit dans le nom", () => {
    expect(() => validateCategoryFields({ name: "Soins <b>" })).toThrow(InvalidCategoryFieldError);
  });

  it("rejette un mot-clé interdit", () => {
    expect(() => validateCategoryFields({ name: "Ok", metaKeywords: ["bon", "#promo"] })).toThrow(
      InvalidCategoryFieldError,
    );
  });
});
