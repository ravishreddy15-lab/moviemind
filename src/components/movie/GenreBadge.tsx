import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GenreBadgeProps {
  genre: string;
  selected?: boolean;
  onClick?: () => void;
}

const genreColorMap: Record<string, { base: string; selected: string }> = {
  Action: {
    base: "bg-red-500/10 text-red-400 border-red-500/20",
    selected: "bg-red-500/30 text-red-300 border-red-400 ring-1 ring-red-400/50",
  },
  Adventure: {
    base: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    selected: "bg-emerald-500/30 text-emerald-300 border-emerald-400 ring-1 ring-emerald-400/50",
  },
  Animation: {
    base: "bg-green-400/10 text-green-400 border-green-500/20",
    selected: "bg-green-400/30 text-green-300 border-green-400 ring-1 ring-green-400/50",
  },
  Biography: {
    base: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    selected: "bg-teal-500/30 text-teal-300 border-teal-400 ring-1 ring-teal-400/50",
  },
  Comedy: {
    base: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    selected: "bg-yellow-500/30 text-yellow-300 border-yellow-400 ring-1 ring-yellow-400/50",
  },
  Crime: {
    base: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    selected: "bg-slate-500/30 text-slate-300 border-slate-400 ring-1 ring-slate-400/50",
  },
  Drama: {
    base: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    selected: "bg-blue-500/30 text-blue-300 border-blue-400 ring-1 ring-blue-400/50",
  },
  Fantasy: {
    base: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    selected: "bg-fuchsia-500/30 text-fuchsia-300 border-fuchsia-400 ring-1 ring-fuchsia-400/50",
  },
  Horror: {
    base: "bg-red-900/20 text-red-300 border-red-700/30",
    selected: "bg-red-900/40 text-red-200 border-red-600/50 ring-1 ring-red-500/50",
  },
  Mystery: {
    base: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    selected: "bg-violet-500/30 text-violet-300 border-violet-400 ring-1 ring-violet-400/50",
  },
  Romance: {
    base: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    selected: "bg-pink-500/30 text-pink-300 border-pink-400 ring-1 ring-pink-400/50",
  },
  "Sci-Fi": {
    base: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    selected: "bg-purple-500/30 text-purple-300 border-purple-400 ring-1 ring-purple-400/50",
  },
  Thriller: {
    base: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    selected: "bg-orange-500/30 text-orange-300 border-orange-400 ring-1 ring-orange-400/50",
  },
  War: {
    base: "bg-stone-500/10 text-stone-400 border-stone-500/20",
    selected: "bg-stone-500/30 text-stone-300 border-stone-400 ring-1 ring-stone-400/50",
  },
  Western: {
    base: "bg-orange-600/10 text-orange-300 border-orange-600/20",
    selected: "bg-orange-600/30 text-orange-200 border-orange-500/50 ring-1 ring-orange-500/50",
  },
  Music: {
    base: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
    selected: "bg-indigo-400/30 text-indigo-300 border-indigo-400 ring-1 ring-indigo-400/50",
  },
};

const defaultColor = {
  base: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  selected: "bg-zinc-500/30 text-zinc-300 border-zinc-400 ring-1 ring-zinc-400/50",
};

export default function GenreBadge({ genre, selected = false, onClick }: GenreBadgeProps) {
  const colors = genreColorMap[genre] || defaultColor;

  return (
    <motion.button
      type="button"
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        selected ? colors.selected : colors.base,
        onClick && "cursor-pointer",
        !onClick && "cursor-default"
      )}
      aria-pressed={selected}
      aria-label={`Genre: ${genre}`}
    >
      {genre}
    </motion.button>
  );
}
