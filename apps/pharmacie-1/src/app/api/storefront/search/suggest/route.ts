import { NextRequest, NextResponse } from "next/server";
import { suggestStorefront } from "@/lib/search";

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.trunc(parsed);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limit = parsePositiveInt(searchParams.get("limit"), 8);

  const items = await suggestStorefront(query, Math.min(limit, 8));
  return NextResponse.json({ query, items });
}
