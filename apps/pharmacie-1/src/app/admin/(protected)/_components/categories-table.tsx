"use client";

import { deleteCategoryAction } from "@/app/admin/(protected)/categories/_actions";
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
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  parentId: string | null;
  productCount: number;
  depth: number;
};

type RawCategory = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  parentId: string | null;
  productCount: number;
};

function flattenWithDepth(
  categories: RawCategory[],
  parentId: string | null = null,
  depth = 0,
): CategoryRow[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .flatMap((c) => [
      {
        id: c.id,
        name: c.name,
        slug: c.slug,
        active: c.active,
        parentId: c.parentId,
        productCount: c.productCount,
        depth,
      },
      ...flattenWithDepth(categories, c.id, depth + 1),
    ]);
}

export function CategoriesTable({ initialData }: { initialData: RawCategory[] }) {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const { data: rawData = initialData } = useQuery<RawCategory[]>({
    queryKey: ["admin", "categories"],
    queryFn: () => fetch("/api/admin/categories").then((r) => r.json()),
    initialData,
    staleTime: 30_000,
  });

  // When filtering/sorting, use flat alphabetical; otherwise preserve tree order.
  const isSearching = globalFilter.length > 0 || columnFilters.length > 0;
  const tableData = useMemo<CategoryRow[]>(() => {
    if (isSearching) {
      return rawData.map((c) => ({ ...c, depth: 0 }));
    }
    return flattenWithDepth(rawData);
  }, [rawData, isSearching]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteCategoryAction(fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  const handleDelete = useCallback(
    (row: CategoryRow) => {
      const n = row.productCount;
      const message =
        n > 0
          ? `« ${row.name} » est associée à ${n} produit${n > 1 ? "s" : ""}. ` +
            `Ils seront détachés (mais pas supprimés). Supprimer la catégorie ?`
          : `Supprimer « ${row.name} » ?`;
      if (confirm(message)) deleteMutation.mutate(row.id);
    },
    [deleteMutation],
  );

  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nom",
        cell: ({ row }) => (
          <div
            className="flex items-center gap-1.5"
            style={{
              paddingLeft: row.original.depth > 0 ? `${row.original.depth * 20}px` : undefined,
            }}
          >
            {row.original.depth > 0 && <span className="text-xs text-muted">↳</span>}
            <span className="font-medium text-foreground">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted">/{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "active",
        header: "Statut",
        filterFn: "equals",
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-0.5 text-[11px] font-semibold text-success-text">
              <span className="h-1.5 w-1.5 rounded-full bg-success-solid" />
              Actif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-subtle px-2.5 py-0.5 text-[11px] font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-muted" />
              Masqué
            </span>
          ),
      },
      {
        accessorKey: "productCount",
        header: "Produits",
        enableGlobalFilter: false,
        cell: ({ getValue }) => <span className="text-xs text-muted">{getValue<number>()}</span>,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-0.5">
            <Link
              href={`/admin/categories/${row.original.id}`}
              title="Éditer"
              className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-bg-subtle hover:text-brand-700"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              title="Supprimer"
              onClick={() => handleDelete(row.original)}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-danger-bg hover:text-danger-solid"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [handleDelete],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting: isSearching ? sorting : [], globalFilter, columnFilters, pagination },
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
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Rechercher une catégorie…"
            className="pl-9"
          />
        </div>
        <Select
          size="sm"
          aria-label="Filtrer par statut"
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
            { value: "", label: "Tous les statuts" },
            { value: "active", label: "Actives" },
            { value: "inactive", label: "Masquées" },
          ]}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-line bg-surface">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-foreground">Aucune catégorie trouvée</p>
            <p className="mt-1 text-xs text-muted">Modifiez vos filtres ou créez une catégorie.</p>
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
                        header.column.getCanSort() && isSearching
                          ? "cursor-pointer select-none hover:text-foreground"
                          : "",
                      )}
                      onClick={isSearching ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSearching && header.column.getIsSorted() === "asc" && " ↑"}
                        {isSearching && header.column.getIsSorted() === "desc" && " ↓"}
                        {isSearching &&
                          header.column.getCanSort() &&
                          !header.column.getIsSorted() && <span className="opacity-30">↕</span>}
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
            {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, total)} sur {total}
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
              {pageIndex + 1} / {table.getPageCount()}
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
