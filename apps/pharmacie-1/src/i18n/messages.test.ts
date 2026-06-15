import { describe, expect, it } from "vitest";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";

// Aplatit un objet de messages en chemins de clés ("header.account", …) pour comparer
// les jeux de clés entre locales, indépendamment de l'ordre.
function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === "object"
      ? flattenKeys(value as Record<string, unknown>, path)
      : [path];
  });
}

describe("catalogues de messages i18n", () => {
  it("FR et EN exposent exactement les mêmes clés", () => {
    const frKeys = flattenKeys(fr).sort();
    const enKeys = flattenKeys(en).sort();
    expect(enKeys).toEqual(frKeys);
  });
});
