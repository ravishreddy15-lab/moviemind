import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { genres, certificates, durations } from "@/data/movies";
import { Slider } from "@/components/ui/slider";

export interface FilterState {
  genres: string[];
  yearRange: [number, number];
  minRating: number;
  certificates: string[];
  duration: string;
  sortBy: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-3 text-sm font-medium text-white"
      >
        {title}
        <div className={cn("transition-transform duration-200", open && "rotate-180")}>
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </div>
      </button>
      <div className={cn("accordion-content", open ? "expanded" : "collapsed")}>
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const toggleGenre = (genre: string) => {
    const updated = filters.genres.includes(genre)
      ? filters.genres.filter((g) => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: updated });
  };

  const toggleCertificate = (cert: string) => {
    const updated = filters.certificates.includes(cert)
      ? filters.certificates.filter((c) => c !== cert)
      : [...filters.certificates, cert];
    onChange({ ...filters, certificates: updated });
  };

  const clearAll = () => {
    onChange({ genres: [], yearRange: [1950, 2025], minRating: 0, certificates: [], duration: "", sortBy: "rating" });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">Filters</h3>
        <button type="button" onClick={clearAll} className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          <X className="h-3 w-3" />
          Clear All
        </button>
      </div>

      <FilterSection title="Genres">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                filters.genres.includes(genre) ? "bg-primary/20 text-primary border-primary/40" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-600"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Year Range">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{filters.yearRange[0]}</span>
            <span>{filters.yearRange[1]}</span>
          </div>
          <Slider min={1950} max={2025} step={1} value={filters.yearRange} onValueChange={(value) => onChange({ ...filters, yearRange: [value[0] ?? 1950, value[1] ?? 2025] })} className="w-full" />
        </div>
      </FilterSection>

      <FilterSection title="Minimum Rating">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{filters.minRating.toFixed(1)}</span>
            <span>10.0</span>
          </div>
          <Slider min={0} max={10} step={0.5} value={[filters.minRating]} onValueChange={(value) => onChange({ ...filters, minRating: value[0] ?? 0 })} className="w-full" />
        </div>
      </FilterSection>

      <FilterSection title="Certificate">
        <div className="flex flex-wrap gap-2">
          {certificates.map((cert) => (
            <button
              key={cert}
              type="button"
              onClick={() => toggleCertificate(cert)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.certificates.includes(cert) ? "bg-primary/20 text-primary border-primary/40" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-600"
              )}
            >
              {cert}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Duration">
        <select value={filters.duration} onChange={(e) => onChange({ ...filters, duration: e.target.value })} className={cn("w-full rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2", "focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all")}>
          <option value="">Any Duration</option>
          {durations.map((d) => (<option key={d} value={d}>{d}</option>))}
        </select>
      </FilterSection>

      <FilterSection title="Sort By">
        <select value={filters.sortBy} onChange={(e) => onChange({ ...filters, sortBy: e.target.value })} className={cn("w-full rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2", "focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all")}>
          <option value="rating">Rating (High to Low)</option>
          <option value="year">Year (Newest)</option>
          <option value="title">Title (A-Z)</option>
          <option value="votes">Most Popular</option>
        </select>
      </FilterSection>
    </div>
  );
}
