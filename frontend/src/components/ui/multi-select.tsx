import * as React from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface MultiSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  hideSelectAll?: boolean;
  className?: string;
  emptyIndicator?: React.ReactNode;
  maxCount?: number;
}

export function MultiSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select options",
  disabled = false,
  searchable = true,
  hideSelectAll = false,
  className,
  emptyIndicator,
  maxCount = 3,
}: MultiSelectProps) {
  const emptyDefaultRef = React.useRef<string[]>([]);
  const defaultSelection = defaultValue ?? emptyDefaultRef.current;
  const [internalValue, setInternalValue] =
    React.useState<string[]>(defaultSelection);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedValues = value ?? internalValue;

  React.useEffect(() => {
    if (value !== undefined) return;
    const current = internalValue;
    const next = defaultSelection;
    if (
      current.length === next.length &&
      current.every((v, i) => v === next[i])
    ) {
      return;
    }
    setInternalValue(next);
  }, [defaultSelection, internalValue, value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const updateValues = (next: string[]) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const toggleValue = (optionValue: string) => {
    if (disabled) return;
    const option = options.find((item) => item.value === optionValue);
    if (option?.disabled) return;

    const next = selectedValues.includes(optionValue)
      ? selectedValues.filter((item) => item !== optionValue)
      : [...selectedValues, optionValue];

    updateValues(next);
  };

  const handleClear = () => {
    if (disabled) return;
    updateValues([]);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const enabledOptions = options.filter((item) => !item.disabled);
    if (selectedValues.length === enabledOptions.length) {
      handleClear();
      return;
    }
    updateValues(enabledOptions.map((item) => item.value));
  };

  const enabledOptionCount = options.filter((item) => !item.disabled).length;
  const isAllSelected =
    enabledOptionCount > 0 && selectedValues.length === enabledOptionCount;

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);

  const displayText =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length > maxCount
        ? `${selectedLabels.slice(0, maxCount).join(", ")} +${
            selectedLabels.length - maxCount
          } more`
        : selectedLabels.join(", ");

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className="w-full ps-3 pe-3 py-2.5 bg-transparent! text-sm rounded border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 flex items-center justify-between gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 min-h-9"
      >
        <span className="line-clamp-2 flex-1 text-left" title={displayText}>
          {displayText || <span className="text-body">{placeholder}</span>}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded border border-accent bg-black shadow-md shadow-accent/30 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          {searchable && (
            <div className="p-1.5">
              <input
                ref={inputRef}
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full ps-3 pe-3 py-1.5 text-heading text-sm rounded border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body"
              />
            </div>
          )}

          {!hideSelectAll && (
            <div className="px-1 pb-1">
              <div
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-pressed={isAllSelected}
                onClick={handleSelectAll}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSelectAll();
                  }
                }}
                className={cn(
                  "cursor-pointer flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent/40 hover:text-foreground",
                  isAllSelected && "bg-muted text-foreground",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border border-accent",
                    isAllSelected && "bg-accent text-accent-foreground",
                    disabled && "opacity-50",
                  )}
                >
                  {isAllSelected && <CheckIcon className="h-3 w-3" />}
                </div>
                <span className="flex-1">(Select All)</span>
                {isAllSelected && <CheckIcon className="h-4 w-4" />}
              </div>
            </div>
          )}

          <div className="max-h-[220px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-2 px-3 text-sm text-body">
                {emptyIndicator ?? "No results found."}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    role="button"
                    tabIndex={option.disabled ? -1 : 0}
                    aria-disabled={option.disabled}
                    aria-pressed={isSelected}
                    onClick={() => toggleValue(option.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleValue(option.value);
                      }
                    }}
                    className={cn(
                      "cursor-pointer flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent/40 hover:text-foreground",
                      isSelected && "bg-muted text-foreground",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border border-accent",
                        isSelected && "bg-accent text-accent-foreground",
                        option.disabled && "opacity-50",
                      )}
                    >
                      {isSelected && <CheckIcon className="h-3 w-3" />}
                    </div>
                    <span className="flex-1">{option.label}</span>
                    {isSelected && <CheckIcon className="h-4 w-4" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
