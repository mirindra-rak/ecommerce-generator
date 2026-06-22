import { searchRepository, type SearchSortKey } from "./search.repository";
import { toSearchTsquery, toSuggestTsquery } from "./search-sanitize";

const DEFAULT_PAGE_SIZE = 24;
const MIN_QUERY_LENGTH = 2;

export type { SearchSortKey };

export interface SearchQuery {
  query: string;
  filters?: Record<string, string[]>;
  sort?: SearchSortKey;
  page?: number;
  pageSize?: number;
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
}

export interface SuggestItem {
  slug: string;
  name: string;
  brandName: string | null;
  priceLabel: number | null;
  imageKey: string | null;
}

function computePriceTtc(priceExclTax: number, rateBps: number): number {
  return Math.round((priceExclTax * (10000 + rateBps)) / 10000);
}

const EMPTY_RESULT: Omit<SearchResult, "query"> = {
  items: [],
  facets: [],
  total: 0,
  totalPages: 1,
  page: 1,
};

export async function search(input: SearchQuery): Promise<SearchResult> {
  if (input.query.trim().length < MIN_QUERY_LENGTH) {
    return { ...EMPTY_RESULT, query: input.query };
  }

  const tsquery = toSearchTsquery(input.query);
  if (!tsquery) {
    return { ...EMPTY_RESULT, query: input.query };
  }

  const filters = input.filters ?? {};
  const sort = input.sort ?? "relevance";
  const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
  const rawPage = input.page ?? 1;

  const { rows, total } = await searchRepository.search(
    tsquery,
    filters,
    sort,
    pageSize,
    0, // fetch with offset 0 first to compute totalPages
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.trunc(rawPage) || 1), totalPages);
  const offset = (page - 1) * pageSize;

  let finalRows = rows;
  if (offset > 0) {
    const result = await searchRepository.search(tsquery, filters, sort, pageSize, offset);
    finalRows = result.rows;
  }

  const { facets: rawFacets, counts } = await searchRepository.searchFacetCounts(tsquery, filters);

  const items: SearchResultItem[] = finalRows.map((row) => {
    const priceTtc =
      row.minPriceExclTax != null ? computePriceTtc(row.minPriceExclTax, row.taxRateBps) : null;
    return {
      slug: row.slug,
      name: row.name,
      brandName: row.brandName,
      priceLabel: priceTtc,
      priceValue: priceTtc,
      from: row.hasMultiplePrices,
      imageKey: row.imageKey,
    };
  });

  const facets: SearchFacet[] = rawFacets.map((facet) => {
    const facetCounts = counts.get(facet.id);
    return {
      code: facet.code,
      name: facet.name,
      values: facet.values.map((v) => ({
        code: v.code,
        label: v.label,
        count: facetCounts?.get(v.id) ?? 0,
      })),
    };
  });

  return { items, facets, total, totalPages, page, query: input.query };
}

export async function suggest(rawQuery: string, limit = 8): Promise<SuggestItem[]> {
  if (rawQuery.trim().length < MIN_QUERY_LENGTH) return [];

  const tsquery = toSuggestTsquery(rawQuery);
  if (!tsquery) return [];

  const rows = await searchRepository.suggest(tsquery, limit);
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    brandName: row.brandName,
    priceLabel:
      row.minPriceExclTax != null ? computePriceTtc(row.minPriceExclTax, row.taxRateBps) : null,
    imageKey: row.imageKey,
  }));
}
