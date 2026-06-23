import { NextRequest, NextResponse } from "next/server";
import type { SearchSortKey } from "@pharmacie/core/modules/search";
import { searchStorefront } from "@/lib/search";

const ALLOWED_SORTS = new Set<SearchSortKey>([
  "relevance",
  "price-asc",
  "price-desc",
  "name",
  "new",
]);

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.trunc(parsed);
}

function parseSort(value: string | null): SearchSortKey {
  return ALLOWED_SORTS.has(value as SearchSortKey) ? (value as SearchSortKey) : "relevance";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const pageSize = parsePositiveInt(searchParams.get("pageSize"), 24);
  const sort = parseSort(searchParams.get("sort"));

  const result = await searchStorefront({ query, page, pageSize, sort });
  return NextResponse.json(result);
}
