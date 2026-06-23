import { describe, expect, it } from "vitest";
import { searchDictionaryRepository } from "./search-dictionary.repository";
import type { SearchConfig } from "./search-dictionary.types";

const searchConfig: SearchConfig = {
  dictionary: {
    entries: [
      {
        canonicalTerm: "solaire",
        aliases: ["spf", "ecran solaire"],
        entity: { kind: "query", code: "solar-care" },
      },
      {
        canonicalTerm: "ordinateur portable",
        aliases: ["laptop", "pc portable"],
      },
    ],
  },
};

describe("searchDictionaryRepository", () => {
  it("canonicalise les alias simples", () => {
    expect(searchDictionaryRepository.canonicalizeQuery("spf 50", searchConfig)).toBe("solaire 50");
  });

  it("canonicalise les expressions les plus longues en priorité", () => {
    expect(searchDictionaryRepository.canonicalizeQuery("ecran solaire enfant", searchConfig)).toBe(
      "solaire enfant",
    );
  });

  it("détecte les entrées matchées", () => {
    const matches = searchDictionaryRepository.findMatches("laptop solaire", searchConfig);
    expect(matches).toHaveLength(2);
    expect(matches.map((match) => match.canonicalTerm)).toEqual(["solaire", "ordinateur portable"]);
  });

  it("retourne les entrées normalisées", () => {
    expect(searchDictionaryRepository.getEntries(searchConfig)).toEqual([
      {
        canonicalTerm: "solaire",
        aliases: ["spf", "ecran solaire"],
        entity: { kind: "query", code: "solar-care" },
      },
      {
        canonicalTerm: "ordinateur portable",
        aliases: ["laptop", "pc portable"],
        entity: undefined,
      },
    ]);
  });
});
