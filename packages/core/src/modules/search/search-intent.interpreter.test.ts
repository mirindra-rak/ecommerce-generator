import { describe, expect, it } from "vitest";
import { interpretSearchIntent } from "./search-intent.interpreter";
import type { SearchConfig } from "./search-dictionary.types";

const searchConfig: SearchConfig = {
  dictionary: {
    entries: [
      {
        canonicalTerm: "avene",
        aliases: ["avene", "avène"],
        entity: { kind: "brand", code: "avene" },
      },
      {
        canonicalTerm: "solaire",
        aliases: ["spf", "ecran solaire"],
        entity: { kind: "category", code: "solaire" },
      },
      {
        canonicalTerm: "spray",
        aliases: ["brume"],
        entity: { kind: "attributeValue", code: "spray" },
      },
    ],
  },
};

describe("interpretSearchIntent", () => {
  it("normalise la requête et conserve le texte libre", () => {
    const intent = interpretSearchIntent({ query: "  Avène SPF50 " });
    expect(intent.normalizedQuery).toBe("avene spf 50");
    expect(intent.freeTextTerms).toEqual(["avene", "spf", "50"]);
    expect(intent.entities).toEqual({});
  });

  it("canonicalise la requête et détecte les entités configurées", () => {
    const intent = interpretSearchIntent({
      query: "Avène écran solaire spray",
      searchConfig,
    });

    expect(intent.normalizedQuery).toBe("avene solaire spray");
    expect(intent.dictionaryMatches.map((match) => match.canonicalTerm)).toEqual([
      "avene",
      "solaire",
      "spray",
    ]);
    expect(intent.entities).toEqual({
      brand: ["avene"],
      category: ["solaire"],
      attributeValue: ["spray"],
    });
  });

  it("déduplique les entités répétées", () => {
    const intent = interpretSearchIntent({
      query: "spf ecran solaire",
      searchConfig,
    });

    expect(intent.entities.category).toEqual(["solaire"]);
  });
});
