"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { cx } from "../lib/cx";
import { CheckIcon, ChevronDownIcon } from "../icons";
import type { SelectOption } from "./select";

// Sélection multiple éditoriale. Radix Select étant mono-sélection, on s'appuie sur
// Radix Popover : positionnement, focus, fermeture (clic extérieur / Échap) gérés par
// Radix, la liste d'options (puces sélectionnées + coche) est rendue en React.
//
// Chaque valeur sélectionnée émet un `<input type="hidden" name={name}>` : à la
// soumission, `formData.getAll(name)` renvoie toutes les valeurs — comme une liste de
// cases à cocher, sans modifier les server actions.

export interface MultiSelectProps {
  options: SelectOption[];
  /** Mode contrôlé. */
  value?: string[];
  /** Mode non contrôlé (formulaires). */
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  /** Émet un `<input type="hidden">` par valeur sélectionnée. */
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  /** Classes du déclencheur (trigger). */
  className?: string;
  /** Classes du panneau d'options. */
  contentClassName?: string;
  "aria-label"?: string;
}

export function MultiSelect({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  name,
  id,
  placeholder = "Sélectionner…",
  disabled,
  size = "md",
  className,
  contentClassName,
  "aria-label": ariaLabel,
}: MultiSelectProps) {
  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const selected = isControlled ? controlledValue : internal;

  function toggle(optionValue: string) {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  const triggerSize =
    size === "sm" ? "min-h-9 px-3 py-1.5 text-sm" : "min-h-[2.625rem] px-4 py-2 text-sm";
  const selectedOptions = options.filter((o) => selected.includes(o.value));

  return (
    <Popover.Root>
      {name ? selected.map((v) => <input key={v} type="hidden" name={name} value={v} />) : null}
      <Popover.Trigger
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cx(
          "flex w-full items-center justify-between gap-2 rounded-sm border border-line bg-surface text-left text-foreground outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-60",
          triggerSize,
          className,
        )}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-muted">{placeholder}</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {selectedOptions.map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center rounded-sm bg-brand-50 px-1.5 py-0.5 text-xs text-brand-700"
              >
                {o.label}
              </span>
            ))}
          </span>
        )}
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className={cx(
            "z-50 max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) overflow-y-auto rounded-sm border border-line bg-surface p-1 shadow-lg shadow-foreground/5",
            contentClassName,
          )}
        >
          <div role="listbox" aria-multiselectable aria-label={ariaLabel}>
            {options.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted">Aucune option disponible.</p>
            )}
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => toggle(option.value)}
                  className={cx(
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-sm text-foreground outline-none",
                    "hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50 focus-visible:text-brand-700",
                    "disabled:cursor-not-allowed disabled:text-muted disabled:opacity-60",
                    isSelected && "font-medium",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
