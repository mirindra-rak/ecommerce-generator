import { normalizeSearchText, tokenizeNormalizedSearchText } from "./query-normalizer";
import { searchDictionaryRepository } from "./search-dictionary.repository";
import type { SearchQuery, SearchIntent } from "./search.types";
import type { SearchDictionaryMatch, SearchEntityKind } from "./search-dictionary.types";

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

function appendEntity(
  entities: Partial<Record<SearchEntityKind, string[]>>,
  kind: SearchEntityKind,
  code: string,
): void {
  const current = entities[kind] ?? [];
  entities[kind] = uniqueValues([...current, code]);
}

function extractEntities(
  matches: SearchDictionaryMatch[],
): Partial<Record<SearchEntityKind, string[]>> {
  const entities: Partial<Record<SearchEntityKind, string[]>> = {};

  for (const match of matches) {
    if (!match.entity) continue;
    appendEntity(entities, match.entity.kind, match.entity.code);
  }

  return entities;
}

export function interpretSearchIntent(input: SearchQuery): SearchIntent {
  const normalizedInput = normalizeSearchText(input.query);
  const normalizedQuery = searchDictionaryRepository.canonicalizeQuery(
    normalizedInput,
    input.searchConfig,
  );
  const dictionaryMatches = searchDictionaryRepository.findMatches(
    normalizedQuery,
    input.searchConfig,
  );

  return {
    rawQuery: input.query,
    normalizedQuery,
    freeTextTerms: tokenizeNormalizedSearchText(normalizedQuery),
    filters: input.filters ?? {},
    entities: extractEntities(dictionaryMatches),
    dictionaryMatches,
  };
}
