const TSQUERY_SPECIAL = /[&|!():*<>'\\]/g;

function sanitizeTokens(input: string): string[] {
  return input
    .replace(TSQUERY_SPECIAL, " ")
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

export function toSearchTsquery(input: string): string | null {
  const tokens = sanitizeTokens(input);
  if (tokens.length === 0) return null;
  return tokens.join(" & ");
}

export function toSuggestTsquery(input: string): string | null {
  const tokens = sanitizeTokens(input);
  if (tokens.length === 0) return null;
  const last = tokens.pop()!;
  tokens.push(`${last}:*`);
  return tokens.join(" & ");
}
