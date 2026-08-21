import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Bookmark, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn, getMatchColor } from "@/lib/utils";
import type { Movie } from "@/utils/api";
import RatingBadge from "./RatingBadge";

interface RecommendationCardProps {
  movie: Movie;
}

export default function RecommendationCard({ movie }: RecommendationCardProps) {
  const navigate = useNavigate();
  const percentage = movie.matchPercentage ?? 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const [liked, setLiked] = useState<"up" | "down" | null>(null);

  return (
    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 overflow-hidden animate-fade-in-up">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 md:w-56 flex-shrink-0">
          <div className="aspect-video sm:aspect-[3/4] bg-gradient-to-br from-purple-900/40 to-zinc-800/60 flex items-center justify-center overflow-hidden">
            {movie.poster ? (
              <img src={movie.poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-white/10">{movie.title?.[0] || "M"}</span>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        </div>

        <div className="flex-1 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white truncate">{movie.title}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {movie.year} &bull; {movie.duration} &bull; {movie.genre.join(", ")}
              </p>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative h-[80px] w-[80px]">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-zinc-800" />
                  <circle
                    cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
                    className={getMatchColor(percentage)}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-lg font-bold", getMatchColor(percentage))}>{percentage}%</span>
                </div>
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5">Match</span>
            </div>
          </div>

          {movie.recommendationReason && (
            <p className="text-xs text-zinc-400 mt-3 italic leading-relaxed">&ldquo;{movie.recommendationReason}&rdquo;</p>
          )}

          <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{movie.description}</p>

          <div className="flex items-center gap-2 mt-3">
            <RatingBadge rating={movie.rating} size="sm" />
            <span className="text-xs text-zinc-500">Directed by {movie.director}</span>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/50">
            <button onClick={() => navigate(`/movie/${movie.id}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors btn-press">
              <Eye className="h-3.5 w-3.5" />
              View Details
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors btn-press">
              <Bookmark className="h-3.5 w-3.5" />
              Save
            </button>
            <button
              onClick={() => setLiked(liked === "up" ? null : "up")}
              className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors btn-press", liked === "up" ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700")}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLiked(liked === "down" ? null : "down")}
              className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors btn-press", liked === "down" ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700")}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
