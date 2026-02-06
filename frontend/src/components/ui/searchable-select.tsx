import * as React from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase()),
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
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

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className="w-full ps-3 pe-3 py-2.5 text-heading bg-transparent text-sm rounded border border-accent placeholder:text-body focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 flex items-center justify-between gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 h-9"
      >
        <span className="line-clamp-1 flex-1 text-left">
          {value || <span className="text-body">{placeholder}</span>}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded border border-accent bg-background shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          <div className="p-1.5">
            <input
              ref={inputRef}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full ps-3 pe-3 py-1.5 text-heading text-sm rounded border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-2 px-3 text-sm text-body">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    onValueChange(option);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-8 pl-2 text-sm select-none hover:bg-accent hover:text-accent-foreground",
                    value === option && "bg-accent text-accent-foreground",
                  )}
                >
                  {option}
                  {value === option && (
                    <span className="absolute right-2 flex size-3.5 items-center justify-center">
                      <CheckIcon className="size-4" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { SearchableSelect };
