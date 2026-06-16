"use client";

import { deleteBrandAction } from "@/app/admin/(protected)/marques/_actions";
import { Input, SearchIcon, cx } from "@pharmacie/ui";
import { PencilIcon, TrashIcon } from "@pharmacie/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
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

type BrandRow = {
  id: string;
  name: string;
  slug: string;
};

export function MarquesTable({ initialData }: { initialData: BrandRow[] }) {
  const t = useTranslations("admin.brands");
  const tPagination = useTranslations("admin.pagination");
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const { data = initialData } = useQuery<BrandRow[]>({
    queryKey: ["admin", "marques"],
    queryFn: () => fetch("/api/admin/marques").then((r) => r.json()),
    initialData,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteBrandAction(fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "marques"] }),
  });

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm(t("table.confirmDelete"))) deleteMutation.mutate(id);
    },
    [deleteMutation, t],
  );

  const columns = useMemo<ColumnDef<BrandRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("table.colName"),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-50 text-[11px] font-bold text-accent-600">
              {row.original.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-medium text-foreground">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "slug",
        header: t("table.colSlug"),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted">/{getValue<string>()}</span>
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
              href={`/admin/marques/${row.original.id}`}
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
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: (v) => {
      setGlobalFilter(v);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
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
      <div className="mb-4">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={t("table.search")}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-line bg-surface">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-foreground">{t("table.emptyTitle")}</p>
            <p className="mt-1 text-xs text-muted">{t("table.emptyHint")}</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
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
      {total > pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted">
            {tPagination("range", {
              from: pageIndex * pageSize + 1,
              to: Math.min((pageIndex + 1) * pageSize, total),
              total,
            })}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:bg-bg-subtle disabled:opacity-30"
            >
              ‹
            </button>
            <span className="px-3 text-xs font-medium text-foreground">
              {tPagination("page", { current: pageIndex + 1, total: table.getPageCount() })}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:bg-bg-subtle disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
