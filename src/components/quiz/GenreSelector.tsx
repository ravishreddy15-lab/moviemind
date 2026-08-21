import { cn } from "@/lib/utils";
import { genres } from "@/data/movies";

interface GenreSelectorProps {
  selectedGenres: string[];
  onToggle: (genre: string) => void;
}

const MAX_SELECTIONS = 5;

export default function GenreSelector({ selectedGenres, onToggle }: GenreSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Select up to {MAX_SELECTIONS} genres
        <span className="ml-2 text-purple-400 font-medium">({selectedGenres.length}/{MAX_SELECTIONS})</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          const isDisabled = !isSelected && selectedGenres.length >= MAX_SELECTIONS;
          return (
            <button
              key={genre}
              onClick={() => onToggle(genre)}
              disabled={isDisabled}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium border transition-all duration-200 cursor-pointer btn-press",
                isSelected ? "bg-purple-600 border-purple-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center animate-pop-in">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
