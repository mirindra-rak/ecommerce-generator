"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { cx } from "../lib/cx";
import { ImageIcon, SpinnerIcon, TrashIcon, UploadIcon } from "../icons";

export interface MediaItem {
  key: string;
  url: string;
  alt?: string;
}

interface MultiImageUploadProps {
  label: string;
  hint?: string;
  primaryLabel?: string;
  uploadLabel?: string;
  uploadingLabel?: string;
  removeLabel?: string;
  errorLabel?: string;
  altLabel?: string;
  items?: MediaItem[];
  onUpload: (file: File) => Promise<{ key: string; url: string }>;
  onChange: (items: MediaItem[]) => void;
}

export function MultiImageUpload({
  label,
  hint,
  primaryLabel = "Primary",
  uploadLabel = "Click or drag and drop",
  uploadingLabel = "Uploading…",
  removeLabel = "Remove",
  errorLabel = "Upload failed",
  altLabel = "Alt text",
  items = [],
  onUpload,
  onChange,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      setUploading(true);
      setError(false);
      const newItems = [...items];
      for (const file of Array.from(files)) {
        try {
          const result = await onUpload(file);
          newItems.push({ key: result.key, url: result.url });
        } catch {
          setError(true);
        }
      }
      setUploading(false);
      onChange(newItems);
    },
    [items, onUpload, onChange],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const next = items.filter((_, i) => i !== index);
      onChange(next);
    },
    [items, onChange],
  );

  const handleAltChange = useCallback(
    (index: number, alt: string) => {
      const next = items.map((item, i) => (i === index ? { ...item, alt } : item));
      onChange(next);
    },
    [items, onChange],
  );

  const handleItemDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleItemDragOver = useCallback(
    (e: DragEvent, index: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) return;
      setDragOverIndex(index);
    },
    [dragIndex],
  );

  const handleItemDrop = useCallback(
    (e: DragEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragIndex === null || dragIndex === index) return;
      const next = [...items];
      const moved = next.splice(dragIndex, 1)[0];
      if (!moved) return;
      next.splice(index, 0, moved);
      onChange(next);
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, items, onChange],
  );

  const handleItemDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.key}
              draggable
              onDragStart={() => handleItemDragStart(index)}
              onDragOver={(e) => handleItemDragOver(e, index)}
              onDrop={(e) => handleItemDrop(e, index)}
              onDragEnd={handleItemDragEnd}
              className={cx(
                "group relative cursor-grab overflow-hidden rounded-sm border transition-all",
                dragIndex === index && "opacity-40",
                dragOverIndex === index &&
                  dragIndex !== index &&
                  "border-brand-500 ring-2 ring-brand-500/20",
                index === 0 ? "border-brand-500" : "border-line",
              )}
            >
              <img
                src={item.url}
                alt={item.alt ?? ""}
                className="aspect-square w-full object-cover"
              />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-sm bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {primaryLabel}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-sm bg-surface/90 px-1.5 py-0.5 text-[11px] font-medium text-danger-text opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                <TrashIcon className="h-3 w-3" />
                {removeLabel}
              </button>
              <input
                type="text"
                placeholder={altLabel}
                value={item.alt ?? ""}
                onChange={(e) => handleAltChange(index, e.target.value)}
                className="w-full border-t border-line bg-surface px-2 py-1 text-xs text-foreground placeholder:text-muted/60 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        disabled={uploading}
        className={cx(
          "flex w-full flex-col items-center gap-2 rounded-sm border-2 border-dashed px-4 py-6 text-sm transition-colors",
          dragging
            ? "border-brand-500 bg-brand-500/5"
            : "border-line hover:border-brand-400 hover:bg-bg-subtle",
          error && "border-danger-border",
        )}
      >
        {uploading ? (
          <>
            <SpinnerIcon className="h-6 w-6 animate-spin text-muted" />
            <span className="text-muted">{uploadingLabel}</span>
          </>
        ) : error ? (
          <>
            <ImageIcon className="h-6 w-6 text-danger-text" />
            <span className="text-danger-text">{errorLabel}</span>
            <span className="text-xs text-muted">{uploadLabel}</span>
          </>
        ) : (
          <>
            <UploadIcon className="h-6 w-6 text-muted" />
            <span className="text-muted">{uploadLabel}</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}
