"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "cn";

export interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxSelectProps {
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  inputClassName?: string;
  onValueChange: (value: string | null) => void;
  options: ComboboxOption[];
  placeholder: string;
  value: string | null;
}

export function ComboboxSelect({
  ariaLabel,
  className,
  disabled,
  id,
  inputClassName,
  onValueChange,
  options,
  placeholder,
  value,
}: ComboboxSelectProps) {
  const optionLabels = new Map(
    options.map((option) => [option.value, option.label]),
  );
  const values = options.map((option) => option.value);

  return (
    <ComboboxPrimitive.Root
      items={values}
      value={value}
      disabled={disabled}
      itemToStringLabel={(optionValue) =>
        optionLabels.get(optionValue) ?? optionValue
      }
      onValueChange={onValueChange}
    >
      <div className={cn("relative w-full", className)}>
        <ComboboxPrimitive.Input
          id={id}
          aria-label={ariaLabel}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "h-9 w-full rounded-lg border border-input bg-background py-1 pr-9 pl-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
            inputClassName,
          )}
        />
        <ComboboxPrimitive.Trigger
          type="button"
          aria-label={`Show ${ariaLabel ?? placeholder} options`}
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronDown className="size-4" />
        </ComboboxPrimitive.Trigger>
      </div>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          sideOffset={4}
          align="start"
          className="isolate z-50"
        >
          <ComboboxPrimitive.Popup className="group/combobox-content max-h-(--available-height) w-(--anchor-width) min-w-36 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <ComboboxPrimitive.List className="max-h-60 overflow-y-auto p-1">
              {options.map((option) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  {option.label}
                  <ComboboxPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
                    <Check className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              ))}
            </ComboboxPrimitive.List>
            <ComboboxPrimitive.Empty className="hidden px-3 py-2 text-sm text-muted-foreground group-data-empty/combobox-content:flex">
              No matching options.
            </ComboboxPrimitive.Empty>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
