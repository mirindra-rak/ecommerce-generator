import { describe, expect, it } from "vitest";
import { alternatesFor } from "./seo";

// La config du site fixe supportedLocales = ["fr", "en"], defaultLocale = "fr",
// localePrefix = "always" → toutes les URLs sont préfixées.
describe("alternatesFor", () => {
  it("émet une URL par locale supportée + x-default", () => {
    const { languages } = alternatesFor("/categorie/visage", "fr");
    expect(Object.keys(languages).sort()).toEqual(["en", "fr", "x-default"]);
    expect(languages.fr).toMatch(/^https?:\/\/.+\/fr\/categorie\/visage$/);
    expect(languages.en).toMatch(/^https?:\/\/.+\/en\/categorie\/visage$/);
  });

  it("rend une canonique auto-référente (locale courante)", () => {
    expect(alternatesFor("/produit/creme", "en").canonical).toContain("/en/produit/creme");
    expect(alternatesFor("/produit/creme", "fr").canonical).toContain("/fr/produit/creme");
  });

  it("fait pointer x-default vers la locale par défaut (fr, préfixée)", () => {
    expect(alternatesFor("/", "en").languages["x-default"]).toMatch(/\/fr$/);
  });

  it("expose des alternances réciproques (mêmes langues quelle que soit la locale courante)", () => {
    expect(alternatesFor("/", "fr").languages).toEqual(alternatesFor("/", "en").languages);
  });

  it("suffixe ?page=N (N≥2) sur la canonique et chaque hreflang", () => {
    const { canonical, languages } = alternatesFor("/categorie/visage", "fr", 2);
    expect(canonical).toMatch(/\/fr\/categorie\/visage\?page=2$/);
    expect(languages.en).toMatch(/\/en\/categorie\/visage\?page=2$/);
    expect(languages["x-default"]).toMatch(/\?page=2$/);
  });

  it("n'ajoute aucun suffixe pour la page 1 (défaut)", () => {
    expect(alternatesFor("/categorie/visage", "fr", 1).canonical).not.toContain("?page");
    expect(alternatesFor("/categorie/visage", "fr").canonical).not.toContain("?page");
  });
});
