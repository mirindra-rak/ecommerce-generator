import { normalizeSearchText } from "./query-normalizer";
import type {
  RankedSearchRow,
  SearchRankableRow,
  SearchRankingContext,
  SearchRankingSignals,
  SearchRankingWeights,
} from "./search-ranking.types";

const DEFAULT_SEARCH_RANKING_WEIGHTS: SearchRankingWeights = {
  textRank: 1,
  fuzzyRank: 0.35,
  exactNameMatch: 3,
  exactBrandMatch: 2,
  tokenCoverage: 1.5,
  dictionaryMatch: 0.75,
};

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export function resolveSearchRankingWeights(
  overrides?: SearchRankingContext["weights"],
): SearchRankingWeights {
  return {
    textRank: overrides?.textRank ?? DEFAULT_SEARCH_RANKING_WEIGHTS.textRank,
    fuzzyRank: overrides?.fuzzyRank ?? DEFAULT_SEARCH_RANKING_WEIGHTS.fuzzyRank,
    exactNameMatch: overrides?.exactNameMatch ?? DEFAULT_SEARCH_RANKING_WEIGHTS.exactNameMatch,
    exactBrandMatch: overrides?.exactBrandMatch ?? DEFAULT_SEARCH_RANKING_WEIGHTS.exactBrandMatch,
    tokenCoverage: overrides?.tokenCoverage ?? DEFAULT_SEARCH_RANKING_WEIGHTS.tokenCoverage,
    dictionaryMatch: overrides?.dictionaryMatch ?? DEFAULT_SEARCH_RANKING_WEIGHTS.dictionaryMatch,
  };
}

export function computeSearchRankingSignals<T extends SearchRankableRow>(
  row: T,
  context: SearchRankingContext,
): SearchRankingSignals {
  const normalizedName = normalizeSearchText(row.name);
  const normalizedBrandName = normalizeSearchText(row.brandName ?? "");
  const normalizedHaystack = `${normalizedName} ${normalizedBrandName}`.trim();

  const exactNameMatch = normalizedName === context.intent.normalizedQuery ? 1 : 0;
  const exactBrandMatch = normalizedBrandName === context.intent.normalizedQuery ? 1 : 0;

  const tokenCoverage =
    context.intent.freeTextTerms.length === 0
      ? 0
      : clamp01(
          context.intent.freeTextTerms.filter((term) => normalizedHaystack.includes(term)).length /
            context.intent.freeTextTerms.length,
        );

  const dictionaryMatches =
    context.intent.dictionaryMatches.length === 0
      ? 0
      : clamp01(
          context.intent.dictionaryMatches.filter((match) =>
            normalizedHaystack.includes(match.canonicalTerm),
          ).length / context.intent.dictionaryMatches.length,
        );

  return {
    textRank: row.rank,
    fuzzyRank: row.fuzzyRank,
    exactNameMatch,
    exactBrandMatch,
    tokenCoverage,
    dictionaryMatch: dictionaryMatches,
  };
}

export function computeSearchRankingScore(
  signals: SearchRankingSignals,
  weights: SearchRankingWeights,
): number {
  return (
    signals.textRank * weights.textRank +
    signals.fuzzyRank * weights.fuzzyRank +
    signals.exactNameMatch * weights.exactNameMatch +
    signals.exactBrandMatch * weights.exactBrandMatch +
    signals.tokenCoverage * weights.tokenCoverage +
    signals.dictionaryMatch * weights.dictionaryMatch
  );
}

export function rankSearchRows<T extends SearchRankableRow>(
  rows: T[],
  context: SearchRankingContext,
): RankedSearchRow<T>[] {
  const weights = resolveSearchRankingWeights(context.weights);

  return rows
    .map((row) => {
      const signals = computeSearchRankingSignals(row, context);
      return {
        row,
        signals,
        score: computeSearchRankingScore(signals, weights),
      };
    })
    .sort((left, right) => right.score - left.score);
}
