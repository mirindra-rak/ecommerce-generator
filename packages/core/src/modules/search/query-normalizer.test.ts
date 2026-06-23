import { describe, expect, it } from "vitest";
import {
  normalizeAndTokenizeSearchText,
  normalizeSearchText,
  tokenizeNormalizedSearchText,
} from "./query-normalizer";

describe("normalizeSearchText", () => {
  it("normalise les accents et la casse", () => {
    expect(normalizeSearchText("Crème AVÈNE Bébé")).toBe("creme avene bebe");
  });

  it("collapse les espaces et la ponctuation", () => {
    expect(normalizeSearchText("  gel,   douche !!! ")).toBe("gel douche");
  });

  it("sépare lettres et chiffres", () => {
    expect(normalizeSearchText("iphone15 spf50")).toBe("iphone 15 spf 50");
  });

  it("préserve les tirets utiles au SKU", () => {
    expect(normalizeSearchText("DOL-1000")).toBe("dol-1000");
  });
});

describe("tokenizeNormalizedSearchText", () => {
  it("retourne des tokens stables", () => {
    expect(tokenizeNormalizedSearchText("creme solaire spf 50")).toEqual([
      "creme",
      "solaire",
      "spf",
      "50",
    ]);
  });

  it("retourne un tableau vide pour une chaîne vide", () => {
    expect(tokenizeNormalizedSearchText("")).toEqual([]);
  });
});

describe("normalizeAndTokenizeSearchText", () => {
  it("chaîne la normalisation et la tokenization", () => {
    expect(normalizeAndTokenizeSearchText("Avène SPF50")).toEqual(["avene", "spf", "50"]);
  });
});
