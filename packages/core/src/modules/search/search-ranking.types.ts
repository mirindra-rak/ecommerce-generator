import type { SearchRankingWeightsConfig } from "../../config/site-config";
import type { SearchIntent } from "./search.types";

export interface SearchRankingWeights {
  textRank: number;
  fuzzyRank: number;
  exactNameMatch: number;
  exactBrandMatch: number;
  tokenCoverage: number;
  dictionaryMatch: number;
}

export interface SearchRankingSignals {
  textRank: number;
  fuzzyRank: number;
  exactNameMatch: number;
  exactBrandMatch: number;
  tokenCoverage: number;
  dictionaryMatch: number;
}

export interface SearchRankingContext {
  intent: SearchIntent;
  weights?: SearchRankingWeightsConfig;
}

export interface SearchRankableRow {
  name: string;
  brandName: string | null;
  rank: number;
  fuzzyRank: number;
}

export interface RankedSearchRow<T extends SearchRankableRow> {
  row: T;
  score: number;
  signals: SearchRankingSignals;
}

export type { SearchRankingWeightsConfig };
