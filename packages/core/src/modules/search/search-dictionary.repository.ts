import { normalizeSearchText } from "./query-normalizer";
import type {
  SearchConfig,
  SearchDictionaryConfig,
  SearchDictionaryEntryConfig,
  SearchDictionaryMatch,
} from "./search-dictionary.types";

interface NormalizedDictionaryEntry {
  canonicalTerm: string;
  aliases: string[];
  entity?: SearchDictionaryEntryConfig["entity"];
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeDictionaryEntry(entry: SearchDictionaryEntryConfig): NormalizedDictionaryEntry {
  const canonicalTerm = normalizeSearchText(entry.canonicalTerm);
  const aliases = [
    ...new Set(entry.aliases.map((alias) => normalizeSearchText(alias)).filter(Boolean)),
  ];

  return {
    canonicalTerm,
    aliases,
    entity: entry.entity,
  };
}

function getDictionaryEntries(config?: SearchConfig): NormalizedDictionaryEntry[] {
  return (config?.dictionary.entries ?? [])
    .map(normalizeDictionaryEntry)
    .filter((entry) => entry.canonicalTerm.length > 0);
}

export const searchDictionaryRepository = {
  getEntries(config?: SearchConfig): SearchDictionaryMatch[] {
    return getDictionaryEntries(config);
  },

  canonicalizeQuery(normalizedQuery: string, config?: SearchConfig): string {
    let result = normalizedQuery;
    const entries = getDictionaryEntries(config);

    const aliases = entries
      .flatMap((entry) =>
        entry.aliases.map((alias) => ({
          alias,
          canonicalTerm: entry.canonicalTerm,
        })),
      )
      .sort((left, right) => right.alias.length - left.alias.length);

    for (const { alias, canonicalTerm } of aliases) {
      if (alias.length === 0 || alias === canonicalTerm) continue;
      const pattern = new RegExp(`(^| )${escapeRegExp(alias)}(?= |$)`, "g");
      result = result.replace(pattern, (_match, prefix: string) => `${prefix}${canonicalTerm}`);
    }

    return result.replace(/\s+/g, " ").trim();
  },

  findMatches(normalizedQuery: string, config?: SearchConfig): SearchDictionaryMatch[] {
    const entries = getDictionaryEntries(config);
    return entries.filter((entry) => {
      if (normalizedQuery.includes(entry.canonicalTerm)) {
        return true;
      }

      return entry.aliases.some((alias) => {
        const pattern = new RegExp(`(^| )${escapeRegExp(alias)}(?= |$)`);
        return pattern.test(normalizedQuery);
      });
    });
  },
};
