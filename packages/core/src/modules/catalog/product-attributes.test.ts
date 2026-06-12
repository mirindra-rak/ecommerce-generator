import { describe, expect, it } from "vitest";
import { InvalidProductAttributesError } from "./catalog-errors";
import { getAttributeSchema, parseAttributes, validateAttributes } from "./product-attributes";

describe("getAttributeSchema", () => {
  it("type connu : valide la forme parapharmacie", () => {
    expect(() => getAttributeSchema("COSMETIC").parse({ inci: "Aqua" })).not.toThrow();
  });

  it("type inconnu : permissif (conserve les clés arbitraires)", () => {
    expect(getAttributeSchema("WELLNESS").parse({ foo: 1 })).toEqual({ foo: 1 });
  });
});

describe("validateAttributes", () => {
  it("accepte des attributs valides et retourne la valeur", () => {
    expect(validateAttributes("COSMETIC", { inci: "Aqua", precautions: "Externe" })).toEqual({
      inci: "Aqua",
      precautions: "Externe",
    });
  });

  it("rejette des attributs invalides", () => {
    expect(() => validateAttributes("COSMETIC", { inci: 123 })).toThrow(
      InvalidProductAttributesError,
    );
  });

  it("type inconnu : ne rejette pas (permissif)", () => {
    expect(validateAttributes("WELLNESS", { foo: "bar" })).toEqual({ foo: "bar" });
  });
});

describe("parseAttributes", () => {
  it("lecture typée des attributs parapharmacie", () => {
    const attrs = parseAttributes("COSMETIC", { inci: "Aqua", precautions: "Externe" });
    expect(attrs.inci).toBe("Aqua");
    expect(attrs.precautions).toBe("Externe");
  });

  it("contenu non conforme → objet vide (robustesse affichage)", () => {
    expect(parseAttributes("COSMETIC", { inci: 123 })).toEqual({});
  });
});
