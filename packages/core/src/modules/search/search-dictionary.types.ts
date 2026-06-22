import type {
  SearchConfig,
  SearchDictionaryConfig,
  SearchDictionaryEntityConfig,
  SearchDictionaryEntryConfig,
  SearchEntityKind,
} from "../../config/site-config";

export type {
  SearchConfig,
  SearchDictionaryConfig,
  SearchDictionaryEntityConfig,
  SearchDictionaryEntryConfig,
  SearchEntityKind,
};

export interface SearchDictionaryMatch {
  canonicalTerm: string;
  aliases: string[];
  entity?: SearchDictionaryEntityConfig;
}
