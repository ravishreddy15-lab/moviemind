import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search movies, directors, actors...",
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch();
          }
        }}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500",
          "pl-12 pr-12 py-4 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
          "transition-all duration-200"
        )}
        aria-label="Search movies"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-700/50 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
