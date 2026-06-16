import { describe, expect, it } from "vitest";
import { resolveLocale } from "./locale";

// supportedLocales = ["fr", "en"], defaultLocale = "fr".
describe("resolveLocale", () => {
  it("priorise le segment d'URL (storefront)", () => {
    expect(resolveLocale("en", "fr")).toBe("en");
  });

  it("retombe sur le cookie quand il n'y a pas de segment (admin)", () => {
    expect(resolveLocale(undefined, "en")).toBe("en");
    expect(resolveLocale(null, "en")).toBe("en");
  });

  it("ignore les valeurs hors whitelist et applique le défaut", () => {
    expect(resolveLocale(undefined, "de")).toBe("fr");
    expect(resolveLocale("es", undefined)).toBe("fr");
    expect(resolveLocale(undefined, undefined)).toBe("fr");
  });
});
