import { Prisma } from "@prisma/client";
import { prisma } from "../../db/client";

export type SearchSortKey = "relevance" | "price-asc" | "price-desc" | "name" | "new";

export interface SearchRawRow {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  minPriceExclTax: number;
  taxRateBps: number;
  imageKey: string | null;
  hasMultiplePrices: boolean;
}

export interface SearchCountRow {
  total: bigint;
}

export interface SuggestRawRow {
  slug: string;
  name: string;
  brandName: string | null;
  minPriceExclTax: number;
  taxRateBps: number;
  imageKey: string | null;
}

export interface FacetCountRow {
  facetValueId: string;
  cnt: bigint;
}

function buildOrderBy(sort: SearchSortKey): Prisma.Sql {
  switch (sort) {
    case "relevance":
      return Prisma.sql`rank DESC`;
    case "price-asc":
      return Prisma.sql`min_price_ttc ASC NULLS LAST`;
    case "price-desc":
      return Prisma.sql`min_price_ttc DESC NULLS LAST`;
    case "name":
      return Prisma.sql`p."name" ASC`;
    case "new":
      return Prisma.sql`p."createdAt" DESC`;
  }
}

function buildFacetWhereClauses(filters: Record<string, string[]>): Prisma.Sql[] {
  return Object.entries(filters)
    .filter(([, codes]) => codes.length > 0)
    .map(
      ([facetCode, codes]) =>
        Prisma.sql`EXISTS (
        SELECT 1 FROM "ProductFacetValue" pfv
        JOIN "FacetValue" fv ON fv."id" = pfv."facetValueId"
        JOIN "Facet" f ON f."id" = fv."facetId"
        WHERE pfv."productId" = p."id"
          AND f."code" = ${facetCode}
          AND fv."code" IN (${Prisma.join(codes)})
      )`,
    );
}

