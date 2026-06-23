import { search, suggest, type SearchSortKey } from "@pharmacie/core/modules/search";
import { formatPrice } from "./catalog";
import { siteConfig } from "./site";

export interface StorefrontSearchItemVM {
  slug: string;
  name: string;
  brandName: string | null;
  priceLabel: string | null;
  priceValue: number | null;
  from: boolean;
}

export interface StorefrontSearchResultVM {
  query: string;
  total: number;
  page: number;
  totalPages: number;
  items: StorefrontSearchItemVM[];
}

export interface StorefrontSuggestItemVM {
  slug: string;
  name: string;
  brandName: string | null;
  priceLabel: string | null;
}

function toSearchItemVM(
  item: Awaited<ReturnType<typeof search>>["items"][number],
): StorefrontSearchItemVM {
  return {
    slug: item.slug,
    name: item.name,
    brandName: item.brandName,
    priceLabel: item.priceValue != null ? formatPrice(item.priceValue) : null,
    priceValue: item.priceValue,
    from: item.from,
  };
}

export async function searchStorefront(params: {
  query: string;
  page?: number;
  pageSize?: number;
  sort?: SearchSortKey;
}): Promise<StorefrontSearchResultVM> {
  const result = await search({
    query: params.query,
    page: params.page,
    pageSize: params.pageSize,
    sort: params.sort,
    searchConfig: siteConfig.search,
  });

  return {
    query: result.query,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    items: result.items.map(toSearchItemVM),
  };
}

export async function suggestStorefront(
  query: string,
  limit = 8,
): Promise<StorefrontSuggestItemVM[]> {
  const items = await suggest(query, limit);
  return items.map((item) => ({
    slug: item.slug,
    name: item.name,
    brandName: item.brandName,
    priceLabel: item.priceLabel != null ? formatPrice(item.priceLabel) : null,
  }));
}
