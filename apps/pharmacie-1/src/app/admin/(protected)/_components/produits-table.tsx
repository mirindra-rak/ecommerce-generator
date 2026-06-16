"use client";

import { deleteProductAction } from "@/app/admin/(protected)/produits/_actions";
import { Input, SearchIcon, Select, cx } from "@pharmacie/ui";
import { PencilIcon, TrashIcon } from "@pharmacie/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  productType: string;
  brand: { id: string; name: string } | null;
  _count: { variants: number };
};

const TYPE_CODES = ["COSMETIC", "SUPPLEMENT", "DEVICE", "OTHER"] as const;

const TYPE_COLORS: Record<string, string> = {
  COSMETIC: "bg-brand-50 text-brand-700",
  SUPPLEMENT: "bg-teal-50 text-teal-700",
  DEVICE: "bg-info-bg text-info-text",
  OTHER: "bg-bg-subtle text-muted",
};

export function ProduitsTable({ initialData }: { initialData: ProductRow[] }) {
  const t = useTranslations("admin.products");
  const tp = useTranslations("admin.pagination");
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });

  const { data = initialData } = useQuery<ProductRow[]>({
    queryKey: ["admin", "produits"],
    queryFn: () => fetch("/api/admin/produits").then((r) => r.json()),
    initialData,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteProductAction(fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "produits"] }),
  });

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm(t("table.confirmDelete"))) deleteMutation.mutate(id);
    },
    [deleteMutation, t],
  );

  const columns = useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("table.colName"),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.getValue("name")}</span>
        ),
      },
      {
        id: "brand",
        accessorFn: (row) => row.brand?.name ?? "",
        header: t("table.colBrand"),
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return v ? (
            <span className="text-sm text-text-secondary">{v}</span>
          ) : (
            <span className="text-xs text-muted">—</span>
          );
        },
        enableColumnFilter: false,
      },
      {
        accessorKey: "productType",
        header: t("table.colType"),
        filterFn: "equals",
        cell: ({ getValue }) => {
          const code = getValue<string>();
          return (
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_COLORS[code] ?? TYPE_COLORS.OTHER}`}
            >
              {t(`types.${code}` as "types.COSMETIC")}
            </span>
          );
        },
      },
      {
        id: "variants",
        accessorFn: (row) => row._count.variants,
        header: t("table.colVariants"),
        enableGlobalFilter: false,
        cell: ({ getValue }) => {
          const n = getValue<number>();
          return (
            <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-semibold text-muted">
              {n <= 1 ? t("table.simple") : t("table.variantCount", { count: n })}
            </span>
          );
        },
      },
      {
        accessorKey: "active",
        header: t("table.colStatus"),
        filterFn: "equals",
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[11px] font-semibold text-success-text">
              <span className="h-1.5 w-1.5 rounded-full bg-success-solid" />
              {t("table.statusActiveBadge")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-subtle px-2.5 py-0.5 text-[11px] font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-muted" />
              {t("table.statusHiddenBadge")}
            </span>
          ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-0.5">
            <Link
              href={`/admin/produits/${row.original.id}`}
              title={t("table.edit")}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-bg-subtle hover:text-brand-700"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              title={t("table.delete")}
              onClick={() => handleDelete(row.original.id)}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-danger-bg hover:text-danger-solid"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [handleDelete, t],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: (v) => {
      setGlobalFilter(v);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  });

  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={t("table.search")}
            className="pl-9"
          />
        </div>

        <Select
          size="sm"
          aria-label={t("table.filterType")}
          className="min-w-[160px]"
          value={(table.getColumn("productType")?.getFilterValue() as string | undefined) ?? ""}
          onValueChange={(v) => table.getColumn("productType")?.setFilterValue(v || undefined)}
          options={[
            { value: "", label: t("table.typeAll") },
            ...TYPE_CODES.map((value) => ({
              value,
              label: t(`types.${value}` as "types.COSMETIC"),
            })),
          ]}
        />

        <Select
          size="sm"
          aria-label={t("table.filterStatus")}
          className="min-w-[150px]"
          value={
            table.getColumn("active")?.getFilterValue() === true
              ? "active"
              : table.getColumn("active")?.getFilterValue() === false
                ? "inactive"
                : ""
          }
          onValueChange={(v) =>
            table
              .getColumn("active")
              ?.setFilterValue(v === "active" ? true : v === "inactive" ? false : undefined)
          }
          options={[
            { value: "", label: t("table.statusAll") },
            { value: "active", label: t("table.statusActive") },
            { value: "inactive", label: t("table.statusHidden") },
          ]}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-line bg-surface">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-foreground">{t("table.emptyTitle")}</p>
            <p className="mt-1 text-xs text-muted">{t("table.emptyHint")}</p>
          </div>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-line bg-bg-subtle">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cx(
                        "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted",
                        header.column.getCanSort()
                          ? "cursor-pointer select-none hover:text-foreground"
                          : "",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" && " ↑"}
                        {header.column.getIsSorted() === "desc" && " ↓"}
                        {header.column.getCanSort() && !header.column.getIsSorted() && (
                          <span className="opacity-30">↕</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-line">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-bg-subtle">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted">
            {t("table.paginationCount", {
              from: pageIndex * pageSize + 1,
              to: Math.min((pageIndex + 1) * pageSize, total),
              total,
            })}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:bg-bg-subtle disabled:opacity-30"
            >
              «
            </button>
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:bg-bg-subtle disabled:opacity-30"
            >
              ‹
            </button>
            <span className="px-3 text-xs font-medium text-foreground">
              {tp("pageLabeled", { current: pageIndex + 1, total: table.getPageCount() })}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:bg-bg-subtle disabled:opacity-30"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:bg-bg-subtle disabled:opacity-30"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
