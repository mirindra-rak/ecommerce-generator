import { describe, expect, it } from "vitest";
import {
  computeSearchRankingScore,
  computeSearchRankingSignals,
  rankSearchRows,
  resolveSearchRankingWeights,
} from "./search-ranking.strategy";
import type { SearchIntent } from "./search.types";

const baseIntent: SearchIntent = {
  rawQuery: "Avène solaire",
  normalizedQuery: "avene solaire",
  freeTextTerms: ["avene", "solaire"],
  filters: {},
  entities: { brand: ["avene"], category: ["solaire"] },
  dictionaryMatches: [
    {
      canonicalTerm: "avene",
      aliases: ["avene", "avène"],
      entity: { kind: "brand", code: "avene" },
    },
    { canonicalTerm: "solaire", aliases: ["spf"], entity: { kind: "category", code: "solaire" } },
  ],
};

describe("resolveSearchRankingWeights", () => {
  it("fusionne les overrides avec les defaults", () => {
    expect(resolveSearchRankingWeights({ fuzzyRank: 0.5, exactNameMatch: 10 })).toMatchObject({
      textRank: 1,
      fuzzyRank: 0.5,
      exactNameMatch: 10,
    });
  });
});

describe("computeSearchRankingSignals", () => {
  it("calcule les signaux textuels et dictionnaire", () => {
    const signals = computeSearchRankingSignals(
      {
        name: "Crème solaire Avène",
        brandName: "Avène",
        rank: 0.42,
        fuzzyRank: 0.18,
      },
      { intent: baseIntent },
    );

    expect(signals.textRank).toBe(0.42);
    expect(signals.fuzzyRank).toBe(0.18);
    expect(signals.exactNameMatch).toBe(0);
    expect(signals.exactBrandMatch).toBe(0);
    expect(signals.tokenCoverage).toBe(1);
    expect(signals.dictionaryMatch).toBe(1);
  });
});

describe("computeSearchRankingScore", () => {
  it("compose un score déterministe", () => {
    const score = computeSearchRankingScore(
      {
        textRank: 0.5,
        fuzzyRank: 0.2,
        exactNameMatch: 1,
        exactBrandMatch: 0,
        tokenCoverage: 1,
        dictionaryMatch: 0.5,
      },
      resolveSearchRankingWeights(),
    );

    expect(score).toBeGreaterThan(4);
  });
});

describe("rankSearchRows", () => {
  it("priorise le match exact sur un match plus flou", () => {
    const ranked = rankSearchRows(
      [
        {
          name: "Avène solaire",
          brandName: "Avène",
          rank: 0.4,
          fuzzyRank: 0.2,
        },
        {
          name: "Crème solaire Avène SPF 50",
          brandName: "Avène",
          rank: 0.5,
          fuzzyRank: 0.25,
        },
      ],
      { intent: baseIntent },
    );

    expect(ranked[0]?.row.name).toBe("Avène solaire");
  });

  it("permet de changer la priorité via la configuration", () => {
    const ranked = rankSearchRows(
      [
        {
          name: "Avène solaire",
          brandName: "Avène",
          rank: 0.4,
          fuzzyRank: 0.2,
        },
        {
          name: "Crème solaire Avène SPF 50",
          brandName: "Avène",
          rank: 0.9,
          fuzzyRank: 0.25,
        },
      ],
      {
        intent: baseIntent,
        weights: {
          textRank: 10,
          exactNameMatch: 0,
          exactBrandMatch: 0,
          tokenCoverage: 0,
          dictionaryMatch: 0,
          fuzzyRank: 0,
        },
      },
    );

    expect(ranked[0]?.row.name).toBe("Crème solaire Avène SPF 50");
  });
});
