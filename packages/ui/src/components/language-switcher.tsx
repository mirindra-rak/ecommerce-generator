"use client";

import * as Popover from "@radix-ui/react-popover";
import { cx } from "../lib/cx";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "../icons";

// Sélecteur de langue éditorial — primitive PRÉSENTATIONNELLE (aucun couplage routing /
// next-intl : l'app câble `value`/`onValueChange`). Bâti sur Radix Popover, comme
// `multi-select` : positionnement, focus, fermeture (clic extérieur / Échap) gérés par
// Radix ; la liste d'options (coche sur la locale active) est rendue en React.

export interface LanguageOption {
  /** Code BCP-47 court ("fr", "en"…). */
  value: string;
  /** Libellé affiché — autonyme attendu ("Français", "English"). */
  label: string;
}

export interface LanguageSwitcherProps {
  options: LanguageOption[];
  /** Locale active. */
  value: string;
  onValueChange: (value: string) => void;
  /** Libellé accessible du déclencheur (traduit côté app). */
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

export function LanguageSwitcher({
  options,
  value,
  onValueChange,
  ariaLabel,
  disabled,
  className,
  contentClassName,
}: LanguageSwitcherProps) {
  const active = options.find((o) => o.value === value);

  return (
    <Popover.Root>
      <Popover.Trigger
        disabled={disabled}
        aria-label={ariaLabel}
        className={cx(
          "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-2 text-sm font-medium text-foreground/70 outline-none transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        <GlobeIcon className="h-5 w-5 shrink-0" aria-hidden />
        {/* Code court en compact, libellé complet ≥ sm */}
        <span className="hidden sm:inline">{active?.label ?? value}</span>
        <span className="uppercase sm:hidden">{value}</span>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          className={cx(
            "z-50 min-w-40 rounded-sm border border-line bg-surface p-1 shadow-lg shadow-foreground/5",
            contentClassName,
          )}
        >
          <div role="listbox" aria-label={ariaLabel}>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Popover.Close asChild key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => onValueChange(option.value)}
                    className={cx(
                      "flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm text-foreground outline-none",
                      "hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50 focus-visible:text-brand-700",
                      isSelected && "font-medium",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <CheckIcon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                    )}
                  </button>
                </Popover.Close>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
