"use client";

import { deleteRuleAction, toggleRuleAction } from "@/app/admin/(protected)/promotions/_actions";
import { Badge, Input, PencilIcon, SearchIcon, TrashIcon, cx } from "@pharmacie/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export type RuleRow = {
  id: string;
  name: string;
  active: boolean;
  discountType: string;
  discountValue: number;
  targetType: string;
  targetsCount: number;
  priority: number;
  startDate: string | null;
  endDate: string | null;
};

type RuleStatus = "active" | "inactive" | "scheduled" | "expired";

function deriveStatus(row: RuleRow): RuleStatus {
  if (!row.active) return "inactive";
  const now = Date.now();
  if (row.startDate && new Date(row.startDate).getTime() > now) return "scheduled";
  if (row.endDate && new Date(row.endDate).getTime() < now) return "expired";
  return "active";
}

const STATUS_TONE: Record<RuleStatus, "accent" | "brand" | "neutral"> = {
  active: "accent",
  inactive: "neutral",
  scheduled: "brand",
  expired: "neutral",
};

function formatDiscount(type: string, value: number): string {
  if (type === "PERCENTAGE") {
    return `${(value / 100).toFixed(value % 100 === 0 ? 0 : 1)} %`;
  }
  return `${(value / 100).toFixed(2)} €`;
}

export function PromotionsTable({ initialData }: { initialData: RuleRow[] }) {
  const t = useTranslations("admin.promotions");
  const tPagination = useTranslations("admin.pagination");
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  const data = initialData;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteRuleAction(fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "promotions"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const fd = new FormData();
      fd.set("id", id);
      await toggleRuleAction(fd);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "promotions"] }),
  });

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm(t("table.confirmDelete"))) deleteMutation.mutate(id);
    },
    [deleteMutation, t],
  );

  const columns = useMemo<ColumnDef<RuleRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("table.colName"),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.getValue("name")}</span>
        ),
      },
      {
        id: "status",
        header: t("table.colStatus"),
        enableSorting: false,
        cell: ({ row }) => {
          const status = deriveStatus(row.original);
          return <Badge tone={STATUS_TONE[status]}>{t(`status.${status}`)}</Badge>;
        },
      },
      {
        id: "discount",
        header: t("table.colDiscount"),
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {formatDiscount(row.original.discountType, row.original.discountValue)}
          </span>
        ),
      },
      {
        id: "target",
        header: t("table.colTarget"),
        cell: ({ row }) => {
          const { targetType, targetsCount } = row.original;
          if (targetType === "ALL") return <Badge tone="neutral">{t("target.all")}</Badge>;
          const key =
            targetType === "CATEGORY"
              ? "categories"
              : targetType === "BRAND"
                ? "brands"
                : "products";
          return <Badge tone="neutral">{t(`target.${key}`, { count: targetsCount })}</Badge>;
        },
      },
      {
        accessorKey: "priority",
        header: t("table.colPriority"),
        cell: ({ getValue }) => <span className="text-xs text-muted">{getValue<number>()}</span>,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-0.5">
            <button
              type="button"
              title={row.original.active ? t("status.inactive") : t("status.active")}
              onClick={() => toggleMutation.mutate(row.original.id)}
              className={cx(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                row.original.active ? "bg-accent-600" : "bg-gray-300",
              )}
            >
              <span
                className={cx(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform",
                  row.original.active ? "translate-x-4" : "translate-x-0",
                )}
              />
            </button>
            <Link
              href={`/admin/promotions/${row.original.id}`}
              title={t("table.colName")}
              className="ml-2 flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-bg-subtle hover:text-brand-700"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              title={t("table.confirmDelete")}
              onClick={() => handleDelete(row.original.id)}
              className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-danger-bg hover:text-danger-solid"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [handleDelete, toggleMutation, t],
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
