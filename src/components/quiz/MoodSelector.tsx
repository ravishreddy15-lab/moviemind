import { cn } from "@/lib/utils";
import { moods } from "@/data/movies";

interface MoodSelectorProps {
  selectedMood: string | null;
  onSelect: (mood: string) => void;
}

export default function MoodSelector({ selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {moods.map((mood) => {
        const isSelected = selectedMood === mood.id;
        return (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-xl p-4 border transition-all duration-200 cursor-pointer btn-press",
              isSelected
                ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/30"
                : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800"
            )}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className={cn("text-sm font-medium", isSelected ? "text-purple-400" : "text-zinc-300")}>
              {mood.label}
            </span>
            {isSelected && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center animate-pop-in">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
