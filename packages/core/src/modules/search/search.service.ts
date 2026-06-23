import { normalizeSearchText } from "./query-normalizer";
import { rankSearchRows } from "./search-ranking.strategy";
import { searchRepository, type SearchSortKey } from "./search.repository";
import { toSearchTsquery, toSuggestTsquery } from "./search-sanitize";
import { interpretSearchIntent } from "./search-intent.interpreter";
import type {
  SearchFacet,
  SearchIntent,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SuggestItem,
} from "./search.types";

const DEFAULT_PAGE_SIZE = 24;
const MIN_QUERY_LENGTH = 2;

export type { SearchSortKey };

function computePriceTtc(priceExclTax: number, rateBps: number): number {
  return Math.round((priceExclTax * (10000 + rateBps)) / 10000);
}

const EMPTY_RESULT: Omit<SearchResult, "query"> = {
  items: [],
  facets: [],
  total: 0,
  totalPages: 1,
  page: 1,
  intent: null,
};

interface SearchExecutionParams {
  intent: SearchIntent;
  tsquery: string;
  filters: Record<string, string[]>;
  sort: SearchSortKey;
  pageSize: number;
  page: number;
}

function resolveSearchExecution(input: SearchQuery): SearchExecutionParams | null {
  const intent = interpretSearchIntent(input);
  if (intent.normalizedQuery.length < MIN_QUERY_LENGTH) {
    return null;
  }

  const tsquery = toSearchTsquery(intent.normalizedQuery);
  if (!tsquery) {
    return null;
  }

  const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
  const page = Math.max(1, Math.trunc(input.page ?? 1) || 1);

  return {
    intent,
    tsquery,
    filters: intent.filters,
    sort: input.sort ?? "relevance",
    pageSize,
    page,
  };
}

function mapSearchResultItems(
  rows: Awaited<ReturnType<typeof searchRepository.search>>["rows"],
): SearchResultItem[] {
  return rows.map((row) => {
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
}

function sortRowsByRelevance(
  rows: Awaited<ReturnType<typeof searchRepository.search>>["rows"],
  intent: SearchIntent,
  input: SearchQuery,
): Awaited<ReturnType<typeof searchRepository.search>>["rows"] {
  return rankSearchRows(rows, {
    intent,
    weights: input.searchConfig?.ranking,
  }).map((entry) => entry.row);
}

function mapSearchFacets(
  rawFacets: Awaited<ReturnType<typeof searchRepository.searchFacetCounts>>["facets"],
  counts: Awaited<ReturnType<typeof searchRepository.searchFacetCounts>>["counts"],
): SearchFacet[] {
  return rawFacets.map((facet) => {
    const facetCounts = counts.get(facet.id);
    return {
      code: facet.code,
      name: facet.name,
      values: facet.values.map((value) => ({
        code: value.code,
        label: value.label,
        count: facetCounts?.get(value.id) ?? 0,
      })),
    };
  });
}

export async function search(input: SearchQuery): Promise<SearchResult> {
  const execution = resolveSearchExecution(input);
  if (!execution) {
    return { ...EMPTY_RESULT, query: input.query };
  }

  const { rows, total } = await searchRepository.search(
    execution.tsquery,
    execution.intent.normalizedQuery,
    execution.filters,
    execution.sort,
    execution.pageSize,
    0, // fetch with offset 0 first to compute totalPages
    { allowFuzzy: false },
  );

  const shouldUseFuzzyFallback = total === 0 && execution.intent.normalizedQuery.length >= 4;
  const initialResult = shouldUseFuzzyFallback
    ? await searchRepository.search(
        execution.tsquery,
        execution.intent.normalizedQuery,
        execution.filters,
        execution.sort,
        execution.pageSize,
        0,
        { allowFuzzy: true },
      )
    : { rows, total };

  const totalPages = Math.max(1, Math.ceil(initialResult.total / execution.pageSize));
  const page = Math.min(execution.page, totalPages);
  const offset = (page - 1) * execution.pageSize;

  let finalRows = initialResult.rows;
  if (offset > 0) {
    const result = await searchRepository.search(
      execution.tsquery,
      execution.intent.normalizedQuery,
      execution.filters,
      execution.sort,
      execution.pageSize,
      offset,
      { allowFuzzy: shouldUseFuzzyFallback },
    );
    finalRows = result.rows;
  }

  if (execution.sort === "relevance") {
    finalRows = sortRowsByRelevance(finalRows, execution.intent, input);
  }

  const facetResult = await searchRepository.searchFacetCounts(
    execution.tsquery,
    execution.intent.normalizedQuery,
    execution.filters,
    { allowFuzzy: shouldUseFuzzyFallback },
  );

  return {
    items: mapSearchResultItems(finalRows),
    facets: mapSearchFacets(facetResult.facets, facetResult.counts),
    total: initialResult.total,
    totalPages,
    page,
    query: input.query,
    intent: execution.intent,
  };
}

export async function suggest(rawQuery: string, limit = 8): Promise<SuggestItem[]> {
  const normalizedQuery = normalizeSearchText(rawQuery);
  if (normalizedQuery.length < MIN_QUERY_LENGTH) return [];

  const tsquery = toSuggestTsquery(normalizedQuery);
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
