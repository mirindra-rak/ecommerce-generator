"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input, cx } from "@pharmacie/ui";
import { Link, useRouter } from "@/i18n/navigation";
import { SearchIcon } from "./icons";

interface SearchSuggestionItem {
  slug: string;
  name: string;
  brandName: string | null;
  priceLabel: string | null;
}

interface SearchBoxProps {
  placeholder: string;
}

export function SearchBox({ placeholder }: SearchBoxProps) {
  const t = useTranslations("searchBox");
  const locale = useLocale();
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchSuggestionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pending, startTransition] = useTransition();

  const trimmedQuery = query.trim();
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setItems([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/storefront/search/suggest?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { items: SearchSuggestionItem[] };
        setItems(payload.items);
        setOpen(payload.items.length > 0);
        setActiveIndex(-1);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setItems([]);
          setOpen(false);
          setActiveIndex(-1);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const searchResultsHref = useMemo(
    () => `/recherche?q=${encodeURIComponent(trimmedQuery)}`,
    [trimmedQuery],
  );

  function submitSearch(nextQuery = trimmedQuery) {
    const cleanedQuery = nextQuery.trim();
    if (cleanedQuery.length === 0) return;

    startTransition(() => {
      router.push(`/recherche?q=${encodeURIComponent(cleanedQuery)}`, { locale });
    });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative ml-2 hidden flex-1 md:block">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(activeItem?.name ?? trimmedQuery);
        }}
      >
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => {
              if (items.length > 0) setOpen(true);
            }}
            onKeyDown={(event) => {
              if (!open && event.key === "ArrowDown" && items.length > 0) {
                event.preventDefault();
                setOpen(true);
                setActiveIndex(0);
                return;
              }

              if (event.key === "ArrowDown" && items.length > 0) {
                event.preventDefault();
                setActiveIndex((current) => (current + 1) % items.length);
                return;
              }

              if (event.key === "ArrowUp" && items.length > 0) {
                event.preventDefault();
                setActiveIndex((current) => (current <= 0 ? items.length - 1 : current - 1));
                return;
              }

              if (event.key === "Escape") {
                setOpen(false);
                setActiveIndex(-1);
              }
            }}
            placeholder={placeholder}
            aria-label={placeholder}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeItem ? `${listboxId}-${activeIndex}` : undefined}
            className="rounded-sm border-line bg-surface py-3 pl-11 pr-28 text-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-sm bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            disabled={pending || trimmedQuery.length === 0}
          >
            {t("submit")}
          </button>
        </div>
      </form>

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-sm border border-line bg-paper shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
          <ul id={listboxId} role="listbox" className="max-h-96 overflow-y-auto py-2">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={item.slug}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={isActive}
                >
                  <Link
                    href={`/produit/${item.slug}`}
                    className={cx(
                      "flex items-center justify-between gap-4 px-4 py-3 transition-colors",
                      isActive ? "bg-brand-50" : "hover:bg-slate-50",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      setOpen(false);
                      setQuery(item.name);
                    }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      <p className="truncate text-xs text-muted">
                        {item.brandName ?? t("productFallback")}
                      </p>
                    </div>
                    {item.priceLabel && (
                      <span className="shrink-0 text-sm font-semibold text-foreground">
                        {item.priceLabel}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-line px-4 py-3 text-sm">
            <Link
              href={searchResultsHref}
              onClick={() => setOpen(false)}
              className="font-medium text-brand-700 hover:text-brand-800"
            >
              {t("seeAllResults", { query: trimmedQuery })}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
