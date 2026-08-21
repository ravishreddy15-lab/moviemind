import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Star, Bookmark, BookmarkCheck, Heart, HeartOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Movie } from "@/utils/api";
import RatingBadge from "./RatingBadge";
import { isInWatchlist, addToWatchlist, removeFromWatchlist, isLiked, toggleLiked } from "@/utils/watchlist";

interface MovieCardProps {
  movie: Movie;
  showMatch?: boolean;
  compact?: boolean;
}

const genreGradients: Record<string, string> = {
  Action: "from-red-600/40 to-orange-600/20",
  Comedy: "from-yellow-600/40 to-amber-600/20",
  Drama: "from-blue-600/40 to-indigo-600/20",
  Horror: "from-gray-800/60 to-red-900/30",
  "Sci-Fi": "from-cyan-600/40 to-blue-600/20",
  Romance: "from-pink-600/40 to-rose-600/20",
  Thriller: "from-purple-600/40 to-gray-800/30",
  Animation: "from-green-500/40 to-emerald-600/20",
  Adventure: "from-emerald-600/40 to-teal-600/20",
  Crime: "from-slate-600/40 to-zinc-700/20",
  Mystery: "from-violet-600/40 to-purple-800/20",
  Fantasy: "from-fuchsia-600/40 to-pink-600/20",
  War: "from-stone-600/40 to-amber-800/20",
  Biography: "from-teal-600/40 to-cyan-700/20",
  Music: "from-indigo-500/40 to-purple-600/20",
  Western: "from-orange-700/40 to-yellow-800/20",
};

function useWatchlistSync(movieId: string) {
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist(movieId));
  const [liked, setLiked] = useState(isLiked(movieId));
  const refresh = () => { setInWatchlist(isInWatchlist(movieId)); setLiked(isLiked(movieId)); };
  useEffect(() => { window.addEventListener("moviemind-data-changed", refresh); return () => window.removeEventListener("moviemind-data-changed", refresh); }, [movieId]);
  return { inWatchlist, setInWatchlist, liked, setLiked };
}

export default function MovieCard({ movie, showMatch = false, compact = false }: MovieCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const { inWatchlist, setInWatchlist, liked, setLiked } = useWatchlistSync(movie.id);
  const gradient = genreGradients[movie.genre?.[0]] || "from-zinc-700/40 to-zinc-800/20";
  const poster = (movie as any).poster as string | undefined;
  const showPoster = poster && !imgError;

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      className={cn(
        "group relative rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden cursor-pointer transition-all duration-200 hover-glow",
        compact ? "w-[180px]" : "w-full"
      )}
      role="article"
      aria-label={`${movie.title}, ${movie.year}, rated ${movie.rating}`}
    >
      {showMatch && movie.matchPercentage !== undefined && (
        <div className="absolute top-2 right-2 z-10 bg-primary/90 text-white text-xs font-bold rounded-full px-2 py-0.5">
          {movie.matchPercentage}% Match
        </div>
      )}

      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); const next = !inWatchlist; if (next) addToWatchlist(movie.id); else removeFromWatchlist(movie.id); setInWatchlist(next); }}
          className={cn("p-1.5 rounded-lg backdrop-blur-sm transition-colors", inWatchlist ? "bg-purple-600 text-white" : "bg-black/60 text-zinc-400 hover:text-white")}
          title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); toggleLiked(movie.id); }}
          className={cn("p-1.5 rounded-lg backdrop-blur-sm transition-colors", liked ? "bg-red-500 text-white" : "bg-black/60 text-zinc-400 hover:text-white")}
          title={liked ? "Unlike" : "Like"}
        >
          {liked ? <Heart className="w-4 h-4 fill-white" /> : <HeartOff className="w-4 h-4" />}
        </button>
      </div>

      <div className={cn("relative overflow-hidden", compact ? "aspect-video" : "aspect-[2/3]")}>
        {showPoster ? (
          <>
            <img
              src={poster}
              alt={`${movie.title} poster`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
          </>
        ) : (
          <>
            <div className={cn("absolute inset-0 bg-gradient-to-br flex items-center justify-center", gradient)}>
              <span className={cn("font-bold text-white/20", compact ? "text-3xl" : "text-6xl")}>
                {movie.title?.[0] || "M"}
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
          </>
        )}
      </div>

      <div className={cn(compact ? "p-2.5" : "p-4")}>
        <h3 className={cn("font-semibold text-white truncate", compact ? "text-xs" : "text-sm")}>
          {movie.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {movie.year} &bull; {movie.duration}
        </p>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {(movie.genre || []).slice(0, compact ? 2 : 3).map((g) => (
            <span key={g} className="text-[10px] rounded-full px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700/50">
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <RatingBadge rating={movie.rating} size="sm" />
          {!compact && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500">
              <Star className="h-3 w-3 fill-zinc-600 text-zinc-600" />
              {movie.votes >= 1000000 ? `${(movie.votes / 1000000).toFixed(1)}M` : `${(movie.votes / 1000).toFixed(0)}K`}
            </span>
          )}
        </div>
      </div>

      {!compact && (
        <div className="flex items-center gap-1 px-4 pb-3">
          <button
            onClick={(e) => { e.stopPropagation(); if (inWatchlist) removeFromWatchlist(movie.id); else addToWatchlist(movie.id); setInWatchlist(!inWatchlist); }}
            className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors", inWatchlist ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white")}
          >
            {inWatchlist ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
            {inWatchlist ? "Saved" : "Watchlist"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(toggleLiked(movie.id)); }}
            className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors", liked ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white")}
          >
            {liked ? <Heart className="w-3 h-3 fill-white" /> : <HeartOff className="w-3 h-3" />}
            {liked ? "Liked" : "Like"}
          </button>
        </div>
      )}
    </div>
  );
}
