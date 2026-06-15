import { describe, expect, it } from "vitest";
import { localeLabel } from "./locale-label";

describe("localeLabel", () => {
  it("rend l'autonyme capitalisé des locales supportées", () => {
    expect(localeLabel("fr")).toBe("Français");
    expect(localeLabel("en")).toBe("English");
  });

  it("retombe sur le code brut pour une locale inconnue", () => {
    expect(localeLabel("zz")).toBe("zz");
  });
});
