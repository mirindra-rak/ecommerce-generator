import { describe, expect, it } from "vitest";
import { toSearchTsquery, toSuggestTsquery } from "./search-sanitize";

describe("toSearchTsquery", () => {
  it("retourne null pour une chaîne vide", () => {
    expect(toSearchTsquery("")).toBeNull();
    expect(toSearchTsquery("   ")).toBeNull();
  });

  it("transforme un mot simple", () => {
    expect(toSearchTsquery("doliprane")).toBe("doliprane");
  });

  it("joint les mots avec AND", () => {
    expect(toSearchTsquery("crème solaire")).toBe("crème & solaire");
  });

  it("strip les caractères spéciaux tsquery", () => {
    expect(toSearchTsquery("test & foo | bar")).toBe("test & foo & bar");
    expect(toSearchTsquery("!alert(")).toBe("alert");
    expect(toSearchTsquery("<script>")).toBe("script");
  });

  it("filtre les tokens vides après nettoyage", () => {
    expect(toSearchTsquery("& | !")).toBeNull();
    expect(toSearchTsquery("a  b")).toBe("a & b");
  });

  it("gère un EAN pur", () => {
    expect(toSearchTsquery("3401560123456")).toBe("3401560123456");
  });

  it("gère un SKU avec tirets", () => {
    expect(toSearchTsquery("ACM-SPF50-200")).toBe("ACM-SPF50-200");
  });

  it("retourne null pour un seul caractère", () => {
    expect(toSearchTsquery("a")).toBe("a");
  });
});

describe("toSuggestTsquery", () => {
  it("retourne null pour une chaîne vide", () => {
    expect(toSuggestTsquery("")).toBeNull();
  });

  it("ajoute :* au dernier token", () => {
    expect(toSuggestTsquery("doli")).toBe("doli:*");
  });

  it("ajoute :* au dernier token multi-mots", () => {
    expect(toSuggestTsquery("crème sol")).toBe("crème & sol:*");
  });

  it("strip les caractères spéciaux", () => {
    expect(toSuggestTsquery("test!")).toBe("test:*");
  });
});
