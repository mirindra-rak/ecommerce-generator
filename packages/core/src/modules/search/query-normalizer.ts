const COMBINING_MARKS = /[\u0300-\u036f]/g;
const NON_SEARCH_CHARS = /[^a-z0-9-]+/g;

export function normalizeSearchText(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(NON_SEARCH_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeNormalizedSearchText(input: string): string[] {
  if (input.length === 0) return [];
  return input.split(" ");
}

export function normalizeAndTokenizeSearchText(input: string): string[] {
  return tokenizeNormalizedSearchText(normalizeSearchText(input));
}