export const searchRepository = {
  refreshSearchVector(productId: string): Promise<void> {
    return prisma.$executeRaw`
      SELECT refresh_product_search_vector(${productId}::text)
    `.then(() => undefined);
  },

  refreshAll(): Promise<void> {
    return prisma.$executeRaw`
      DO $$
      DECLARE r RECORD;
      BEGIN
        FOR r IN SELECT "id" FROM "Product" LOOP
          PERFORM refresh_product_search_vector(r."id");
        END LOOP;
      END;
      $$
    `.then(() => undefined);
  },

  async search(
    tsquery: string,
    filters: Record<string, string[]>,
    sort: SearchSortKey,
    limit: number,
    offset: number,
  ): Promise<{ rows: SearchRawRow[]; total: number }> {
    const facetClauses = buildFacetWhereClauses(filters);
    const allWhere = [
      Prisma.sql`p."active" = true`,
      Prisma.sql`p."search_vector" @@ (to_tsquery('french', ${tsquery}) || to_tsquery('simple', ${tsquery}))`,
      ...facetClauses,
    ];
    const whereClause = Prisma.sql`WHERE ${Prisma.join(allWhere, " AND ")}`;
    const orderBy = buildOrderBy(sort);

    const rows = await prisma.$queryRaw<SearchRawRow[]>`
      SELECT
        p."id",
        p."slug",
        p."name",
        b."name" AS "brandName",
        v."minPriceExclTax",
        tr."rateBps" AS "taxRateBps",
        m."storageKey" AS "imageKey",
        (v."priceCount" > 1) AS "hasMultiplePrices",
        ts_rank(p."search_vector", to_tsquery('french', ${tsquery}) || to_tsquery('simple', ${tsquery})) AS rank,
        (v."minPriceExclTax" * (10000 + tr."rateBps") / 10000) AS min_price_ttc
      FROM "Product" p
      LEFT JOIN "Brand" b ON b."id" = p."brandId"
      JOIN "TaxRate" tr ON tr."id" = p."taxRateId"
      LEFT JOIN LATERAL (
        SELECT
          MIN(pv."priceExclTax") AS "minPriceExclTax",
          COUNT(DISTINCT pv."priceExclTax") AS "priceCount"
        FROM "ProductVariant" pv WHERE pv."productId" = p."id"
      ) v ON true
      LEFT JOIN LATERAL (
        SELECT pm."storageKey"
        FROM "ProductMedia" pm WHERE pm."productId" = p."id"
        ORDER BY pm."position" ASC LIMIT 1
      ) m ON true
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw<SearchCountRow[]>`
      SELECT COUNT(*) AS "total"
      FROM "Product" p
      ${whereClause}
    `;
    const total = Number(countResult[0]?.total ?? 0);

    return { rows, total };
  },

  async suggest(tsquery: string, limit: number): Promise<SuggestRawRow[]> {
    return prisma.$queryRaw<SuggestRawRow[]>`
      SELECT
        p."slug",
        p."name",
        b."name" AS "brandName",
        v."minPriceExclTax",
        tr."rateBps" AS "taxRateBps",
        m."storageKey" AS "imageKey"
      FROM "Product" p
      LEFT JOIN "Brand" b ON b."id" = p."brandId"
      JOIN "TaxRate" tr ON tr."id" = p."taxRateId"
      LEFT JOIN LATERAL (
        SELECT MIN(pv."priceExclTax") AS "minPriceExclTax"
        FROM "ProductVariant" pv WHERE pv."productId" = p."id"
      ) v ON true
      LEFT JOIN LATERAL (
        SELECT pm."storageKey"
        FROM "ProductMedia" pm WHERE pm."productId" = p."id"
        ORDER BY pm."position" ASC LIMIT 1
      ) m ON true
      WHERE p."active" = true
        AND p."search_vector" @@ (to_tsquery('french', ${tsquery}) || to_tsquery('simple', ${tsquery}))
      ORDER BY ts_rank(p."search_vector", to_tsquery('french', ${tsquery}) || to_tsquery('simple', ${tsquery})) DESC
      LIMIT ${limit}
    `;
  },

  async searchFacetCounts(
    tsquery: string,
    filters: Record<string, string[]>,
  ): Promise<{
    facets: Array<{
      id: string;
      code: string;
      name: string;
      values: Array<{ id: string; code: string; label: string }>;
    }>;
    counts: Map<string, Map<string, number>>;
  }> {
    const matchingBase = Prisma.sql`
      p."active" = true
      AND p."search_vector" @@ (to_tsquery('french', ${tsquery}) || to_tsquery('simple', ${tsquery}))
    `;

    const presentFacets = await prisma.$queryRaw<
      Array<{
        facetId: string;
        facetCode: string;
        facetName: string;
        valueId: string;
        valueCode: string;
        valueLabel: string;
      }>
    >`
      SELECT DISTINCT
        f."id" AS "facetId", f."code" AS "facetCode", f."name" AS "facetName",
        fv."id" AS "valueId", fv."code" AS "valueCode", fv."label" AS "valueLabel"
      FROM "ProductFacetValue" pfv
      JOIN "FacetValue" fv ON fv."id" = pfv."facetValueId"
      JOIN "Facet" f ON f."id" = fv."facetId"
      JOIN "Product" p ON p."id" = pfv."productId"
      WHERE ${matchingBase}
      ORDER BY f."code", fv."code"
    `;

    const facetMap = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        values: Array<{ id: string; code: string; label: string }>;
      }
    >();
    for (const row of presentFacets) {
      let facet = facetMap.get(row.facetId);
      if (!facet) {
        facet = { id: row.facetId, code: row.facetCode, name: row.facetName, values: [] };
        facetMap.set(row.facetId, facet);
      }
      facet.values.push({ id: row.valueId, code: row.valueCode, label: row.valueLabel });
    }
    const facets = [...facetMap.values()];

    const counts = new Map<string, Map<string, number>>();
    for (const facet of facets) {
      const otherClauses = Object.entries(filters)
        .filter(([code, codes]) => code !== facet.code && codes.length > 0)
        .map(
          ([facetCode, codes]) =>
            Prisma.sql`EXISTS (
              SELECT 1 FROM "ProductFacetValue" pfv2
              JOIN "FacetValue" fv2 ON fv2."id" = pfv2."facetValueId"
              JOIN "Facet" f2 ON f2."id" = fv2."facetId"
              WHERE pfv2."productId" = p."id"
                AND f2."code" = ${facetCode}
                AND fv2."code" IN (${Prisma.join(codes)})
            )`,
        );

      const allWhere = [matchingBase, ...otherClauses];
      const whereClause = Prisma.join(allWhere, " AND ");

      const grouped = await prisma.$queryRaw<FacetCountRow[]>`
        SELECT pfv."facetValueId", COUNT(*) AS cnt
        FROM "ProductFacetValue" pfv
        JOIN "Product" p ON p."id" = pfv."productId"
        JOIN "FacetValue" fv ON fv."id" = pfv."facetValueId"
        WHERE fv."facetId" = ${facet.id}
          AND ${whereClause}
        GROUP BY pfv."facetValueId"
      `;

      const facetCounts = new Map<string, number>();
      for (const row of grouped) {
        facetCounts.set(row.facetValueId, Number(row.cnt));
      }
      counts.set(facet.id, facetCounts);
    }

    return { facets, counts };
  },
};
