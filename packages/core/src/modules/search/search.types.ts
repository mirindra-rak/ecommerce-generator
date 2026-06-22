import type { SearchSortKey } from "./search.repository";
import type {
  SearchConfig,
  SearchDictionaryMatch,
  SearchEntityKind,
} from "./search-dictionary.types";

export type { SearchSortKey };

export interface SearchQuery {
  query: string;
  filters?: Record<string, string[]>;
  sort?: SearchSortKey;
  page?: number;
  pageSize?: number;
  searchConfig?: SearchConfig;
}

export interface SearchIntent {
  rawQuery: string;
  normalizedQuery: string;
  freeTextTerms: string[];
  filters: Record<string, string[]>;
  entities: Partial<Record<SearchEntityKind, string[]>>;
  dictionaryMatches: SearchDictionaryMatch[];
}

export interface SearchResultItem {
  slug: string;
  name: string;
  brandName: string | null;
  priceLabel: number | null;
  priceValue: number | null;
  from: boolean;
  imageKey: string | null;
}

export interface SearchFacetValue {
  code: string;
  label: string;
  count: number;
}

export interface SearchFacet {
  code: string;
  name: string;
  values: SearchFacetValue[];
}

export interface SearchResult {
  items: SearchResultItem[];
  facets: SearchFacet[];
  total: number;
  totalPages: number;
  page: number;
  query: string;
  intent: SearchIntent | null;
}

export interface SuggestItem {
  slug: string;
  name: string;
  brandName: string | null;
  priceLabel: number | null;
  imageKey: string | null;
}
