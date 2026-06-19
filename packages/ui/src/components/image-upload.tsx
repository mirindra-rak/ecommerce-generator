"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { cx } from "../lib/cx";
import { ImageIcon, SpinnerIcon, TrashIcon, UploadIcon } from "../icons";

type UploadState = "idle" | "uploading" | "uploaded" | "error";

interface ImageUploadProps {
  label: string;
  hint?: string;
  currentUrl?: string | null;
  uploadLabel?: string;
  uploadingLabel?: string;
  removeLabel?: string;
  errorLabel?: string;
  onUpload: (file: File) => Promise<{ key: string; url: string }>;
  onRemove?: () => void;
  onChange?: (result: { key: string; url: string } | null) => void;
}

export function ImageUpload({
  label,
  hint,
  currentUrl,
  uploadLabel = "Click or drag and drop",
  uploadingLabel = "Uploading…",
  removeLabel = "Remove",
  errorLabel = "Upload failed",
  onUpload,
  onRemove,
  onChange,
}: ImageUploadProps) {
  const [state, setState] = useState<UploadState>(currentUrl ? "uploaded" : "idle");
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setState("uploading");
      try {
        const result = await onUpload(file);
        setPreview(result.url);
        setState("uploaded");
        onChange?.(result);
      } catch {
        setState("error");
      }
    },
    [onUpload, onChange],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    setState("idle");
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.();
    onChange?.(null);
  }, [onRemove, onChange]);

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}

      {preview ? (
        <div className="group relative overflow-hidden rounded-sm border border-line">
          <img src={preview} alt={label} className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 flex items-center gap-1.5 rounded-sm bg-surface/90 px-2 py-1 text-xs font-medium text-danger-text opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            {removeLabel}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          disabled={state === "uploading"}
          className={cx(
            "flex w-full flex-col items-center gap-2 rounded-sm border-2 border-dashed px-4 py-8 text-sm transition-colors",
            dragging
              ? "border-brand-500 bg-brand-500/5"
              : "border-line hover:border-brand-400 hover:bg-bg-subtle",
            state === "error" && "border-danger-border",
          )}
        >
          {state === "uploading" ? (
            <>
              <SpinnerIcon className="h-6 w-6 animate-spin text-muted" />
              <span className="text-muted">{uploadingLabel}</span>
            </>
          ) : state === "error" ? (
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
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
