"use client";

import {
  createFacetValueAction,
  deleteFacetValueAction,
  reorderFacetValuesAction,
  updateFacetValueAction,
} from "@/app/admin/(protected)/facettes/_actions";
import { Button, Card, ChevronDownIcon, ChevronUpIcon, Input, TrashIcon } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface ValueRow {
  id: string;
  code: string;
  label: string;
  position: number;
}

interface ValuesEditorProps {
  facetId: string;
  values: ValueRow[];
}

export function ValuesEditor({ facetId, values: initial }: ValuesEditorProps) {
  const t = useTranslations("admin.facets.values");
  const [values, setValues] = useState(initial);
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = useCallback(async () => {
    if (!newLabel.trim()) return;
    setError(null);
    const fd = new FormData();
    fd.set("facetId", facetId);
    fd.set("label", newLabel.trim());
    const result = await createFacetValueAction(fd);
    if (result.error) {
      setError(result.error);
      return;
    }
    setNewLabel("");
    router.refresh();
  }, [facetId, newLabel, router]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm(t("confirmDelete"))) return;
      const fd = new FormData();
      fd.set("id", id);
      await deleteFacetValueAction(fd);
      setValues((prev) => prev.filter((v) => v.id !== id));
      router.refresh();
    },
    [t, router],
  );

  const handleMove = useCallback(
    async (index: number, direction: -1 | 1) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= values.length) return;
      const reordered = [...values];
      const [moved] = reordered.splice(index, 1);
      if (!moved) return;
      reordered.splice(newIndex, 0, moved);
      setValues(reordered);

      const fd = new FormData();
      fd.set("facetId", facetId);
      fd.set("ids", JSON.stringify(reordered.map((v) => v.id)));
      await reorderFacetValuesAction(fd);
    },
    [facetId, values],
  );

  const handleStartRename = useCallback((value: ValueRow) => {
    setEditingId(value.id);
    setEditLabel(value.label);
  }, []);

  const handleSaveRename = useCallback(
    async (id: string) => {
      if (!editLabel.trim()) return;
      setError(null);
      const fd = new FormData();
      fd.set("id", id);
      fd.set("label", editLabel.trim());
      const result = await updateFacetValueAction(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      setValues((prev) => prev.map((v) => (v.id === id ? { ...v, label: editLabel.trim() } : v)));
      setEditingId(null);
      setEditLabel("");
    },
    [editLabel],
  );

  return (
    <Card as="section" className="p-6">
      <header className="mb-5">
        <h2 className="text-sm font-bold text-foreground">{t("title")}</h2>
        <p className="mt-0.5 text-xs text-muted">{t("description")}</p>
      </header>

      {error && (
        <p className="mb-4 rounded-sm border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}

      {values.length > 0 && (
        <div className="mb-4 overflow-x-auto rounded-sm border border-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-subtle">
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("colLabel")}
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  {t("colCode")}
                </th>
                <th className="w-32 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {values.map((value, index) => (
                <tr key={value.id} className="transition-colors hover:bg-bg-subtle">
                  <td className="px-4 py-2.5">
                    {editingId === value.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveRename(value.id);
                            }
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                        <Button type="button" size="sm" onClick={() => handleSaveRename(value.id)}>
                          OK
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartRename(value)}
                        className="font-medium text-foreground hover:text-brand-700 hover:underline"
                        title={t("rename")}
                      >
                        {value.label}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-muted">{value.code}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        title={t("moveUp")}
                        disabled={index === 0}
                        onClick={() => handleMove(index, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-bg-subtle hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title={t("moveDown")}
                        disabled={index === values.length - 1}
                        onClick={() => handleMove(index, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-bg-subtle hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title={t("delete")}
                        onClick={() => handleDelete(value.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-sm text-muted transition-colors hover:bg-danger-bg hover:text-danger-solid"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder={t("addPlaceholder")}
          className="max-w-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={handleAdd}>
          {t("add")}
        </Button>
      </div>
    </Card>
  );
}
