export { searchRepository } from "./search.repository";
export type { SearchSortKey } from "./search.repository";

export { search, suggest } from "./search.service";
export type {
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchFacet,
  SearchFacetValue,
  SuggestItem,
} from "./search.service";
