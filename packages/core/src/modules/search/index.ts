export { searchRepository } from "./search.repository";
export type { SearchSortKey } from "./search.repository";

export { search, suggest } from "./search.service";
export { interpretSearchIntent } from "./search-intent.interpreter";
export {
  computeSearchRankingScore,
  computeSearchRankingSignals,
  rankSearchRows,
  resolveSearchRankingWeights,
} from "./search-ranking.strategy";
export {
  normalizeAndTokenizeSearchText,
  normalizeSearchText,
  tokenizeNormalizedSearchText,
} from "./query-normalizer";
export { searchDictionaryRepository } from "./search-dictionary.repository";
export type {
  SearchIntent,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchFacet,
  SearchFacetValue,
  SuggestItem,
} from "./search.types";
export type {
  SearchConfig,
  SearchDictionaryConfig,
  SearchDictionaryEntityConfig,
  SearchDictionaryEntryConfig,
  SearchDictionaryMatch,
  SearchEntityKind,
} from "./search-dictionary.types";
export type {
  SearchRankingWeights,
  SearchRankingWeightsConfig,
  SearchRankingSignals,
  SearchRankableRow,
  RankedSearchRow,
} from "./search-ranking.types";
